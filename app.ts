import express from "express";
import { createClient } from "redis";
import { twitterRouter } from "./router/twitterRouter";
import { redisClient } from "./utils/clientUtils";
import { PORT } from "./utils/envUtils";

const app = express();

app.use(twitterRouter);
app.listen(PORT, async () => {
  await redisClient.connect();
  console.log(`Application started on PORT :  ${PORT}.`);
});
