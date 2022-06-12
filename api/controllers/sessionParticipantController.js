const db = require("../models");

const SessionParticipant = db.sessionParticipants;
const SessionParticipantMonitoring = db.sessionParticipantMonitoring;

// doar daca token-ul din header  === teacherToken-ul sessiuni

const getSessionParticipant = async (req, res) => {
  let id = req.params.id;
  let sessionParticipant = await SessionParticipant.findOne({
    where: { id: id },
  });
  res.status(200).send(sessionParticipant);
};

const updateSessionParticipant = async (req, res) => {
  let id = req.params.id;
  const sessionParticipant = await SessionParticipant.update(req.body, {
    where: { id: id },
  });
  res.status(200).send(sessionParticipant);
};

const deleteSessionParticipant = async (req, res) => {
  let id = req.params.id;
  await SessionParticipant.destroy({ where: { id: id } });
  res.status(200).send("Participant was deleted");
};


// trb sa se faca cand se adauga participantii
const addSessionParticipantMonitoring = async (req, res) => {
  let info = {
    videoMonitoring: req.body.videoMonitoring,
    keyLogging: req.body.keyLogging,
    audioMonitoring: req.body.audioMonitoring,
    browserMonitoring: req.body.browserMonitoring,
    date: req.body.date,
    sessionParticipant_id: req.params.id,
  };

  const sessionParticipantMonitoring =
    await SessionParticipantMonitoring.create(info);
  res.status(200).send(sessionParticipantMonitoring);
};

module.exports = {
  getSessionParticipant,
  updateSessionParticipant,
  deleteSessionParticipant,
  addSessionParticipantMonitoring,
};
