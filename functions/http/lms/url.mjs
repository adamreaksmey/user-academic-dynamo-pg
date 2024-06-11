const prodUrl = "https://sms-api.ibfkh.org/lms_service";
const stagingUrl = "https://sms-api.staging.ibfkh.org";
const LMS_ORG_ID = "61f17951-d509-4b60-967b-a84442f949b6";

export const URL_getAllUsersProgress = (
  uniqueKey,
  courseId = "edea75b8-93f2-494a-8e13-e51471fcef20"
) => {
  const url = `${prodUrl}/organizations/${LMS_ORG_ID}/users/${uniqueKey}/courses/${courseId}/progresses`;
  console.log(url);
  return url;
};
