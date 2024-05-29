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

  const users = await processSqlBackup(
    "users",
    "./input_sql/lms/lms_user_29_05_2024.sql"
  );
  console.log(users);

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
  const LMS_USER_PROGRESS = await processSqlBackup(
    "lms_user_progress",
    "./input_sql/lms/lms_user_progress_29_05_2024.sql"
  );

  // Filter progress 0%
  const counts_0 = LMS_USER_PROGRESS.filter((d) =>
    LMS_COURSE_USERS_ID_0.includes(d.userNumberId)
  ).reduce((acc, obj) => {
    // Find the index of the userNumberId in the accumulator
    const index = acc.findIndex(
      (item) => item.userNumberId === obj.userNumberId
    );

    if (index !== -1) {
      // If the userNumberId is already in the accumulator, increment the count
      acc[index].count++;
    } else {
      // If the userNumberId is not in the accumulator, add it with a count of 1
      acc.push({ userNumberId: obj.userNumberId, count: 1 });
    }

    return acc;
  }, []);

  console.log(counts_0);

  return;
};

main(__filename, __dirname).catch(console.error);
