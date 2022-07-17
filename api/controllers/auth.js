const Joi = require("joi");
const { generateJwt } = require("../service/security");
const db = require("../models");
const Session = db.sessions;
const SessionParticipant = db.sessionParticipants;

const AuthSchema = Joi.object({
  token: Joi.string().required(),
  type: Joi.string().valid("teacher", "student").required(),
});

const auth = async (req, res) => {
  const validate = AuthSchema.validate(req.body);

  if (validate.error) {
    res.status(401).send();
    return;
  }

  if (req.body.type === "teacher") {
    const session = await Session.findOne({
      where: { teacherToken: req.body.token },
    });
    if (session) {
      res.status(200).send({ jwt: generateJwt(req.body.token) });
      return;
    }
  }

  if (req.body.type === "student") {
    const sessionParticipant = await SessionParticipant.findOne({
      where: { studentToken: req.body.token },
    });
    if (sessionParticipant) {
      res.status(200).send({ jwt: generateJwt(req.body.token) });
      return;
    }
  }

  res.status(401).send();
};

module.exports = {
  auth,
};
