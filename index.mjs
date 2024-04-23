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
  let USERS_PRODUCTION = [];
  let STUDENTS_PRODUCTION = [];
  let STUDENT_GUARDIAN_PRODUCTION = [];

  /**
   *  Mapping student_guardian
   */
  const lms_user = "./input_sql/user.sql";
  USERS_PRODUCTION = await processSqlBackup(null, lms_user);

  const mappedUSERS_PRODUCTION = USERS_PRODUCTION.map((data) => {
    // const foundMapped = guardiansToBeReplaced.find((guardian) => )
    return {
      // guardianName: guardiansToBeReplaced,
    };
  });

  console.log(USERS_PRODUCTION.length);

  // console.log(USERS_PRODUCTION)

  return;
  const usersPath = "./generated_sql/production/lms-prod-user.sql";
  USERS_PRODUCTION = await processSqlBackup("user", usersPath);

  const studentsPath = "./generated_sql/production/academic-prod-student.sql";
  STUDENTS_PRODUCTION = await processSqlBackup(
    "student_UPDATEONLY",
    studentsPath
  );
  console.log(ASSIGN_STUDENT_TO_GUARDIAN);

  const qResponse_finalStudentUPDATE = insert_data(ASSIGN_STUDENT_TO_GUARDIAN);

  const outputPath_finalSTUDENT =
    "./generated_sql/production/generated/student-guardian-update.sql";
  sqlFileOutPutGenerator(
    qResponse_finalStudentUPDATE,
    __dirname,
    fs,
    path,
    join,
    outputPath_finalSTUDENT
  );
};

main(__filename, __dirname).catch(console.error);
