module.exports = (sequelize, DataTypes) => {
  const Teacher = sequelize.define("teacher", {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  return Teacher;
};
