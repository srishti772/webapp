const { Sequelize, DataTypes } = require("sequelize");
const { db } = require("../config/dbConnection");

const userModel = db.define(
  "user",
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
      attributes: { exclude: ["password"] },
    },
 
  }
);

userModel.prototype.toJSON = function () {
  const userObj = this.get();
  delete userObj.password;
  return userObj;
};

userModel.addScope('withPassword', {
  attributes: { include: ['password'] },  
});

module.exports = userModel;
