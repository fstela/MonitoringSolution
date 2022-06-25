const db = require("../models");

const SessionParticipant = db.sessionParticipants;
const Session = db.sessions;
// doar daca token-ul din header  === teacherToken-ul sessiuni

const getSessionParticipant = async (req, res) => {
  let token = req.headers["authorization"];
  if (token === undefined) {
    res.status(401).send();
    return;
  }
  const session = await Session.findOne({
    where: { teacherToken: token },
  });
  if (!session) {
    res.status(401).send();
    return;
  }
  try {
    let sessionParticipant = await SessionParticipant.findOne({
      attributes: { exclude: ["studentToken"] },
      where: { session_id: session.id, id: req.params.id },
    });
    res.status(200).send(sessionParticipant);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};

const updateSessionParticipant = async (req, res) => {
  let id = req.params.id;
  const sessionParticipant = await SessionParticipant.update(req.body, {
    where: { id: id },
  });
  res.status(200).send(sessionParticipant);
};

const deleteSessionParticipant = async (req, res) => {
  let token = req.headers["authorization"];
  if (token === undefined) {
    res.status(401).send();
    return;
  }
  const session = await Session.findOne({
    where: { teacherToken: token },
  });
  if (!session) {
    res.status(401).send();
    return;
  }
  try {
    await SessionParticipant.destroy({
      where: { session_id: session.id, id: req.params.id },
    });
    res.status(200).send("Participant was deleted");
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};



module.exports = {
  getSessionParticipant,
  updateSessionParticipant,
  deleteSessionParticipant
};
