const db = require("../models");

const SessionParticipantMonitoring = db.sessionParticipantMonitoring;

const getParticipantMonitoring = async (req, res) => {
  let id = req.params.id;
  let participantMonitoring = await SessionParticipantMonitoring.findOne({
    where: { id: id },
  });
  res.status(200).send(participantMonitoring);
};

module.exports = {
  getParticipantMonitoring,
};
