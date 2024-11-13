const { Sequelize, DataTypes } = require("sequelize");
const { db } = require("../config/dbConnection");

const userVerification = db.define("userVerificationEmail", {
  token: {
    type: DataTypes.STRING, 
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: {
      model: "users", 
      key: "id",
    },
    unique: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id']
    },
  ],
}

);



module.exports = userVerification;
