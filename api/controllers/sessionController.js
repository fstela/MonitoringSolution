const { v4: uuidv4 } = require('uuid');
const db = require("../models");
const EmailService = require("../service/emailService")
const Session = db.sessions;
const SessionParticipant = db.sessionParticipants;

const addSession = async (req, res) => {
  // @todo validare
  let info = {
    title: req.body.title,
    startTime: req.body.startTime,
    stopTime: req.body.stopTime, // timestamp sau format standar de data
    duration: req.body.duration,
    teacherToken: uuidv4() // trb sa-l faci tu cu uuid
  };
  // foloseste date fns
  const session = await Session.create(info);
  console.log(session);
  res.status(200).send(session);
};

// const getAllSessions = async (req, res) => {
//   let sessions = await Session.findAll({});
//   res.status(200).send(sessions);
// };

const getSession = async (req, res) => {
  // @todo nu arata teacher token
  let id = req.params.id; // e tokenul din header
  let session = await Session.findOne({ where: { teacherToken: id } });
  res.status(200).send(session);
};

const updateSession = async (req, res) => {
  // @todo poti schimba doar titlu, startdate,enddate, duration + validare
  let id = req.params.id; // e tokenul din header
  const session = await Session.update(req.body, { where: { id: id } });
  res.status(200).send(session);
};

const deleteSession = async (req, res) => {
  let id = req.params.id; // tokenul din token
  // @todo onDelete Cascade
  await Session.destroy({ where: { id: id } });
  res.status(200).send("session was deleted");
};

const getSessionParticipants = async (req, res) => {
  // @todo doar teacherul are voie sa faca asta
  // headerul Authorization din request. 
  // valoarea trebuie sa nu fie null si sa fie egala cu teachertoken din 
  // session-ul cerut
  let token = req.headers['authorization'];
  if(token === undefined) {
    res.status(401).send();
    return;
  }
  const session = await Session.findOne({
    where: { teacherToken: token }
  });

  if(!session) {
    res.status(401).send();
    return;
  }

  const sessionParticipants = await SessionParticipant.findAll(({
    where: {
      session_id: session.id
    }
  }));

  res.status(200).send(sessionParticipants);
};

const addSessionParticipant = async (req, res) => {
  
  // validare 

  let token = req.headers['authorization'];
  if(token === undefined) {
    res.status(401).send();
    return;
  }
  const session = await Session.findOne({
    where: { teacherToken: token }
  });

  if(!session) {
    res.status(401).send();
    return;
  }

  const participants = req.body;
  console.log(participants);
  const sessionParticipants  = participants.map(student => {
    return {
      studentToken: uuidv4(),
      email: student.email,
      status: "CREATED",
      session_id: session.id,
    }
  })

  // aici trb sa faci pt toti participantii sessionParticipantMonitoring
  
  await SessionParticipant.bulkCreate(sessionParticipants);
  await sendEmails(sessionParticipants, session);
  res.status(201).send();
};


// inca o ruta, sendEmails. POST cu body empty.
// iei teacherToken din hear
// cauti sesiunea
// cauti participantii
// trimiti mailurile pt fiecare 

const sendEmails = async (sessionParticipants, session) => {
  const emails = sessionParticipants.map(participant => {
    return {
      email: participant.email,
      subject: `Token for monitoring session [${session.title}]`,
      text: `Your participation token is ${participant.studentToken}`
    }
  })
  try {
  await EmailService.sendEmails(emails);
  } catch(err) {
    console.error("Email sending failed silently");
    console.error(err);
  }
}

module.exports = {
  addSession,
  getSession,
  updateSession,
  deleteSession,
  getSessionParticipants,
  addSessionParticipant,
};
