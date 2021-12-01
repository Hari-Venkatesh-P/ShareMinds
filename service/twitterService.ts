import { AxiosResponse } from "axios";
import { TwitterApi } from "twitter-api-v2";
import { getLocationData } from "../utils/apiUtils";
import { twitterAPIClient } from "../utils/clientUtils";
import { RESPONSE_MESSAGES } from "../utils/constantUtils";
import { APPLICATION_TOKENS, PORT } from "../utils/envUtils";
import { logger } from "../utils/loggerUtils";

export const makeAuthorizationRequest = async (req, res) => {
  try {
    const loginSecret = req.query.loginSecret;
    if (loginSecret) {
      const link = await twitterAPIClient.generateAuthLink(
        `http://localhost:${PORT}/callback`,
        { linkMode: "authorize" }
      );
      // To be saved in Redis against USER_OUATH_oauth_token = {loginSecret , oauth_token , oauth_token_secret }
      // req.session.oauthToken = link.oauth_token;
      // req.session.oauthSecret = link.oauth_token_secret;

      res.status(200).send({ success: true, data: link.url });
    } else {
      res.status().send({
        success: false,
        message: RESPONSE_MESSAGES.BAD_REQUEST,
        description: "Missing required param loginSecret",
      });
    }
  } catch (error) {
    logger.error(error);
    res.status(502).send({
      success: false,
      message: RESPONSE_MESSAGES.TWITTER_API_ERROR,
      description: error.message,
    });
  }
};

export const callbackAuthorization = async (req, res) => {
  try {
    // Invalid request
    if (!req.query.oauth_token || !req.query.oauth_verifier) {
      res.status(400).render("error", {
        error:
          "Bad request, or you denied application access. Please renew your request.",
      });
      return;
    }

    const token = req.query.oauth_token as string;
    const verifier = req.query.oauth_verifier as string;

    // retrieve USER_OUATH_oauth_token based on USER_OUATH_req.query.oauth_token
    // {loginSecret , oauth_token , oauth_token_secret }
    const savedToken = req.session.oauthToken; // oauth_token
    const savedSecret = req.session.oauthSecret; // oauth_token_secret

    if (!savedToken || !savedSecret || savedToken !== token) {
      res.status(400).render("error", {
        error:
          "OAuth token is not known or invalid. Your request may have expire. Please renew the auth process.",
      });
      return;
    }

    // Build a temporary client to get access token
    const tempClient = new TwitterApi({
      ...APPLICATION_TOKENS,
      accessToken: token,
      accessSecret: savedSecret,
    });

    const { accessToken, accessSecret, screenName, userId } =
      await tempClient.login(verifier);
    // update  USER_OUATH_oauth_token based on USER_OUATH_req.query.oauth_token
    // {loginSecret , oauth_token , oauth_token_secret ,accessToken, accessSecret ,userId }
    // socket emit with loginId
    res.send("callback success");
  } catch (error) {
    logger.error(error);
    res.status(502).send({
      success: false,
      message: RESPONSE_MESSAGES.TWITTER_API_ERROR,
      description: error.message,
    });
  }
};

export const getProfileDetails = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (userId) {
      const tempClient = new TwitterApi({
        ...APPLICATION_TOKENS,
        accessToken: "1004446443690577920-3482dvSyhpT1vvNWhGLnylB0jWQOs7",
        accessSecret: "LxvuE6aHTsod18BizA9h7yjAsYvIYF0TLNWcEj0YKd5uN",
      });
      const profileData = await tempClient.v2.user(userId, {
        "user.fields": [
          "created_at",
          "description",
          "entities",
          "id",
          "location",
          "name",
          "pinned_tweet_id",
          "profile_image_url",
          "protected",
          "public_metrics",
          "url",
          "username",
          "verified",
          "withheld",
        ],
      });
      res.status(200).send({ success: true, data: profileData });
    } else {
      res.status().send({
        success: false,
        message: RESPONSE_MESSAGES.BAD_REQUEST,
        description: "Missing required param userId",
      });
    }
  } catch (error) {
    logger.error(error);
    res.status(502).send({
      success: false,
      message: RESPONSE_MESSAGES.TWITTER_API_ERROR,
      description: error.message,
    });
  }
};

export const searchTweets = async (req, res) => {
  try {
    const userId = req.query.userId;
    const queryString = req.query.queryString;

    if (userId && queryString) {
      const tempClient = new TwitterApi({
        ...APPLICATION_TOKENS,
        accessToken: "1004446443690577920-3482dvSyhpT1vvNWhGLnylB0jWQOs7",
        accessSecret: "LxvuE6aHTsod18BizA9h7yjAsYvIYF0TLNWcEj0YKd5uN",
      });
      const tweetDetails = await tempClient.v2.search(queryString, {
        "tweet.fields": [
          "attachments",
          "author_id",
          //   "context_annotations",
          //   "conversation_id",
          "created_at",
          //   "entities",
          //   "geo",
          "id",
          //   "in_reply_to_user_id",
          //   "lang",
          "public_metrics",
          "possibly_sensitive",
          //   "referenced_tweets",
          //   "reply_settings",
          "source",
          "text",
          //   "withheld",
        ],
        max_results: 10,
      });
      res.status(200).send({ success: true, data: tweetDetails });
    } else {
      res.status().send({
        success: false,
        message: RESPONSE_MESSAGES.BAD_REQUEST,
        description: "Missing required param userId or Query String",
      });
    }
  } catch (error) {
    logger.error(error);
    res.status(502).send({
      success: false,
      message: RESPONSE_MESSAGES.TWITTER_API_ERROR,
      description: error.message,
    });
  }
};

