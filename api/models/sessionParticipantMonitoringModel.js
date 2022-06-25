module.exports = (sequelize, DataTypes) => {
  const SessionParticipantMonitoring = sequelize.define(
    "sessionParticipantMonitoring",
    {
      videoFilePath: {
        type: DataTypes.STRING,
        allowNull: false
      },
      loggedKeys: {
        type: DataTypes.STRING,
        allowNull: false
      },
      browserData: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isAudioFlagged: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isVideoFlagged: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isBrowserFlagged: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isKeysFlagged: {
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
