import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import path from "path";

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
  let LMS_USERS = [];
  let GUARDIANS = [];

  /**
   *  Mapping user to guardian
   */
  const guardians_path = "./input_sql/academic_guardians_22_05_2024.sql";
  GUARDIANS = await await processSqlBackup("guardians", guardians_path);

  const lms_users_path = "./input_sql/lms_user_21_05_2024.sql";
  LMS_USERS = await processSqlBackup("guardian_student", lms_users_path).then(
    (data) => {
      sqlFileOutPutGenerator(
        insert_data(
          // excluding those that dont exist
          data.filter((student) => GUARDIANS.includes(student.guardianId))
        ),
        __dirname,
        fs,
        path,
        join,
        "./generated_sql/academic-service/insert/v2.guardians.sql"
      );
    }
  );

  // console.log("before filter", LMS_USERS.length);
  // console.log(
  //   "after filter",
  //   LMS_USERS.filter((student) => GUARDIANS.includes(student.guardianId)).length
  // );

  // console.log(
  //   "undefined guardians",
  //   LMS_USERS.filter((student) => !GUARDIANS.includes(student.guardianId))
  // );
  return;
};

main(__filename, __dirname).catch(console.error);
