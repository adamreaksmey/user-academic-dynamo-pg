import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import path from "path";
import { learningPath } from "./functions/data/production/learningPath.mjs";
import { answerV1Table } from "./sources/QuestionsV1Table-ibf-prod.mjs";
import {
  calculateLessonCount,
  calculateLessonCountBasedOnQA,
} from "./functions/operations/data.mjs";
import formatDynamoDBJson from "./functions/dynamo-formatter.mjs";

import {
  insert_data,
  sqlFileOutPutGenerator,
} from "./functions/sqlGenerator.mjs";
import { processSqlBackup } from "./functions/operations/sqlProcessor.mjs";

import { sqlToObjects } from "./functions/operations/sqlToObjects.mjs";
import { promises as pfs } from "fs";

import {
  __MASTER_MAPPER,
  __fetchUserAnswerFromQA,
  __filterQAonly,
  __filter__FROM__QA,
  duplicatedRemoved,
} from "./functions/operations/_v1.filter.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 *
 * @param {*} __filename
 * @param {*} __dirname
 * @returns
 *
 *  Note: my sql parser isnt working correctly especially dealing with semi colons
 *  so if found, please console log, it will show you which line has a semi colon and
 *  manually remove them yourself.
 */

const main = async (__filename, __dirname) => {
  /**
   * HEAD FUNCTIONALITY
   */
  const users = await processSqlBackup(
    "users",
    "./input_sql/lms/lms_user_29_05_2024.sql"
  );

  // Setter with userNumberId -- useful for lms
  const usersMap = new Map(
    users.map((user) => {
      return [user.userNumberId, user];
    })
  );

  // Setter with userId -- useful for qa
  const usersMap_userId = new Map(
    users
      .filter((data) => data.userId)
      .map((user) => {
        return [user.userId, user];
      })
  );

  const lessonsCount = await calculateLessonCountBasedOnQA(learningPath); // should be 72
  const questionLearningPathId = lessonsCount.ids;
  fs.writeFileSync(
    join(__dirname, "./logs/lms/logs/qa_ids.mjs"),
    `${JSON.stringify(questionLearningPathId)}`
  );
  /**
   *
   */

  // -------- OPERATION 1 ----------
  console.log("-------- OPERATION 1 ----------");
  const LMS_COURSE_USERS_ID_0 = [];
  const LMS_COURSE_USERS_ID_1_99 = [];
  const LMS_COURSE_USERS_ID_100 = [];
  /**
   *  BEFORE FILTER
   */
  const LMS_COURSE_USERS = await processSqlBackup(
    "lms_courses_user",
    "./input_sql/lms/lms_courses_users_29_05_2024.sql"
  );
  console.log("Before filter 100%", LMS_COURSE_USERS.length);

  /**
   * Progress 0%
   */
  const filterOne = LMS_COURSE_USERS.filter((d) => d.courseProgress == 0);
  fs.writeFileSync(
    join(__dirname, "./logs/lms/logs/0.mjs"),
    `${JSON.stringify(filterOne)}`
  );
  console.log("0% - ", filterOne.length);
  // Loop 1
  for (const iterator of filterOne) {
    LMS_COURSE_USERS_ID_0.push(iterator.userNumberId);
  }

  /**
   * Progress 1% - 99%
   */
  const filterTwo = LMS_COURSE_USERS.filter(
    (d) => d && d.courseProgress >= 1 && d && d.courseProgress <= 99
  );
  fs.writeFileSync(
    join(__dirname, "./logs/lms/logs/1-99.mjs"),
    `${JSON.stringify(filterTwo)}`
  );
  console.log("1% - 99%", filterTwo.length);
  // Loop 2
  for (const iterator of filterTwo) {
    LMS_COURSE_USERS_ID_1_99.push(iterator.userNumberId);
  }

  /**
   * Progress 100%
   */
  const filterThree = LMS_COURSE_USERS.filter(
    (d) => d && d.courseProgress >= 100
  );
  fs.writeFileSync(
    join(__dirname, "./logs/lms/logs/100.mjs"),
    `${JSON.stringify(filterThree)}`
  );
  console.log("100% - ", filterThree.length);
  // Loop 3
  for (const iterator of filterThree) {
    LMS_COURSE_USERS_ID_100.push(iterator.userNumberId);
  }

  // -------- OPERATION 2 ----------
  console.log("-------- OPERATION 2 ----------");
  // --------- MASTER FUNCTIONS --------
  let PROBLEMATIC_0 = [];
  let PROBLEMATIC_1_99 = [];
  let PROBLEMATIC_100 = [];

  const userNumberIdSet_0 = new Set(LMS_COURSE_USERS_ID_0);
  const userNumberIdSet_1_99 = new Set(LMS_COURSE_USERS_ID_1_99);
  const userNumberIdSet_100 = new Set(LMS_COURSE_USERS_ID_100);

  // -----------------------------------

  const LMS_USER_PROGRESS = await processSqlBackup(
    "lms_user_progress",
    "./input_sql/lms/lms_user_progress_29_05_2024.sql"
  );

  // ------------------- Filter progress 0% -------------------
  console.log("Filter RUNNING for problematic users at 0%");
  PROBLEMATIC_0 = __MASTER_MAPPER(
    LMS_USER_PROGRESS,
    userNumberIdSet_0,
    usersMap
  ).filter((d) => d.progressArray.length > 0);
  fs.writeFileSync(
    join(__dirname, "./logs/lms/problematic_students/0%.mjs"),
    `${JSON.stringify(PROBLEMATIC_0)}`
  );
  console.log("Filter FINISHED for problematic users at 0%");
  // ---------------------------------------------------------

  // ------------------- Filter progress 1% - 99% -------------------
  console.log("Filter RUNNING for problematic users at 1% - 99%");
  PROBLEMATIC_1_99 = __MASTER_MAPPER(
    LMS_USER_PROGRESS,
    userNumberIdSet_1_99,
    usersMap
  );
  fs.writeFileSync(
    join(__dirname, "./logs/lms/problematic_students/1%-99%.mjs"),
    `${JSON.stringify(PROBLEMATIC_1_99)}`
  );
  console.log("Filter FINISHED for problematic users at 1% - 99%");
  // ---------------------------------------------------------

  // ------------------- Filter progress 100% -------------------
  console.log("Filter RUNNING for problematic users at 100%");
  PROBLEMATIC_100 = __MASTER_MAPPER(
    LMS_USER_PROGRESS,
    userNumberIdSet_100,
    usersMap
  );
  fs.writeFileSync(
    join(__dirname, "./logs/lms/problematic_students/100%.mjs"),
    `${JSON.stringify(PROBLEMATIC_100)}`
  );
  console.log("Filter FINISHED for problematic users at 100%");
  // ---------------------------------------------------------

  // -------- OPERATION 3 ( FROM LMS SIDE, checks for unanswered questions but has activityId ) ----------
  console.log("-------- OPERATION 3 ----------");

  // -------- 0% Progress ---------- ( No QA ID detected, yayyy! )
  // const qa_filter_responseOne = await __filterQAonly(
  //   PROBLEMATIC_0,
  //   questionLearningPathId
  // );
  // console.log("0% - ", qa_filter_responseOne);

  // -------- 1% - 99% Progress -------------
  const qa_filter_responseTwo = await __filterQAonly(
    PROBLEMATIC_1_99,
    questionLearningPathId
  );
  console.log("1% - 99%", qa_filter_responseTwo.length);

  // -------- 100% Progress -------------
  const qa_filter_responseThree = await __filterQAonly(
    PROBLEMATIC_100,
    questionLearningPathId
  );
  console.log("100% -", qa_filter_responseThree.length);

  // -------- OPERATION 4 ( FROM QA-SERVICE SIDE, checks for answered questions but has no activityId ) ----------
  console.log("-------- OPERATION 4 ----------");
  /**
   * Format QA-SERVICE data
   */
  const qaIds = [];
  const qaAnswers = answerV1Table.Items;
  const uniqueData = [];
  const seen = new Set();
  const noAnswersArr = [];

  for (const iterator of qaAnswers) {
    qaIds.push({
      userId: iterator.userId?.S,
      questionId: iterator.questionId?.S,
    });
  }
  const filteredUndefined = qaIds.filter(
    (data) => data.userId && data.questionId
  );

  // Step 1: Remove duplicates
  filteredUndefined.forEach((item) => {
    const key = `${item.userId}-${item.questionId}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueData.push(item);
    }
  });

  // Step 2: Group by userId
  const groupedData = uniqueData.reduce((acc, item) => {
    if (!acc[item.userId]) {
      acc[item.userId] = {
        userId: item.userId,
        questionIds: [],
      };
    }
    acc[item.userId].questionIds.push(item.questionId);
    return acc;
  }, {});

  // Convert groupedData to an array
  const FINAL_GROUPED_RESULTS = Object.values(groupedData);
  const FINAL_GROUPED_RESULTS_MAPPED = new Map(
    FINAL_GROUPED_RESULTS.filter((data) => data.userId).map((user) => {
      return [user.userId, user];
    })
  );

  // Step 3: Filter users who have answers but no activityId
  const response1 = __filter__FROM__QA(
    // 1% - 99%
    qa_filter_responseTwo,
    FINAL_GROUPED_RESULTS_MAPPED,
    usersMap_userId
  );
  fs.writeFileSync(
    join(
      __dirname,
      "./logs/lms/problematic_students/no_checks/no_checks_has_answers_1_99.mjs"
    ),
    `${JSON.stringify(duplicatedRemoved(response1))}`
  );

  const response2 = __filter__FROM__QA(
    // 100%
    qa_filter_responseThree,
    FINAL_GROUPED_RESULTS_MAPPED,
    usersMap_userId
  );
  fs.writeFileSync(
    join(
      __dirname,
      "./logs/lms/problematic_students/no_checks/no_checks_has_answers_100.mjs"
    ),
    `${JSON.stringify(response2)}`
  );

  // ADDITIONAL: filter out 100% progress with no answers.
  // IMPORTANT LOOP, this does a reverse loop filtering from QA sides instead.
  for (const __i of qa_filter_responseThree) {
    const questionUser = FINAL_GROUPED_RESULTS_MAPPED.get(__i.userId);
    for (const __j of __i.QA_progress_only) {
      if (!questionUser.questionIds.includes(__j)) {
        noAnswersArr.push({
          ...usersMap_userId.get(__i.userId),
          activityId: __j,
        });
        continue;
      }
    }
  }

  fs.writeFileSync(
    join(__dirname, "./logs/lms/problematic_students/no_qa_answer-100.mjs"),
    `${JSON.stringify(duplicatedRemoved(noAnswersArr))}`
  );

  return;
};

main(__filename, __dirname).catch(console.error);
