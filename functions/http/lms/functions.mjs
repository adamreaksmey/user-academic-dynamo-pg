import axios from "axios";
import {
  URL_getAllUsersProgress,
  URL_getSingleUserAnswerFromQa,
  URL_getSingleUserFromCourse,
  URL_getSingleUserProgress,
  URL_modifyUserProgress,
  URL_deleteSingleUserProgress,
} from "./url.mjs";

export const getUserProgressRecords = async (user) => {
  const response = await axios({
    method: "GET",
    url: URL_getAllUsersProgress(user.idCard),
  });

  return response.data;
};

export const getSingleUserAnswerFromQa = async (data) => {
  const { activityId, userId } = data;
  const response = await axios({
    method: "GET",
    url: URL_getSingleUserAnswerFromQa(activityId, userId),
  });

  return response.data;
};

export const getSingleUserProgress = async (data) => {
  const { activityId, uniqueKey } = data;
  const response = await axios({
    method: "GET",
    url: URL_getSingleUserProgress(activityId, uniqueKey),
  });

  return response.data;
};

export const createUserProgress = async (data) => {
  const { activityId, uniqueKey, userNumberId } = data;
  const courseUser = await getSingleUserFromCourse(uniqueKey);
  const finalPayload = {
    progress: "N/A",
    percentage: 100,
    isCompleted: true,
    userNumberId,
    courseUserId: courseUser.courseUserId,
  };
  console.log(
    `...Creation process running for user ${uniqueKey}, ${finalPayload}`
  );

  const response = await axios({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    url: URL_modifyUserProgress(uniqueKey, activityId),
    data: finalPayload,
  });

  return response.data;
};

export const getSingleUserFromCourse = async (uniqueKey) => {
  const response = await axios({
    method: "GET",
    url: URL_getSingleUserFromCourse(uniqueKey),
  });

  return response.data.data[0];
};

export const deleteSingleUserProgress = async (data) => {
  const { activityId } = data;
  const response = await axios({
    method: "DELETE",
    url: URL_deleteSingleUserProgress(activityId),
  });

  return response.data;
};
