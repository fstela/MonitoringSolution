const Joi = require("joi");
const db = require("../models");
const {v4: uuid4} = require("uuid");
const StorageService = require("../service/storageService");
const { ProcessingQueue } = require("../service/queueService");
const SessionParticipant = db.sessionParticipants;
const SessionParticipantMonitoring = db.sessionParticipantMonitoring;

/** @todo upgrade this endpoint */
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

const monitoringDataSchema = Joi.object({
  keys: Joi.array().items(Joi.string()),
  browser: Joi.array().items(Joi.string()),
})

const postMonitoringData = async (req, res) => {
  
  const data = req.body;
  const validation = monitoringDataSchema.validate(data);
  if(validation.error) {
    res.status(401).send(validation.error);
    return;
  }

  // validate sessionp id
  
  let token = req.headers["authorization"];
  if (token === undefined) {
    res.status(401).send();
    return;
  }
  const sessionParticipant = await SessionParticipant.findOne({
    where: { studentToken: token },
  });

  if (!sessionParticipant) {
    res.status(401).send();
    return;
  }

  const fileName = `${sessionParticipant.id}/${uuid4()}.webm`;

  try {
    await StorageService.saveFile(fileName, req.file.buffer)
  } catch(e) {
    console.log(`Failed to upload file, error ${e}`, e);
    res.status(500).send();
    return;
  }

  data.video = fileName;

  const sv = new ProcessingQueue();
  const queue = await sv.getInstance();

  try {
    await queue.send({...data, sessionParticipantId: sessionParticipant.id});
  } catch(e) {
    console.log(`Failed to push to queue, body: ${data}, error ${e}`);
    res.status(500).send();
    return;
  }

  res.status(200).send();
}

/**
 * Used for queue
 */

const monitoringResultSchema = Joi.object({
  data: Joi.object({
    keys: Joi.array().items(Joi.string()).required(),
    browser: Joi.array().items(Joi.string()).required(),
    video: Joi.string().required(),
    sessionParticipantId: Joi.number().required()
  }),
  results: {
    audio: Joi.boolean().required(),
    video: Joi.boolean().required(),
    keys: Joi.boolean().required(),
    browser: Joi.boolean().required(),
  }
})

const saveMonitoringProcessingResult = async (message) => {
  const validation = monitoringResultSchema.validate(message)
  
  if(validation.error) {
    console.log("Invalid data format received from queue", validation.error);
    return;
  }

  const sessionParticipant = await SessionParticipant.findOne({
    where: {
      id: message.data.sessionParticipantId  
    }
  })

  if(!sessionParticipant) {
    console.log("Invalid session participant received from queue");
    return;
  }

  const data = {
    videoFilePath: message.data.video,
    loggedKeys: Buffer.from(JSON.stringify(message.data.keys)).toString('base64'),
    browserData: Buffer.from(JSON.stringify(message.data.browser)).toString('base64'),
    isAudioFlagged: message.results.audio,
    isVideoFlagged: message.results.video,
    isBrowserFlagged: message.results.browser,
    isKeysFlagged: message.results.keys,
    date: new Date().toISOString(),
    session_participant_id: sessionParticipant.id
  }

  await SessionParticipantMonitoring.create(data)
}

module.exports = {
  getParticipantMonitoring,
  postMonitoringData,
  saveMonitoringProcessingResult
};
