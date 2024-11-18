const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const logger = require("../config/logger/winston");
const crypto = require('crypto');

const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3Client = require("../config/s3Client");
const snsClient = require("../config/snsClient");
const {  PublishCommand } = require('@aws-sdk/client-sns');


const statsd = require("../config/statsD");
const userProfilePicModel = require("../model/userProfilePicModel");
const { v4: uuidv4 } = require("uuid");
const { performance } = require("perf_hooks");
const userVerification = require("../model/userVerification");

require("dotenv").config();

function generateVerificationCode(length = 12) {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

const getUserByEmail = async (email, metricKey) => {
  try {
    let start = performance.now();
    const user = await userModel.findOne({
      where: { email },
    });
    let duration = performance.now() - start;
    statsd.timing(`${metricKey}.getUserByEmail.Duration`, duration);
    logger.debug(`${metricKey}.getUserByEmail.Duration: ${duration}`);
    return user;
  } catch (err) {
    const dbError = new Error(`Unable to fetch user`);
    dbError.statusCode = 503;
    throw dbError;
  }
};

const getProfilePicByUserId = async (id, metricKey) => {
  try {
    const start = performance.now();

    const profilePic = await userProfilePicModel.findOne({
      where: { user_id: id },
    });
    const duration = performance.now() - start;
    statsd.timing(`${metricKey}.getProfilePicByUserId.Duration`, duration);
    logger.debug(`${metricKey}.getProfilePicByUserId.Duration: ${duration}`);

    return profilePic;
  } catch (err) {
    const dbError = new Error(`Unable to fetch profile picture`);
    dbError.statusCode = 503;
    throw dbError;
  }
};

const createUser = async (new_user, metricKey) => {
  const existingUser = await getUserByEmail(new_user.email, metricKey);
  if (existingUser) {
    const apiError = new Error("User already exists.");
    apiError.statusCode = 400;
    throw apiError;
  }
  try {
    const start = performance.now();
    const code=generateVerificationCode();
    const user = await userModel.create({
      first_name: new_user.first_name,
      last_name: new_user.last_name,
      password: await bcrypt.hash(new_user.password, 10),
      email: new_user.email,
      verified: false
    });

    

    const duration = performance.now() - start;
    statsd.timing(`${metricKey}.createUser.DBWriteTime`, duration);
    logger.debug(`${metricKey}.createUser.DBWriteTime: ${duration}`);


    await sendToSNS(user,code);
    
    return user.toJSON();
  } catch (err) {
    const dbError = new Error();
    dbError.message = err.message || "Unable to Create User";
    dbError.statusCode = err.statusCode || 503;
    throw dbError;
  }
};
const sendToSNS = async (user, code) => {
  try {

    

    const [verification, created] = await userVerification.upsert({
      user_id: user.id,
      email: user.email,
      token: await bcrypt.hash(code, 10),
      expiresAt: new Date(Date.now() + 2 * 60 * 1000)
    },
   );

    const verificationLink = `http://${process.env.BASE_URL}/user/verify?email=${user.email}&token=${code}`;

    const mailOptions = {
      to: user.email,
      subject: "Verify Your Email",
      html: `Follow the link below to verify your email address and complete the registration.
        This link expires in 2 minutes.
        ${verificationLink}`
      ,
    };

    const topic_arn = process.env.SNS_TOPIC_ARN;

    const params = {
      Message: JSON.stringify(mailOptions),
      TopicArn: topic_arn
    };
    
    const command = new PublishCommand(params);
    await snsClient.send(command);
    logger.debug(`Sent to SNS: ${params.Message}`);

    return params;  
  } catch (err) {
    const dbError = new Error();
    dbError.message = err.message || "Unable to send to SNS";
    dbError.statusCode = err.statusCode || 503;
    throw dbError;
  }
};

const getAUser = async (email, metricKey) => {
  try {
    const existingUser = await getUserByEmail(email, metricKey);

    if (!existingUser) {
      const apiError = new Error("User does not exist.");
      apiError.statusCode = 404;
      throw apiError;
    }
    return existingUser;
  } catch (err) {
    const dbError = new Error();
    dbError.message = err.message || "Unable to Fetch User";
    dbError.statusCode = err.statusCode || 503;
    throw dbError;
  }
};

const updateUser = async (email, user, metricKey) => {
  try {
    const curruser = await getUserByEmail(email, metricKey);
    if (!curruser) {
      const apiError = new Error("User does not exist.");
      apiError.statusCode = 404;
      throw apiError;
    }
    curruser.first_name = user.first_name
      ? user.first_name
      : curruser.first_name;
    curruser.last_name = user.last_name ? user.last_name : curruser.last_name;
    curruser.password = user.password
      ? await bcrypt.hash(user.password, 10)
      : curruser.password;
    curruser.email = user.email ? user.email : curruser.email;
    curruser.verified = user.verified ? user.verified : curruser.verified;

    curruser.account_updated = new Date();

    const start = performance.now();
    await curruser.save();
    const duration = performance.now() - start;
    statsd.timing(`${metricKey}.updateUser.DBUpdateTime`, duration);
    logger.debug(`${metricKey}.updateUser.DBUpdateTime: ${duration}`);
  } catch (err) {
    const dbError = new Error();
    dbError.message = err.message || "Unable to Update User";
    dbError.statusCode = err.statusCode || 503;
    throw dbError;
  }
};

const uploadProfilePic = async (userEmail, file, metricKey) => {
  try {
    const existingUser = await getUserByEmail(userEmail, metricKey);
    const profilePic = await getProfilePicByUserId(existingUser.id, metricKey);

    if (profilePic) {
      const apiError = new Error(
        "Profile picture already exists. Please delete to reupload."
      );
      apiError.statusCode = 400;
      throw apiError;
    }
    const image_id = uuidv4();

    const uploadParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: `${existingUser.id}/${file.originalname}`,
      Body: file.buffer,
      Metadata: {
        user_id: existingUser.id,
        id: image_id,
        user_email: existingUser.email,
      },
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(uploadParams);
    let start = performance.now();

    const data = await s3Client.send(command);

    let duration = performance.now() - start;
    statsd.timing(`${metricKey}.uploadProfilePic.S3UploadTime`, duration);
    logger.debug(`${metricKey}.uploadProfilePic.S3UploadTime: ${duration}`);

    start = performance.now();
    const metadata = await userProfilePicModel.create({
      file_name: file.originalname,
      url: `${process.env.BUCKET_NAME}/${existingUser.id}/${file.originalname}`,
      upload_date: new Date(),
      user_id: existingUser.id,
      id: image_id,
    });
    duration = Date.now() - start;
    statsd.timing(`${metricKey}.uploadProfilePic.DBWriteTime`, duration);
    logger.debug(`${metricKey}.uploadProfilePic.DBWriteTime: ${duration}`);
    return metadata.toJSON();
  } catch (err) {
    const s3Error = new Error();
    s3Error.message = err.message || "Unable to Upload Picture";
    s3Error.statusCode = err.statusCode || 503;
    throw s3Error;
  }
};

const getProfilePic = async (userEmail, metricKey) => {
  try {
    const existingUser = await getUserByEmail(userEmail, metricKey);

    const profilePic = await getProfilePicByUserId(existingUser.id, metricKey);

    if (!profilePic) {
      const apiError = new Error("Profile picture not found.");
      apiError.statusCode = 404;
      throw apiError;
    }

    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: `${existingUser.id}/${profilePic.file_name}`,
    });
    const start = performance.now();

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    }); //valid for 1 hour

    const duration = performance.now() - start;
    statsd.timing(`${metricKey}.getProfilePic.S3SignedUrlTime`, duration);
    logger.debug(`${metricKey}.getProfilePic.S3SignedUrlTime: ${duration}`);

    //profilePic.url = signedUrl;
    return profilePic;
  } catch (err) {
    const dbError = new Error();
    dbError.message = err.message || "Unable to retrieve profile picture.";
    dbError.statusCode = err.statusCode || 503;
    throw dbError;
  }
};

