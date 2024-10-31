const { Sequelize, DataTypes } = require("sequelize");
const { db } = require("../config/dbConnection");

const userProfilePicModel = db.define("UserProfilePic", {
  file_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  upload_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users', // Reference to userModel
      key: 'id',        // Foreign key on userModel's 'id'
    },
  }
}, {
  timestamps: false,
});



userProfilePicModel.prototype.toJSON = function () {
    const profilePicObj = this.get();
    // Format upload_date to "YYYY-MM-DD"
    if (profilePicObj.upload_date) {
      profilePicObj.upload_date = new Date(profilePicObj.upload_date).toISOString().split('T')[0];
    }
    return profilePicObj;
  };

module.exports = userProfilePicModel;
