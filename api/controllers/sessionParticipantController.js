const db = require("../models");
const {extractTokenFromHeader} = require("../service/security");
const SessionParticipant = db.sessionParticipants;
const Session = db.sessions;

const getSessionParticipant = async (req,res) => {
  const token = extractTokenFromHeader(req);
  if (token === undefined) {
    res.status(401).send();
    return;
  }
  
  const sessionParticipant = await SessionParticipant.findOne({
    attributes: { exclude: ["studentToken"] },
    where: { studentToken: token },
    include: {
      model: Session,
      as: "session",
      attributes: {
        exclude: ["teacherToken"]
      }
    }
  })

  if(!sessionParticipant) {
    res.status(404).send();
    return;
  }

  res.status(200).send(sessionParticipant);
}


const deleteSessionParticipant = async (req, res) => {
  let token = extractTokenFromHeader(req);
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
  // getSessionParticipants,
  getSessionParticipant,
  deleteSessionParticipant
};
