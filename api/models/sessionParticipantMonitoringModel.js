module.exports = (sequelize, DataTypes) => {
  const SessionParticipantMonitoring = sequelize.define(
    "sessionParticipantMonitoring",
    {
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
      teacherToken: {
        type: DataTypes.STRING,
      },
    }
  );
  return SessionParticipantMonitoring;
};
