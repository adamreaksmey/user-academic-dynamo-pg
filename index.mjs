import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import path from "path";

import mapperFunction from "./functions/mapper.mjs";
import {
  insert_data,
  sqlFileOutPutGenerator,
} from "./functions/sqlGenerator.mjs";
import { reWriter } from "./functions/re-writer.mjs";
import { processSqlBackup } from "./functions/operations/sqlProcessor.mjs";

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
  let LMS_COURSES_USERS = [];

  /**
   *  Export lms_courses_users
   */
  LMS_COURSES_USERS = await processSqlBackup(
    "lms_courses_users",
    "./generated_sql/lms-service/backup/lms_courses_users_backup.sql"
  );
  fs.writeFileSync(
    join(__dirname, "./logs/backup/courses_users.mjs"),
    `export default ${JSON.stringify(LMS_COURSES_USERS)}`
  );

  /**
   *  Export users to students
   */
  LMS_USERS = await processSqlBackup(
    "student",
    "./generated_sql/lms-service/backup/lms_user_backup.sql"
  );

  const qResponse = insert_data(LMS_USERS);
  const outputPath = "./generated_sql/backup-written/student.sql";
  sqlFileOutPutGenerator(qResponse, __dirname, fs, path, join, outputPath);

  return;

  /**
   * Guardians
   */
  modulePath = join(__dirname, "./logs/data.mjs");
  uniqueUrl = pathToFileURL(modulePath).toString() + "?v=" + Date.now();
  const allData = await import(uniqueUrl);

  // const qResponse = insert_data(allData.default);
  // const outputPath = "./generated_sql/academic-service/guardians.sql";
  // sqlFileOutPutGenerator(qResponse, __dirname, fs, path, join, outputPath);
};

main(__filename, __dirname).catch(console.error);
