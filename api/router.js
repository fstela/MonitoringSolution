const multer = require("multer");
const sessionController = require("./controllers/sessionController");
const sessionParticipantController = require("./controllers/sessionParticipantController");
const sessionParticipantMonitoringController = require("./controllers/sessionParticipantMonitoringController");
const router = require("express").Router();
const authController = require("./controllers/auth")

/**
 * JWT Auth
 */
router.post("/auth", authController.auth)

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
  "/sessions/participants/:id",
  sessionParticipantController.deleteSessionParticipant
);

/**
 * Get monitoring data of student
 */
router.get(
  "/sessions/monitoring/participants/:id",
  sessionParticipantMonitoringController.getParticipantMonitoring
);

/**
 * Get general monitoring data for session
 */
router.get(
  "/sessions/monitoring/participants",
  sessionParticipantMonitoringController.getSessionMonitoring
);

/**
 * Update allowed urls
 */
router.post("/sessions/allowed-urls", sessionController.updateAllowedUrls)


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
