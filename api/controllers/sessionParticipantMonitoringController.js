const Joi = require("joi");
const db = require("../models");
const { v4: uuid4 } = require("uuid");
const StorageService = require("../service/storageService");
const { ProcessingQueue } = require("../service/queueService");
const SessionParticipant = db.sessionParticipants;
const SessionParticipantMonitoring = db.sessionParticipantMonitoring;
const Session = db.sessions;
const { extractTokenFromHeader } = require("../service/security");

const getParticipantMonitoring = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.status(401).send();
    return;
  }
  const sessionParticipant = await SessionParticipant.findOne({
    where: { id: id },
  });

  if (!sessionParticipant) {
    res.status(401).send();
    return;
  }

  const sessionParticipantMonitorings =
    await SessionParticipantMonitoring.findAll({
      where: { sessionParticipant: sessionParticipant.id },
    });

  if (!sessionParticipantMonitorings) {
    res.status(200).send([]);
    return;
  }
  const result = {
    recordings: [],
    keys: [],
    browser: [],
  };
  sessionParticipantMonitorings.forEeach((spm) => {
    result.recordings.push({
      url: spm.videoFilePath,
      date: spm.createdAt,
      id: spm.id,
      a: spm.isAudioFlagged,
      v: spm.isVideoFlagged,
    });
    result.keys.push({
      date: spm.createdAt,
      text: "xx",
      flagged: spm.isKeysFlagged,
    });
    result.browser.push({
      date: spm.createdAt,
      text: "cc",
      flagged: spm.isBrowserFlagged,
    });
  });

  res.status(200).send(result);
};

const monitoringDataSchema = Joi.object({
  keys: Joi.array().items(Joi.string()),
  browser: Joi.array().items(Joi.string()),
});

const getSessionMonitoring = async (req, res) => {
  let token = extractTokenFromHeader(req);
  if (token === undefined) {
    res.status(401).send();
    return;
  }
  const session = await Session.findOne({ where: { teacherToken: token } });
  if (!session) {
    res.status(401).send();
    return;
  }

  const graph = await db.sequelize.query(
    `select UNIX_TIMESTAMP(sm.createdAt) as date, count(sm.id) as value from sessionParticipantMonitorings sm
    join sessionParticipants sp on sp.id = sm.session_participant_id
    join sessions s on sp.session_id = s.id
    where s.id = ${session.id} and (isAudioFlagged is true
                                              or isBrowserFlagged is true
                                              or isKeysFlagged is true
                                              or isVideoFlagged is true)
    group by sm.createdAt;`,
    { raw: true, type: "SELECT" }
  );

  const participants = await db.sequelize.query(
    `select sp.id as id,
      sp.email as email,
      UNIX_TIMESTAMP(MIN(sm.createdAt)) as startedTime,
      SUM(sm.isVideoFlagged) as v,
      SUM(sm.isAudioFlagged) as a,
      SUM(sm.isKeysFlagged) as k,
      SUM(sm.isBrowserFlagged) as b
    from sessionParticipantMonitorings sm
    join sessionParticipants sp on sp.id = sm.session_participant_id
    join sessions s on sp.session_id = s.id
    where s.id = ${session.id}
    group by sp.id`,
    { raw: true, type: "SELECT" }
  );

  const results = {
    graph,
    participants,
  };

  res.status(200).send(results);
};

const postMonitoringData = async (req, res) => {
  const data = req.body;
  const validation = monitoringDataSchema.validate(data);
  if (validation.error) {
    res.status(401).send(validation.error);
    return;
  }

  let token = extractTokenFromHeader(req);
  if (token === undefined) {
    res.status(401).send();
    return;
  }
  const sessionParticipant = await SessionParticipant.findOne({
    where: { studentToken: token },
    include: {
      model: Session,
      as: "session",
    },
  });

  if (!sessionParticipant) {
    res.status(401).send();
    return;
  }

  const fileName = `${sessionParticipant.id}/${uuid4()}.webm`;

  try {
    await StorageService.saveFile(fileName, req.file.buffer);
  } catch (e) {
    console.log(`Failed to upload file, error ${e}`, e);
    res.status(500).send();
    return;
  }

  data.video = fileName;

  const sv = new ProcessingQueue();
  const queue = await sv.getInstance();

  data.browser = {
    tracked_urls: data.browser,
    allowed_urls: [],
  };

  if (sessionParticipant.session && sessionParticipant.session.allowedUrls) {
    try {
      data.allowed_urls = JSON.parse(sessionParticipant.session.allowedUrls);
    } catch {
      console.log("Failed to parse allowed urls");
    }
  }

  try {
    await queue.send({ ...data, sessionParticipantId: sessionParticipant.id });
  } catch (e) {
    console.log(`Failed to push to queue, body: ${data}, error ${e}`);
    res.status(500).send();
    return;
  }

  res.status(200).send();
};

/**
 * Used for queue
 */

const monitoringResultSchema = Joi.object({
  data: Joi.object({
    keys: Joi.array().items(Joi.string()).required(),
    browser: Joi.object({
      allowed_urls: Joi.array().items(Joi.string()).required(),
      tracked_urls: Joi.array().items(Joi.string()).required(),
    }),
    video: Joi.string().required(),
    sessionParticipantId: Joi.number().required(),
  }),
  results: {
    audio: Joi.boolean().required(),
    video: Joi.boolean().required(),
    keys: Joi.boolean().required(),
    browser: Joi.boolean().required(),
  },
});

const saveMonitoringProcessingResult = async (message) => {
  const validation = monitoringResultSchema.validate(message);

  if (validation.error) {
    console.log("Invalid data format received from queue", validation.error);
    return;
  }

  const sessionParticipant = await SessionParticipant.findOne({
    where: {
      id: message.data.sessionParticipantId,
    },
  });

  if (!sessionParticipant) {
    console.log("Invalid session participant received from queue");
    return;
  }

  const data = {
    videoFilePath: message.data.video,
    loggedKeys: Buffer.from(JSON.stringify(message.data.keys)).toString(
      "base64"
    ),
    browserData: Buffer.from(JSON.stringify(message.data.browser)).toString(
      "base64"
    ),
    isAudioFlagged: message.results.audio,
    isVideoFlagged: message.results.video,
    isBrowserFlagged: message.results.browser,
    isKeysFlagged: message.results.keys,
    date: new Date().toISOString(),
    session_participant_id: sessionParticipant.id,
  };

  try {
    await SessionParticipantMonitoring.create(data);
  } catch (e) {
    console.log("Can't save queue result in db", e);
  }
};

module.exports = {
  getSessionMonitoring,
  getParticipantMonitoring,
  postMonitoringData,
  saveMonitoringProcessingResult,
};
