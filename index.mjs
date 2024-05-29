import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import path from "path";
import { learningPath } from "./functions/data/learningPath.mjs";
import { learningPath as stagingLearningPath } from "./functions/data/staging/learningPath.mjs";
import { learningPath as meyLearningPath } from "./functions/data/production/learningPath.mjs";
import { learningPath as localLearningPath } from "./functions/data/local/learningPath.mjs";

import {
  insert_data,
  sqlFileOutPutGenerator,
} from "./functions/sqlGenerator.mjs";
import { processSqlBackup } from "./functions/operations/sqlProcessor.mjs";
import guardians from "./logs/academic/guardians.mjs";

import { sqlToObjects } from "./functions/operations/sqlToObjects.mjs";
import { promises as pfs } from "fs";
import guardiansToBeReplaced from "./map/guardians.mjs";

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
  const LMS_COURSE_USERS_ID = [];

  const LMS_COURSE_USERS_ID_0 = [];
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
  const filterOne = LMS_COURSE_USERS.filter((d) => d && d.courseProgress == 0);
  fs.writeFileSync(
    join(__dirname, "./logs/lms/logs/0.mjs"),
    `${JSON.stringify(filterOne)}`
  );
  console.log("0% - ", filterOne.length);

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

  return;

  for (const iterator of LCU_FILTERED) {
    LMS_COURSE_USERS_ID.push(iterator.userNumberId);
  }

  const LMS_USERS_PROGRESS = await processSqlBackup(
    "lms_user_progress",
    "./input_sql/lms/lms_user_progress_29_05_2024.sql"
  );
  console.log("Total lms user progress", LMS_USERS_PROGRESS.length);
  const LUP_FILTERED = LMS_USERS_PROGRESS.filter((d) =>
    LMS_COURSE_USERS_ID.includes(d.userNumberId)
  );
  console.log("Filter user progress from course user", LUP_FILTERED.length);

  const counts = LUP_FILTERED.reduce((acc, obj) => {
    // If the userNumberId is already a key in the accumulator, increment the count
    if (acc[obj.userNumberId]) {
      acc[obj.userNumberId]++;
    } else {
      // If the userNumberId is not a key in the accumulator, add it with a count of 1
      acc[obj.userNumberId] = 1;
    }
    return acc;
  }, {});

  console.log("Group by counts", Object.keys(counts).length);

  // fs.writeFileSync(
  //   join(__dirname, "./functions/data/production/re-learningPath.mjs"),
  //   `const learningPath = ${JSON.stringify(
  //     searchDelete(meyLearningPath, "49f975eb-15aa-4e94-869e-93165fa67e1e")
  //   )}`
  // );

  return;
};

main(__filename, __dirname).catch(console.error);
