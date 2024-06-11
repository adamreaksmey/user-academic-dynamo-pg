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
import { getUserProgressRecords } from "./functions/http/lms/functions.mjs";

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
  // const usersMapped = 

  // ----------- OPERATION 1 ------------
  /**
   * Create progress for every user with answers but no progress.
   */
  const userProgress = await getUserProgressRecords({
    idCard: "IBF24112136",
  });
  // const qaIdsOnly =
  // for (const iterator of userProgress) {
  //   const response = await __fetchUserAnswerFromQA()
  // }
  console.log(userProgress);
  /**
   *
   */

  // -------- OPERATION 1 ----------
  return;
};

main(__filename, __dirname).catch(console.error);
