module.exports = (sequelize, DataTypes) => {
  const SessionParticipant = sequelize.define("sessionParticipant", {
    studentToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
  });
  return SessionParticipant;
};
