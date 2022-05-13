module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define("session", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.STRING,
    },
    stopTime: {
      type: DataTypes.STRING,
    },
    duration: {
      type: DataTypes.INTEGER,
    },
    token: {
      type: DataTypes.STRING,
    },
  });
  return Session;
};
