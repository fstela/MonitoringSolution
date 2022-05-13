const db = require("../models");

const Session = db.sessions;
const User = db.users;

const getAllSessions = async (req, res) => {
  let sessions = await Session.findAll({});
  res.status(200).send(sessions);
};

const getSession = async (req, res) => {
  let id = req.params.id;
  let session = await Session.findOne({ where: { id: id } });
  res.status(200).send(session);
};

const updateSession = async (req, res) => {
  let id = req.params.id;
  const session = await Session.update(req.body, { where: { id: id } });
  res.status(200).send(session);
};

const deleteSession = async (req, res) => {
  let id = req.params.id;
  await Session.destroy({ where: { id: id } });
  res.status(200).send("session was deleted");
};

const getSessionUsers = async (req, res) => {
  let id = req.params.id;
  const data = await Session.findAll({
    include: [
      {
        model: User,
        as: "user",
      },
    ],
    where: { id: id },
  });
  res.status(200).send(data);
};

const addSessionUser = async (req, res) => {
  let info = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    session_id: req.params.id,
  };

  const user = await User.create(info);
  res.status(200).send(user);
};



module.exports = {
  getAllSessions,
  getSession,
  updateSession,
  deleteSession,
  getSessionUsers,
  addSessionUser,
};
