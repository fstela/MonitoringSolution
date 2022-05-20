const sessionController = require("../controllers/sessionController");
const sessionParticipantController = require("../controllers/sessionParticipantController");

const router = require("express").Router();

router.post("/sessions", sessionController.addSession);
router.get("/sessions", sessionController.getAllSessions);
router.get("/sessions/:id", sessionController.getSession);
router.put("/sessions/:id", sessionController.updateSession);
router.delete("/sessions/:id", sessionController.deleteSession);

router.post(
  "/sessions/:id/participants",
  sessionController.addSessionParticipant
);
router.get(
  "/sessions/:id/participants",
  sessionController.getSessionParticipants
);
router.put(
  "/participants/:id",
  sessionParticipantController.updateSessionParticipant
);
router.delete(
  "/participants/:id",
  sessionParticipantController.deleteSessionParticipant
);
router.get(
  "/participants/:id",
  sessionParticipantController.getSessionParticipant
);

module.exports = router;
