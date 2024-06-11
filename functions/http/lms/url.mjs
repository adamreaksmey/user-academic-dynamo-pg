const prodUrl = "https://sms-api.ibfkh.org/lms_service";
const stagingUrl = "https://sms-api.staging.ibfkh.org/lms_service";
const qaServiceProd = "https://api.ibfkh.org/question_service/v1";
const LMS_ORG_ID = "61f17951-d509-4b60-967b-a84442f949b6";
const RL2024_subjectId = "27c50847-561a-43af-97de-2d85d3cb281b";

export const URL_getAllUsersProgress = (
  uniqueKey,
  courseId = "edea75b8-93f2-494a-8e13-e51471fcef20"
) => {
  const url = `${prodUrl}/organizations/${LMS_ORG_ID}/users/${uniqueKey}/courses/${courseId}/progresses`;
  return url;
};

export const URL_getSingleUserAnswerFromQa = (activityId, userId) => {
  const url = `${qaServiceProd}/organizations/${LMS_ORG_ID}/subjects/${RL2024_subjectId}/questions/${activityId}/userAnswers?userId=${userId}`;
  return url;
};

export const URL_getSingleUserProgress = (
  activityId,
  uniqueKey,
  courseId = "edea75b8-93f2-494a-8e13-e51471fcef20"
) => {
  const url = `${prodUrl}/organizations/${LMS_ORG_ID}/users/${uniqueKey}/courses/${courseId}/activities/${activityId}/progresses`;
  return url;
};

export const URL_modifyUserProgress = (
  uniqueKey,
  activityId,
  courseId = "edea75b8-93f2-494a-8e13-e51471fcef20"
) => {
  const url = `${prodUrl}/organizations/${LMS_ORG_ID}/users/${uniqueKey}/courses/${courseId}/activities/${activityId}/progresses`;
  return url;
};

export const URL_getSingleUserFromCourse = (
  uniqueKey,
  courseId = "edea75b8-93f2-494a-8e13-e51471fcef20"
) => {
  const url = `${prodUrl}/organizations/${LMS_ORG_ID}/courses/${courseId}/users?limit=10&start=0&filters=[]&sort={%22progress%22:%22desc%22}&keyword=${uniqueKey}`;
  return url;
};

export const URL_deleteSingleUserProgress = (
  activityId,
  userNumberId,
  courseId = "edea75b8-93f2-494a-8e13-e51471fcef20"
) => {
  const url = `${prodUrl}/organizations/${LMS_ORG_ID}/courses/${courseId}/activities/${activityId}/userNumberId`;
  return url;
};
