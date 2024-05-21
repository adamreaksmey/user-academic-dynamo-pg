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
  let LMS_COURSES_USERS = [];

  /**
   *  Mapping user to guardian
   */
  const lms_users_path = "./input_sql/lms_courses_users_backup.sql";
  LMS_COURSES_USERS = await processSqlBackup("guardian_student", lms_users_path).then(
    (data) => {
      sqlFileOutPutGenerator(
        insert_data(data),
        __dirname,
        fs,
        path,
        join,
        "./generated_sql/academic-service/insert/v2.guardians.sql"
      );
    }
  );
  return;
};

main(__filename, __dirname).catch(console.error);
