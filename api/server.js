const express = require("express");
const cors = require("cors");

const app = express();

var corOptions = {
  origin: "https://localhost:8081",
};

//moddleware
app.use(cors(corOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

//routers
const router = require("./routes/sessionRouter");
app.use("/api", router);

// test api

app.get("/", (req, res) => {
  res.json({ message: "helloo" });
});

//port
const PORT = process.env.PORT || 8080;

//server

app.listen(PORT, () => {
  console.log("server is running on port");
});
