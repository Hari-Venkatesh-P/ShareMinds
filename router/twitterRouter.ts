import { Router } from "express";
import {
  getLatestTrends,
  getProfileDetails,
  getTimeLineTweets,
  getTweet,
  searchTweets,
} from "../service/twitterService";

export const twitterRouter = Router();
twitterRouter.get("/profile", getProfileDetails);
twitterRouter.get("/search", searchTweets);
twitterRouter.get("/timeline", getTimeLineTweets);
twitterRouter.get("/tweet", getTweet);
twitterRouter.get("/latest", getLatestTrends);
