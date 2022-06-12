module.exports = (sequelize, DataTypes) => {
  const SessionParticipantMonitoring = sequelize.define(
    "sessionParticipantMonitoring",
    {
      videoMonitoring: {
        type: DataTypes.STRING,
      },
      keyLogging: {
        type: DataTypes.STRING,
      },
      audioMonitoring: {
        type: DataTypes.STRING,
      },
      browserMonitoring: {
        type: DataTypes.STRING,
      },
      date: {
        type: DataTypes.STRING,
      },
    }
  );
  return SessionParticipantMonitoring;
};
