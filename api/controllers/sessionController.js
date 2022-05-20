const db = require("../models");

const Session = db.sessions;
const SessionParticipant = db.sessionParticipants;

const addSession = async (req, res) => {
  let info = {
    title: req.body.title,
    startTime: req.body.startTime,
    stopTime: req.body.stopTime,
    duration: req.body.duration,
    teacherToken: req.body.teacherToken,
  };
  const session = await Session.create(info);
  console.log(session);
  res.status(200).send(session);
};

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

const getSessionParticipants = async (req, res) => {
  let id = req.params.id;
  const data = await Session.findAll({
    include: [
      {
        model: SessionParticipant,
        as: "sessionParticipant",
      },
    ],
    where: { id: id },
  });
  res.status(200).send(data);
};

const addSessionParticipant = async (req, res) => {
  let info = {
    studentToken: req.body.studentToken,
    email: req.body.email,
    status: req.body.status,
    session_id: req.params.id,
  };

  const sessionParticipant = await SessionParticipant.create(info);
  res.status(200).send(sessionParticipant);
};

module.exports = {
  addSession,
  getAllSessions,
  getSession,
  updateSession,
  deleteSession,
  getSessionParticipants,
  addSessionParticipant,
};
