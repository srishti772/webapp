const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3Client = require( "../config/s3Client");

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

const getProfilePicByUserId = async (id) => {
  try {
     const profilePic = await userProfilePicModel.findOne({
      where: { user_id: id }
    });
     return profilePic;
  } catch (err) {
    const dbError = new Error(`Unable to fetch profile picture`);
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
    const profilePic = await getProfilePicByUserId(existingUser.id);
    
    if (profilePic) {
      const apiError = new Error("Profile picture already exists. Please delete to reupload.");
      apiError.statusCode = 400;
      throw apiError;
    }
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



const getProfilePic = async (userEmail) => {
  try {
    const existingUser = await getUserByEmail(userEmail);
  
    const profilePic = await getProfilePicByUserId(existingUser.id);
    
    if (!profilePic) {
      const apiError = new Error("Profile picture not found.");
      apiError.statusCode = 404;
      throw apiError;
    }

    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: `${existingUser.id}/${profilePic.file_name}`,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); //valid for 1 hour
    profilePic.url = signedUrl;
    return profilePic;
    
    
  } catch (err) {
    const dbError = new Error();
    dbError.message = err.message || "Unable to retrieve profile picture.";
    dbError.statusCode = err.statusCode || 503;
    throw dbError;
  }
};

const deleteProfilePic = async (userEmail) => {
  try {
    const existingUser = await getUserByEmail(userEmail);
  
    const profilePic = await getProfilePicByUserId(existingUser.id);
    
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

    await s3Client.send(command);

    await userProfilePicModel.destroy({
      where: { user_id: existingUser.id },
    });

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
  deleteProfilePic
};
