const express = require("express");
const cors = require("cors");
const {QueueService} = require("./service/queueService");

const router = require("./router");
const { saveMonitoringProcessingResult } = require("./controllers/sessionParticipantMonitoringController");
const app = express();

// middlewares
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json({limit: "100mb"}));
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api", router);

// test endpoint
app.get("/", (_, res) => {
  res.json({ message: "helloo" });
});

// start the web server
app.listen(8080, () => {
  console.log("server is running on port");
});

// start listening on queue
(async () => {
  const receiveingQueue = await QueueService.makeReceiveQueue();
  receiveingQueue.receive((message, ch) => {
    console.log("\n-- Received message from queue --\n", message.content.toString());
    try {
      ch.ack(message);
      const data = JSON.parse(message.content.toString())
      saveMonitoringProcessingResult(data)
    } catch(e) {
      console.log(`Failed to process queue message, invalid json format, error: ${e}`);
      return;
    }
  });

  // setInterval(() => {
  //   sendingQueue.send({
  //     video: "test.txt",
  //     audio: "test.txt",
  //     keys: ["a", "b", "CTRL", "v"],
  //     browser: ["http://google.ro", "http://wikipedia.com"],
  //   });
  // }, 1000);
})();
