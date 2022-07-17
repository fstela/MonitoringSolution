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

  const data = await db.sequelize.query(
    `select sm.id, UNIX_TIMESTAMP(sm.createdAt) as date,
      sm.videoFilePath as url,
      sm.isVideoFlagged as v,
      sm.isAudioFlagged as a,
      sm.isKeysFlagged as k,
      sm.isBrowserFlagged as b, browserData, loggedKeys from sessionParticipantMonitorings sm
    join sessionParticipants sp on sp.id = sm.session_participant_id
    where sp.id = ${sessionParticipant.id} order by sm.createdAt`,
    { raw: true, type: "SELECT" }
  );

  data.map(row => {
    try {
      row.browserData = JSON.parse(row.browserData)
    } catch(e) {
      console.log("failed to parse json of browserData, ", e)
      row.browserData = undefined
    }
    try {
      row.loggedKeys = JSON.parse(row.loggedKeys)
    } catch(e) {
      console.log("failed to parse json of loggedKeys, ", e)
      row.loggedKeys = undefined
    }
  });


  res.status(200).send(data);
};

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
      CAST(SUM(sm.isVideoFlagged) AS int) as v,
      CAST(SUM(sm.isAudioFlagged) AS int) as a,
      CAST(SUM(sm.isKeysFlagged) AS int) as k,
      CAST(SUM(sm.isBrowserFlagged) AS int) as b
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


const monitoringDataSchema = Joi.object({
  keys: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  browser: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
});


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
  data.browser = data.browser ?? [];
  data.keys = data.keys ?? [];
  !Array.isArray(data.browser) && (data.browser = [data.browser]);
  !Array.isArray(data.keys) && (data.keys = [data.keys]);
  data.browser = {
    tracked_urls: data.browser,
    allowed_urls: [],
  };

  if (sessionParticipant.session && sessionParticipant.session.allowedUrls) {
    try {
      data.browser.allowed_urls = JSON.parse(sessionParticipant.session.allowedUrls);
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
    browser: Joi.array().items(Joi.string()).required(),
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
    loggedKeys: JSON.stringify(message.data.keys),
    browserData: JSON.stringify(message.data.browser),
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
