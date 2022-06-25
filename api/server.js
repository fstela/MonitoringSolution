const express = require("express");
const cors = require("cors");
const {QueueService} = require("./service/queueService");

const router = require("./routes/sessionRouter");
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
  receiveingQueue.receive((message) => {
    console.log("\n---\n", message.content.toString());
  });
  const sendingQueue = await QueueService.makeSendQueue();

  // setInterval(() => {
  //   sendingQueue.send({
  //     video: "test.txt",
  //     audio: "test.txt",
  //     keys: ["a", "b", "CTRL", "v"],
  //     browser: ["http://google.ro", "http://wikipedia.com"],
  //   });
  // }, 1000);
})();
