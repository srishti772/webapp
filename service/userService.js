const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");

const getUserByEmail = async (email) => {
  try {
    const user = await userModel.findOne({
      where: { email },
    });
    return user;
  } catch (err) {
    console.error(err);
    throw new Error("Unable to fetch user by email");
  }
};

const createUser = async (new_user) => {
  const existingUser = await getUserByEmail(new_user.email);
  if (existingUser) {
    const apiError = new Error("User already exists.");
    apiError.statusCode = 409;
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

const getAUser = async (id) => {
  try {
    const user = await userModel.findByPk(id);
    if (!user) {
        const apiError = new Error("User not found.");
        apiError.statusCode = 404;
        throw apiError;
      }
    return user;
  } catch (err) {
    const dbError = new Error(`Unable to fetch user`);
    dbError.statusCode = 404;
    throw dbError;
  }
};

module.exports = {
  createUser,getAUser
};
