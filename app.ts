import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { twitterRouter } from "./router/twitterRouter";
import { redisClient } from "./utils/clientUtils";
import { PORT } from "./utils/envUtils";
import { logger } from "./utils/loggerUtils";

const app = express();
app.use(cors());
app.use(twitterRouter);

const server = http.createServer(app);
export const socket = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

redisClient.on("connect", () => {
  logger.info("Redis client connected");
});

server.listen(PORT, async () => {
  await redisClient.connect();
  logger.info(`Application started on PORT :  ${PORT}.`);
});
