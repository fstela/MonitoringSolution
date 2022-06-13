import {v4 as uuidv4} from "uuid";
import EmailService from "../service/emailService";
const db = require("../models");

const Session = db.sessions;
const SessionParticipant = db.sessionParticipants;

const addSession = async (req, res) => {
  // @todo validare
  let info = {
    title: req.body.title,
    startTime: req.body.startTime,
    stopTime: req.body.stopTime, // timestamp sau format standar de data
    duration: req.body.duration,
    teacherToken: uuidv4()
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
  // session id din header
  // doar sesiunea ce are teacher token ca ala din authorization
  // validare 
  const participants = req.body.participants;
  const data  = participants.map(student => {
    return {
      studentToken: uuidv4(),
      email: student.email,
      status: student.status,
      session_id: student.id,
    }
  })

  // aici trb sa faci pt toti participantii sessionParticipantMonitoring
  
  await SessionParticipant.bulkCreate(data);
  res.status(201).send();
};


// inca o ruta, sendEmails. POST cu body empty.
// iei teacherToken din hear
// cauti sesiunea
// cauti participantii
// trimiti mailurile pt fiecare 

const sendEmails = (req, res) => {
  const token = req.headers['Authorization'];

  const session = await Session.findOne({where: {
    teacherToken: token
  }})

  if(session == null) {
    res.send(404).send();
    return;
  }

  const sessionParticipants = await SessionParticipant.findAll(({
    where: {
      session_id: session.id
    }
  }));

  if(sessionParticipants.length < 1) {
    res.status(401).send();
    return;
  }

  const emails = sessionParticipants.map(participant => {
    return {
      email: participant.email,
      subject: `New session ${session.title}`,
      text: `Your participation token is ${participant.studentToken}`
    }
  })
  await EmailService.sendEmails(emails);
  res.status(200).send();
}

module.exports = {
  addSession,
  getAllSessions,
  getSession,
  updateSession,
  deleteSession,
  getSessionParticipants,
  addSessionParticipant,
};
