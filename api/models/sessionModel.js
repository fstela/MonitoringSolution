module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define("session", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.DATE,
    },
    stopTime: {
      type: DataTypes.DATE,
    },
    duration: {
      type: DataTypes.INTEGER,
    },
    teacherToken: {
      type: DataTypes.STRING,
    },
  });
  return Session;
};
