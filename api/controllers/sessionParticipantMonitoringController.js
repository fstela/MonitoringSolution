const db = require("../models");

const SessionParticipantMonitoring = db.sessionParticipantMonitoring;

const getParticipantMonitoring = async (req, res) => {
  // din header iei authorization, asta o sa fie student tokenul
  // verifica daca token-ul este == cu studentTokenul
  // nu ai nevoie de id
  let id = req.params.id;
  let participantMonitoring = await SessionParticipantMonitoring.findOne({
    where: { id: id },
  });
  res.status(200).send(participantMonitoring);
};

module.exports = {
  getParticipantMonitoring,
};
