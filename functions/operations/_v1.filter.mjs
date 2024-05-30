// import "../../logs/lms/problematic_students/no_qa_answer.mjs"
import fetch from "node-fetch";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const __MASTER_MAPPER = (
  LMS_USER_PROGRESS,
  userNumberIdSet,
  usersMap
) => {
  // Initialize a map to store progress entries for each userNumberId
  const userProgressMap = new Map();

  // Iterate through LMS_USER_PROGRESS to populate userProgressMap
  LMS_USER_PROGRESS.forEach((progress) => {
    if (userNumberIdSet.has(progress.userNumberId)) {
      if (!userProgressMap.has(progress.userNumberId)) {
        userProgressMap.set(progress.userNumberId, []);
      }
      userProgressMap.get(progress.userNumberId).push(progress.activityId);
    }
  });

  // Prepare the final result array
  const PROBLEMATIC_STUDENTS = [];

  // Iterate through the userNumberIdSet to build the final result
  userNumberIdSet.forEach((userNumberId) => {
    const user = usersMap.get(userNumberId);

    if (user) {
      PROBLEMATIC_STUDENTS.push({
        ...user,
        progressArray: userProgressMap.get(userNumberId) || [],
      });
    }
  });

  return PROBLEMATIC_STUDENTS;
};

export const __fetchUserAnswerFromQA = async (activityId, userId) => {
  const orgId = "61f17951-d509-4b60-967b-a84442f949b6";
  const subjects = "27c50847-561a-43af-97de-2d85d3cb281b";

  const url = `https://api.ibfkh.org/question_service/v1/organizations/${orgId}/subjects/${subjects}/questions/${activityId}/userAnswers?userId=${userId}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const data = await response.json();

    // console.log(data);
    return data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};

const qaNotFound_1_99 = [];
const qaNotFound_100 = [];

export const __filterQAonly = async (
  PROBLEMATIC_USERS,
  questionLearningPathId
) => {
  let response = [];
  let qaExistsOnly = [];
  let noAnswerFoundCount = 0;
  let answerFoundCount = 0;
  let forEachAnswerCount = 0;

  for (const iterator of PROBLEMATIC_USERS) {
    const FILTERED_TO_QA_ONLY = iterator.progressArray.filter((id) =>
      questionLearningPathId.includes(id)
    );

    response.push({
      idCard: iterator.idCard,
      userId: iterator.userId,
      firstName: iterator.firstName,
      lastName: iterator.lastName,
      userNumberId: iterator.userNumberId,
      QA_progress_only: FILTERED_TO_QA_ONLY,
    });
  }
  qaExistsOnly = response.filter((data) => data.QA_progress_only.length > 0);

  for (const i of qaExistsOnly) {
    answerFoundCount++;
    console.log("Processing", i.idCard, answerFoundCount);
    for (const j of i.QA_progress_only) {
      const response = await __fetchUserAnswerFromQA(j, i.userId);
      if (response.length <= 0) {
        noAnswerFoundCount++;
        qaNotFound_100.push({
          idCard: i.idCard,
          userId: i.userId,
          firstName: i.firstName,
          lastName: i.lastName,
          userNumberId: i.userNumberId,
          activityId: j,
          answer: response,
        });
        console.log(qaNotFound_100);
        const removedDupes = duplicatedRemoved(qaNotFound_100);
        fs.writeFileSync(
          join(
            __dirname,
            "../../logs/lms/problematic_students/no_qa_answer-100.mjs"
          ),
          `${JSON.stringify(removedDupes)}`
        );
        console.log(noAnswerFoundCount);
        continue;
      }
    }
  }

  return qaExistsOnly;
};

const duplicatedRemoved = (qaNotFound) => {
  const removedDupes = Object.values(
    qaNotFound.reduce((acc, obj) => {
      const idCard = obj.idCard;
      if (!acc[idCard]) {
        acc[idCard] = obj;
      }
      return acc;
    }, {})
  );

  return removedDupes;
};
