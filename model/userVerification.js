const { Sequelize, DataTypes } = require("sequelize");
const { db } = require("../config/dbConnection");

const userVerification = db.define("userVerificationEmail", {
  token: {
    type: DataTypes.STRING, 
    allowNull: false,
  },
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users', // Reference to userModel
      key: 'id',        // Foreign key on userModel's 'id'
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
      notEmpty: true,
    },
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
  /**mailgunACK: {
    type: DataTypes.STRING, 
  },
  lastEmailSent: {
    type: DataTypes.DATE,
    },**/
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