const deleteProfilePic = async (userEmail, metricKey) => {
  try {
    const existingUser = await getUserByEmail(userEmail, metricKey);

    const profilePic = await getProfilePicByUserId(existingUser.id, metricKey);

    if (!profilePic) {
      const apiError = new Error("Profile picture not found.");
      apiError.statusCode = 404;
      throw apiError;
    }
    /** Check oownership
    const headCommand = new HeadObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: `${existingUser.id}/${profilePic.file_name}`,
    });

    const headResponse = await s3Client.send(headCommand);

    if (headResponse.Metadata.user_id !== existingUser.id.toString()) {
      const permissionError = new Error("User is not authorized to delete this picture.");
      permissionError.statusCode = 403;
      throw permissionError;
    } **/

    const command = new DeleteObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: `${existingUser.id}/${profilePic.file_name}`,
    });
    let start = performance.now();

    await s3Client.send(command);

    let duration = performance.now() - start;
    statsd.timing(`${metricKey}.deleteProfilePic.S3DeleteTime`, duration);
    logger.debug(`${metricKey}.deleteProfilePic.S3DeleteTime: ${duration}`);

    start = performance.now();
    await userProfilePicModel.destroy({
      where: { user_id: existingUser.id },
    });

    duration = performance.now() - start;
    statsd.timing(`${metricKey}.deleteProfilePic.DBDeleteTime`, duration);
    logger.debug(`${metricKey}.deleteProfilePic.DBDeleteTime: ${duration}`);
  } catch (err) {
    const dbError = new Error();
    dbError.message = err.message || "Unable to retrieve profile picture.";
    dbError.statusCode = err.statusCode || 503;
    throw dbError;
  }
};

module.exports = {
  createUser,
  getAUser,
  updateUser,
  uploadProfilePic,
  getProfilePic,
  deleteProfilePic,
  sendToSNS,
  generateVerificationCode

};
