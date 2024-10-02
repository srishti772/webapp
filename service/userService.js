const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");

const getUserByEmail = async (email) => {
  try {
    const user = await userModel.findOne({
      where: { email },
    });
  

    return user;
  } catch (err) {
    const dbError = new Error(`Unable to fetch user`);
    dbError.statusCode = 404;
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
    const dbError = new Error("Unable to create user");
    dbError.statusCode = 400;
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
    const dbError = new Error(`Unable to fetch user`);
    dbError.statusCode = 404;
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
    const dbError = new Error("Unable to update user");
    dbError.statusCode = 400;
    throw dbError;
  }
};

module.exports = {
  createUser,
  getAUser,
  updateUser,
};
