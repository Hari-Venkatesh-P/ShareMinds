import { redisClient } from "./clientUtils";
import { logger } from "./loggerUtils";

export const setRedis = async (key: string, value: any) => {
  try {
    await redisClient.set(key, value);
    return 1;
  } catch (error) {
    logger.error(error);
    return 0;
  }
};

export const getRedis = async (key: string) => {
  try {
    let data = await redisClient.get(key);
    return data;
  } catch (error) {
    logger.error(error);
    return null;
  }
};
