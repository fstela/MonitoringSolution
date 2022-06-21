const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const db = require("../models");
const EmailService = require("../service/emailService");
const Session = db.sessions;
const SessionParticipant = db.sessionParticipants;
const helpers = require("../helpers");

const sessionSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().required(),
  duration: Joi.number().integer().min(5).max(200).required(),
});

const addSession = async (req, res) => {
  req.body.startTime = new Date(
    helpers.transformToLocalTime(parseInt(req.body.startTime))
  );
  req.body.endTime = new Date(
    helpers.transformToLocalTime(parseInt(req.body.endTime))
  );

  const validationResult = sessionSchema.validate(req.body);
  if (validationResult.error !== undefined) {
    res.status(400).json({
      error: helpers.collectValidationError(validationResult.error),
    });
    return;
  }

  try {
    let info = {
      title: req.body.title,
      startTime: req.body.startTime,
      stopTime: req.body.endTime,
      duration: req.body.duration,
      teacherToken: uuidv4(),
    };
    const session = await Session.create(info);
    res.status(200).send(session);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};

// const getAllSessions = async (req, res) => {
//   let sessions = await Session.findAll({});
//   res.status(200).send(sessions);
// };

const getSession = async (req, res) => {
  let token = req.headers["authorization"];
  if (token === undefined) {
    res.status(401).send();
    return;
  }
  let session = await Session.findOne({
    attributes: { exclude: ["teacherToken"] },
    where: { teacherToken: token },
  });
  res.status(200).send(session);
};

const updateSession = async (req, res) => {
  let token = req.headers["authorization"];
  if (token === undefined) {
    res.status(401).send();
    return;
  }

  if (req.body.teacherToken == null) {
    req.body.startTime = new Date(
      helpers.transformToLocalTime(parseInt(req.body.startTime))
    );
    req.body.endTime = new Date(
      helpers.transformToLocalTime(parseInt(req.body.endTime))
    );

    const validationResult = sessionSchema.validate(req.body);
    if (validationResult.error !== undefined) {
      res.status(400).json({
        error: helpers.collectValidationError(validationResult.error),
      });
      return;
    }
    try {
      let info = {
        title: req.body.title,
        startTime: req.body.startTime,
        stopTime: req.body.endTime,
        duration: req.body.duration,
      };
      await Session.update(info, {
        where: { teacherToken: token },
      });
      res.status(200).send();
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  } else {
    res.status(401).send();
    return;
  }
};

const deleteSession = async (req, res) => {
  let token = req.headers["authorization"];
  if (token === undefined) {
    res.status(401).send();
    return;
  }

  await Session.destroy({ where: { teacherToken: token } });
  res.status(200).send("session was deleted");
};

const getSessionParticipants = async (req, res) => {
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

  const sessionParticipants = await SessionParticipant.findAll({
    where: {
      session_id: session.id,
    },
  });

  res.status(200).send(sessionParticipants);
};

const addSessionParticipant = async (req, res) => {
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

  const participants = req.body;
  console.log(participants);
  const sessionParticipants = participants.map((student) => {
    return {
      studentToken: uuidv4(),
      email: student.email,
      status: "CREATED",
      session_id: session.id,
    };
  });

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
  const emails = sessionParticipants.map((participant) => {
    return {
      email: participant.email,
      subject: `Token for monitoring session [${session.title}]`,
      text: `Your participation token is ${participant.studentToken}`,
    };
  });
  try {
    await Email
    Service.sendEmails(emails);
  } catch (err) {
    console.error("Email sending failed silently");
    console.error(err);
  }
};

module.exports = {
  addSession,
  getSession,
  updateSession,
  deleteSession,
  getSessionParticipants,
  addSessionParticipant,
};