export const getTimeLineTweets = async (req, res) => {
  try {
    const userId = req.query.userId;
    const count = req.query.count;
    const since_id = req.query.since_id;
    const max_id = req.query.max_id;

    if (userId && count) {
      const tempClient = new TwitterApi({
        ...APPLICATION_TOKENS,
        accessToken: "1004446443690577920-3482dvSyhpT1vvNWhGLnylB0jWQOs7",
        accessSecret: "LxvuE6aHTsod18BizA9h7yjAsYvIYF0TLNWcEj0YKd5uN",
      });

      let params: any = {};
      params["count"] = count;
      if (since_id) params["since_id"] = since_id;
      if (max_id) params["max_id"] = max_id;
      params["tweet_mode"] = "extended";
      params["exclude_replies"] = true;
      params["include_entities"] = true;
      params["trim_user"] = true;
      const homeTimeline = await tempClient.v1.homeTimeline(params);

      res.status(200).send({ success: true, data: homeTimeline });
    } else {
      res.status().send({
        success: false,
        message: RESPONSE_MESSAGES.BAD_REQUEST,
        description: "Missing required param userId or count",
      });
    }
  } catch (error) {
    logger.error(error);
    res.status(502).send({
      success: false,
      message: RESPONSE_MESSAGES.TWITTER_API_ERROR,
      description: error.message,
    });
  }
};

export const getTweet = async (req, res) => {
  try {
    const userId = req.query.userId;
    const tweetId = req.query.tweetId;

    if (userId && tweetId) {
      const tempClient = new TwitterApi({
        ...APPLICATION_TOKENS,
        accessToken: "1004446443690577920-3482dvSyhpT1vvNWhGLnylB0jWQOs7",
        accessSecret: "LxvuE6aHTsod18BizA9h7yjAsYvIYF0TLNWcEj0YKd5uN",
      });

      const tweetData = await tempClient.v2.singleTweet(tweetId, {
        expansions: [
          "attachments.poll_ids",
          "attachments.media_keys",
          "author_id",
          "referenced_tweets.id",
          "in_reply_to_user_id",
          "geo.place_id",
          "entities.mentions.username",
          "referenced_tweets.id.author_id",
        ],
        "tweet.fields": [
          "attachments",
          "author_id",
          "context_annotations",
          "conversation_id",
          "created_at",
          "entities",
          "geo",
          "id",
          "in_reply_to_user_id",
          "lang",
          "public_metrics",
          "possibly_sensitive",
          "referenced_tweets",
          "reply_settings",
          "source",
          "text",
          "withheld",
        ],
      });

      res.status(200).send({ success: true, data: tweetData });
    } else {
      res.status().send({
        success: false,
        message: RESPONSE_MESSAGES.BAD_REQUEST,
        description: "Missing required param userId or tweetId",
      });
    }
  } catch (error) {
    logger.error(error);
    res.status(502).send({
      success: false,
      message: RESPONSE_MESSAGES.TWITTER_API_ERROR,
      description: error.message,
    });
  }
};

export const getLatestTrends = async (req, res) => {
  try {
    const userId = req.query.userId;
    const locationQuery = req.query.locationQuery;

    if (userId && locationQuery) {
      const locationDataResponse: AxiosResponse = await getLocationData(
        locationQuery
      );

      if (
        locationDataResponse.status == 200 &&
        locationDataResponse.data.data &&
        locationDataResponse.data.data.length > 0
      ) {
        const locationData = locationDataResponse.data.data[0];
        const tempClient = new TwitterApi({
          ...APPLICATION_TOKENS,
          accessToken: "1004446443690577920-3482dvSyhpT1vvNWhGLnylB0jWQOs7",
          accessSecret: "LxvuE6aHTsod18BizA9h7yjAsYvIYF0TLNWcEj0YKd5uN",
        });
        const woeidData = await tempClient.v1.get(
          `trends/closest.json?lat=${locationData["latitude"]}&long=${locationData["longitude"]}`
        );
        if (woeidData && woeidData.length > 0) {
          const closestTrendingData = await tempClient.v1.get(
            `trends/place.json?id=${woeidData[0].woeid}`
          );
          const worldTrendingData = await tempClient.v1.get(
            `trends/place.json?id=1`
          );
          res.status(200).send({
            success: true,
            data: { closestTrendingData, worldTrendingData },
          });
        } else {
          res.status(400).send({
            success: false,
            message: "Unable to find WOIED",
          });
        }
      } else {
        res.status(400).send({
          success: false,
          message: "Unable to locate the place",
        });
      }
    } else {
      res.status(400).send({
        success: false,
        message: RESPONSE_MESSAGES.BAD_REQUEST,
        description: "Missing required param userId or locationQuery",
      });
    }
  } catch (error) {
    logger.error(error);
    res.status(502).send({
      success: false,
      message: RESPONSE_MESSAGES.TWITTER_API_ERROR,
      description: error.message,
    });
  }
};
