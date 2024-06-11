import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import path from "path";
import { learningPath } from "./functions/data/production/learningPath.mjs";
import { answerV1Table } from "./sources/QuestionsV1Table-ibf-prod.mjs";
import {
  calculateLessonCount,
  calculateLessonCountBasedOnQA,
  newMapper,
} from "./functions/operations/data.mjs";
import formatDynamoDBJson from "./functions/dynamo-formatter.mjs";
import {
  getSingleUserAnswerFromQa,
  getUserProgressRecords,
  getSingleUserProgress,
  createUserProgress,
  deleteSingleUserProgress,
} from "./functions/http/lms/functions.mjs";

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
import { usersWithNoChecks } from "./logs/lms/problematic_students/no_checks/no_checks_has_answers_1_99.mjs";
import { progressToBeCreated } from "./logs/lms/to-be-created/data.mjs";
import { noQaAnswers } from "./logs/lms/problematic_students/no_answers/no_qa_answer-1-99.mjs";
import { toBeDeleted } from "./logs/lms/to-be-deleted/data.mjs";

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
  const lessonsCount = await calculateLessonCountBasedOnQA(learningPath); // should be 72
  const questionLearningPathId = lessonsCount.ids;
  const users = await processSqlBackup(
    "users",
    "./input_sql/lms/lms_user_07_06_2024.sql"
  );
  const usersMapped = newMapper(users, "userNumberId");
  const usersMappedByIdCard = newMapper(users, "idCard");

  // ----------- OPERATION 1 ------------
  /**
   * Prepare progress creation data for every user with answers but no progress.
   */
  const usersProgressToBeCreated = [];
  const usersProgressToDeDeleted = [];
  // const userProgress = await getUserProgressRecords({
  //   idCard: "IBF24112136",
  // });
  // Not in use yet.
  // const usersAnswersFromActivity = await getSingleUserAnswerFromQa(
  //   "42f26eda-9ae1-4fcf-ab8c-255c08a28e59"
  // );
  // for (const __I of usersWithNoChecks) {
  //   const userId = usersMapped.get(__I.userNumberId).userId;
  //   const progresses = [];
  //   for (const __J of questionLearningPathId) {
  //     const response = await getSingleUserAnswerFromQa({
  //       activityId: __J,
  //       userId,
  //     });
  //     console.log(`For user ${__I.idCard}`, response);
  //     const userHasProgress = await getSingleUserProgress({
  //       activityId: __J,
  //       uniqueKey: __I.idCard,
  //     });
  //     if (response.length > 0 && !userHasProgress) {
  //       progresses.push(__J);
  //     }
  //   }
  //   usersProgressToBeCreated.push({
  //     idCard: __I.idCard,
  //     userId,
  //     progresses,
  //   });
  //   fs.writeFileSync(
  //     join(__dirname, "./logs/lms/to-be-created/data.mjs"),
  //     `${JSON.stringify(usersProgressToBeCreated)}`
  //   );
  // }

  // ----------- OPERATION 2 ------------
  /**
   * Create progress for those students
   */
  let counter = 0;
  // for (const __student of progressToBeCreated) {
  //   if (__student.progresses.length < 1) {
  //     continue;
  //   }
  //   for (const __progress of __student.progresses) {
  //     const response = await createUserProgress({
  //       activityId: __progress,
  //       uniqueKey: __student.idCard,
  //       userNumberId: usersMappedByIdCard.get(__student.idCard).userNumberId,
  //     });
  //     console.log(
  //       `Created: student ${__student.idCard}. Response: ${JSON.stringify(
  //         response
  //       )}`
  //     );
  //   }
  //   counter++;
  //   console.log("Numbers of student completed", counter);
  // }

  // ----------- OPERATION 3 ------------
  /**
   * Those with progress but without answers will get their progress deleted:
   */
  // const qaIncludes = [];
  // const finalQaIncludes = [];

  // for (const __I of noQaAnswers) {
  //   const qaIdsToBeDeleted = [];
  //   const idCard = usersMapped.get(__I.userNumberId).idCard;
  //   const userProgress = await getUserProgressRecords({
  //     idCard,
  //   });
  //   for (const __J of userProgress) {
  //     if (questionLearningPathId.includes(__J.activityId)) {
  //       qaIdsToBeDeleted.push(__J.activityId);
  //     }
  //   }
  //   qaIncludes.push({
  //     idCard,
  //     userId: __I.userId,
  //     qaIdsToBeDeleted,
  //   });
  // }

  // for (const __I of qaIncludes) {
  //   const qaIdsToBeDeleted = [];
  //   const idCard = __I.idCard;
  //   for (const __J of __I.qaIdsToBeDeleted) {
  //     const response = await getSingleUserAnswerFromQa({
  //       activityId: __J,
  //       userId: __I.userId,
  //     });
  //     if (response.length <= 0) {
  //       console.log("Found progress with no answers", __J);
  //       qaIdsToBeDeleted.push(__J);
  //     }
  //   }
  //   finalQaIncludes.push({
  //     idCard,
  //     userId: __I.userId,
  //     qaIdsToBeDeleted,
  //   });
  // }

  // fs.writeFileSync(
  //   join(__dirname, "./logs/lms/to-be-deleted/data.mjs"),
  //   `${JSON.stringify(finalQaIncludes)}`
  // );

  // ----------- OPERATION 4 ------------
  for (const __I of toBeDeleted) {
    for (const __J of __I.qaIdsToBeDeleted) {
      const response = await deleteSingleUserProgress({
        activityId: __J,
      });
      console.log(
        "Successfully deleted progress of ",
        response,
        " from user ",
        __I.userId
      );
    }
  }

  return;
};

main(__filename, __dirname).catch(console.error);
