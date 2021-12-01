import { Router } from "express";
import {
  callbackAuthorization,
  getLatestTrends,
  getProfileDetails,
  getTimeLineTweets,
  getTweet,
  makeAuthorizationRequest,
  searchTweets,
} from "../service/twitterService";

export const twitterRouter = Router();
twitterRouter.get("/profile", getProfileDetails);
twitterRouter.get("/search", searchTweets);
twitterRouter.get("/timeline", getTimeLineTweets);
twitterRouter.get("/tweet", getTweet);
twitterRouter.get("/latest", getLatestTrends);
twitterRouter.get("/authorize", makeAuthorizationRequest);
twitterRouter.get("/callback", callbackAuthorization);
