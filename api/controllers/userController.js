const db = require("../models");

const User = db.users;



const getAllUsers = async (req, res) => {
  const users = await User.findAll({});
  console.log("*****" + users);
  res.status(200).send(users);
};

module.exports = {
  getAllUsers,
};
