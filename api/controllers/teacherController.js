const db = require("../models");

const Teacher = db.teachers;
const Session = db.sessions;

const addTeacher = async (req, res) => {
  let info = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };
  const teacher = await Teacher.create(info);
  console.log(teacher);
  res.status(200).send(teacher);
};

const addTeacherSession = async (req, res) => {
  let info = {
    title: req.body.title,
    startTime: req.body.startTime,
    stopTime: req.body.stopTime,
    duration: req.body.duration,
    token: req.body.token,
    teacher_id: req.params.id,
  };

  const session = await Session.create(info);
  res.status(200).send(session);
  console.log(session);
};

const getAllTeachers = async (req, res) => {
  const teachers = await Teacher.findAll({});
  console.log("*****" + teachers);
  res.status(200).send(teachers);
};

const getTeacher = async (req, res) => {
  let id = req.params.id;
  let teacher = await Teacher.findOne({ where: { id: id } });
  res.status(200).send(teacher);
};

const getTeacherSessions = async (req, res) => {
  const data = await Teacher.findAll({
    include: [
      {
        model: Session,
        as: "session",
      },
    ],
    where: { id: req.params.id },
  });
  res.status(200).send(data);
};

module.exports = {
  addTeacher,
  addTeacherSession,
  getAllTeachers,
  getTeacher,
  getTeacherSessions,
};
