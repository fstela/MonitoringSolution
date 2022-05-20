const db = require("../models");

const SessionParticipant = db.sessionParticipants;

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



module.exports = {
  getSessionParticipant,
  updateSessionParticipant,
  deleteSessionParticipant,
};
