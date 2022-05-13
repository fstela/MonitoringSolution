module.exports = (sequelize, DataTypes) => {
  const Teacher = sequelize.define("teacher", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
  });
  return Teacher;
};
