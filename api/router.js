const multer = require("multer");
const sessionController = require("./controllers/sessionController");
const sessionParticipantController = require("./controllers/sessionParticipantController");
const sessionParticipantMonitoringController = require("./controllers/sessionParticipantMonitoringController");
const router = require("express").Router();

/**
 * Teacher routes --------------------------------------------
 */

/**
 * Session CRUD
 */
router.post("/sessions", sessionController.addSession);
router.get("/sessions", sessionController.getSession);
router.put("/sessions", sessionController.updateSession);
router.delete("/sessions", sessionController.deleteSession);

/**
 * Add participants
 */
router.post("/sessions/participants", sessionController.addSessionParticipant);

/**
 * List all participants
 */
router.get("/sessions/participants", sessionController.getSessionParticipants);

/**
 * Delete participant
 */
router.delete(
  "/participants/:id",
  sessionParticipantController.deleteSessionParticipant
);

/**
 * Get monitoring data of student
 * @todo
 */
router.get(
  "/sessions/monitoring/participants/:id",
  sessionParticipantMonitoringController.getParticipantMonitoring
);

/**
 * Get general monitoring data for session
 * @todo
 */
router.get(
  "/sessions/monitoring/participants",
  sessionParticipantMonitoringController.getParticipantMonitoring
);



/**
 * Student routes -----------------------------------------------
 */

/**
 *  Get current SessionParticipant
 */
router.get("/sessions/participant", sessionParticipantController.getSessionParticipant);

/**
 * Push monitoring data
 */
router.post("/monitoring", multer().single("v"), (req, res) =>
  sessionParticipantMonitoringController.postMonitoringData(req, res)
);

module.exports = router;
