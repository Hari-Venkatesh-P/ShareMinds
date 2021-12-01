import { createClient } from "redis";
import { TwitterApi } from "twitter-api-v2";
import { APPLICATION_TOKENS, REDIS_HOST, REDIS_PASSWORD } from "./envUtils";

export const redisClient = createClient({
  url: REDIS_HOST,
  password: REDIS_PASSWORD,
});

export const twitterAPIClient = new TwitterApi({ ...APPLICATION_TOKENS });
