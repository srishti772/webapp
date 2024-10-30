const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const userProfilePicModel = require("../model/userProfilePicModel");
const { v4: uuidv4 } = require('uuid'); 

require("dotenv").config();
const getUserByEmail = async (email) => {
  try {
    const user = await userModel.findOne({
      where: { email },
    });
     return user;
  } catch (err) {
    const dbError = new Error(`Unable to fetch user`);
    dbError.statusCode = 503;
    throw dbError;
  }
};

const createUser = async (new_user) => {
  const existingUser = await getUserByEmail(new_user.email);
  if (existingUser) {
    const apiError = new Error("User already exists.");
    apiError.statusCode = 400;
    throw apiError;
  }
  try {
    const user = await userModel.create({
      first_name: new_user.first_name,
      last_name: new_user.last_name,
      password: await bcrypt.hash(new_user.password, 10),
      email: new_user.email,
    });
    return user.toJSON();
  } catch (err) {
    const dbError = new Error();
    dbError.message = err.message ||  "Unable to Create User";
    dbError.statusCode =err.statusCode ||  503;
    throw dbError;
  }
};

const getAUser = async (email) => {
  try {
    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
        const apiError = new Error("User does not exist.");
        apiError.statusCode = 404;
        throw apiError;
    }
    return existingUser;
  } catch (err) {
    const dbError = new Error();
    dbError.message = err.message ||  "Unable to Fetch User";
    dbError.statusCode =err.statusCode ||  503;
    throw dbError;
  }
};

const updateUser = async (email, user) => {
  try {
    const curruser = await getUserByEmail(email);
    if (!curruser) {
        const apiError = new Error("User does not exist.");
        apiError.statusCode = 404;
        throw apiError;
    }
    curruser.first_name = user.first_name ? user.first_name : curruser.first_name;
    curruser.last_name = user.last_name ? user.last_name : curruser.last_name;
    curruser.password = user.password? await bcrypt.hash(user.password, 10) : curruser.password;
    curruser.email = user.email ? user.email : curruser.email;
    curruser.account_updated=new Date();

    await curruser.save();
  } catch (err) {
    const dbError = new Error();
    dbError.message = err.message ||  "Unable to Update User";
    dbError.statusCode =err.statusCode ||  503;
    throw dbError;
  }
};

const uploadProfilePic = async(userEmail, file) =>{
  try{
    const existingUser = await getUserByEmail(userEmail);

  //const s3Client = new S3Client({ region: process.env.BUCKET_REGION });

  //testing client with credentials.. remove while deploying
  const s3Client = new S3Client({
    region: process.env.BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  const image_id=uuidv4();

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
 const data =  await s3Client.send(command);

  console.log("***S3", data);
  const metadata = await userProfilePicModel.create({
    file_name: file.originalname,
    url: `${process.env.BUCKET_NAME}/${existingUser.id}/${file.originalname}`,
    upload_date: new Date(),
    user_id: existingUser.id,
    id:image_id,
  }); 
  return metadata.toJSON();

} 
catch (err) {
  const s3Error = new Error();
  s3Error.message = err.message ||  "Unable to Upload Picture";
  s3Error.statusCode =err.statusCode ||  503;
  throw s3Error;
}
}

module.exports = {
  createUser,
  getAUser,
  updateUser,
  uploadProfilePic
};
