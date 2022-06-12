module.exports = (sequelize, DataTypes) => {
  const SessionParticipantMonitoring = sequelize.define(
    "sessionParticipantMonitoring",
    {
      videoMonitoring: {
        type: DataTypes.STRING,
        allowNull: false
      },
      keyLogging: {
        type: DataTypes.STRING,
        allowNull: false
      },
      audioMonitoring: {
        type: DataTypes.STRING,
        allowNull: false
      },
      browserMonitoring: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isFlagged: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false
      },
    }
  );
  return SessionParticipantMonitoring;
};
