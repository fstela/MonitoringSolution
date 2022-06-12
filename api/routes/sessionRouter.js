const sessionController = require("../controllers/sessionController");
const sessionParticipantController = require("../controllers/sessionParticipantController");
const sessionParticipantMonitoringController = require("../controllers/sessionParticipantMonitoringController");
const router = require("express").Router();

router.post("/sessions", sessionController.addSession);
// router.get("/sessions", sessionController.getAllSessions); // ?
router.get("/sessions", sessionController.getSession);
router.put("/sessions", sessionController.updateSession);
router.delete("/sessions", sessionController.deleteSession);

router.post(
  "/sessions/participants",
  sessionController.addSessionParticipant
);
router.get(
  "/sessions/participants",
  sessionController.getSessionParticipants
);
// router.put(
//   "/participants/:id",
//   sessionParticipantController.updateSessionParticipant
// );
router.delete(
  "/participants/:id",
  sessionParticipantController.deleteSessionParticipant
);
// router.get(
//   "/participants/:id",
//   sessionParticipantController.getSessionParticipant
// );

router.patch(
  "/participants/:id/monitoring",
  sessionParticipantController.addSessionParticipantMonitoring
);

router.get(
  "/participants/:id/monitoring",
  sessionParticipantMonitoringController.getParticipantMonitoring
)
module.exports = router;
