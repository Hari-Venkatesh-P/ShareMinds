import express from "express";
import { twitterRouter } from "./router/twitterRouter";
import { PORT } from "./utils/envUtils";

const app = express();

app.use(twitterRouter);
app.listen(PORT, () => {
  console.log(`Application started on PORT :  ${PORT}.`);
});
