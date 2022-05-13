const sessionController = require("../controllers/sessionController");
const userController = require("../controllers/userController");
const teacherController = require("../controllers/teacherController");

const router = require("express").Router();

router.post("/teachers", teacherController.addTeacher);
router.get("/teachers", teacherController.getAllTeachers);
router.get("/teachers/:id", teacherController.getTeacher);
router.post("/teachers/:id", teacherController.addTeacherSession);
router.get("/teachers/:id/sessions", teacherController.getTeacherSessions);

router.get("/sessions/", sessionController.getAllSessions);
router.get("/sessions/:id", sessionController.getSession);
router.post("/sessions/:id", sessionController.addSessionUser);
router.get("/sessions/:id/users", sessionController.getSessionUsers);

router.put("/sessions/:id", sessionController.updateSession);
router.delete("/sessions/:id", sessionController.deleteSession);

module.exports = router;
