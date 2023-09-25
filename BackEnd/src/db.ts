import { Sequelize } from "sequelize-typescript";
import config from "./utils/config";
const sequelize = new Sequelize({
  dialect: "postgres",
  database: config.dbName,
  password: config.dbPassword,
  username: config.dbUser,
  storage: ":memory:",
  models: [__dirname + "/models"],
});
const { User, Admin, Preset } = sequelize.models;
export { sequelize, User, Admin, Preset };
