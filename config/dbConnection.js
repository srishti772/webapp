const Sequelize = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || "test",
  process.env.MYSQL_USER || "root",
  process.env.MYSQL_PASSWORD || "root",
  {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: process.env.MYSQL_PORT || 3306,
    dialect: "mysql",
    logging: false,
  }
);

const checkDbConnection = async () => {
  return await sequelize.authenticate();
};

const syncDb = async () => {
  return await sequelize.sync({ alter: true });
};

module.exports = { checkDbConnection, db: sequelize, syncDb };
