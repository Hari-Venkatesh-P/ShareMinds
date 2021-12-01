import axios from "axios";
import { mapKey, mapURL } from "./envUtils";

export const getLocationData = async (locationQuery: string) => {
  return await axios.get(
    `${mapURL}?access_key=${mapKey}&query=${locationQuery}`
  );
};
