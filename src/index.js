const express = require("express");

const amqlib = require("amqplib");

const { ServerConfig, Queue } = require("./config");
const apiRoutes = require("./routes");
const CRON = require("./utils/common/cron-jobs.js");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRoutes);

app.listen(ServerConfig.PORT, async () => {
  console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
  CRON();
  await Queue.connectRabbitMQ();
  console.log("queue connected");
});
