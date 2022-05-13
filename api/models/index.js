const dbConfig = require("../config/dbConfig.js");

const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("connected");
  })
  .catch((err) => {
    console.log("error" + err);
  });

const db = {};
db.Sequelize = Sequelize;

db.sequelize = sequelize;

db.sessions = require("./sessionModel.js")(sequelize, DataTypes);
db.users = require("./userModel.js")(sequelize, DataTypes);
db.teachers = require("./teacherModel.js")(sequelize, DataTypes);

db.sequelize.sync({ force: false }).then(() => {
  console.log("resync done");
});

db.teachers.hasMany(db.sessions, {
  foreignKey: "teacher_id",
  as: "session",
});

db.sessions.belongsTo(db.teachers, {
  foreignKey: "teacher_id",
  as: "teacher",
});

db.sessions.hasMany(db.users, {
  foreignKey: "session_id",
  as: "user",
});

db.users.belongsTo(db.sessions, {
  foreignKey: "session_id",
  as: "session",
});

module.exports = db;
