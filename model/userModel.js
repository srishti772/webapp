const { Sequelize, DataTypes } = require("sequelize");
const { db } = require("../config/dbConnection");
const userProfilePicModel = require("./userProfilePicModel");
const userVerification = require("./userVerification");

const userModel = db.define(
  "users",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    verified: { 
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, 
    },
   
    account_created: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    account_updated: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    defaultScope: {
      attributes: { exclude: ["password", "verified"] },
    },
 
  }
);

userModel.prototype.toJSON = function () {
  const userObj = this.get();
  delete userObj.password;
  delete userObj.verified;
  return userObj;
};

userModel.hasOne(userProfilePicModel, { foreignKey: "user_id", foreignKeyConstraint: true });
userModel.hasOne(userVerification, { foreignKey: "user_id", foreignKeyConstraint: true });


userModel.addScope('withAllDetails', {
  attributes: { include: ['password', 'verified'] },  
});

module.exports = userModel;
