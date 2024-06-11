import axios from "axios";
import { URL_getAllUsersProgress } from "./url.mjs";

export const getUserProgressRecords = async (user) => {
  const response = await axios({
    method: "GET",
    url: URL_getAllUsersProgress(user.idCard),
  });

  return response.data;
};
