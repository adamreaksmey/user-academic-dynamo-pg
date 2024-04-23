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
  let STUDENT_GUARDIAN_PRODUCTION = [];
  let GUARDIANS_DELETION_PRODUCTION = [];

  /**
   *  Mapping student_guardian
   */
  // const lms_user = "./input_sql/user.sql";
  // USERS_PRODUCTION = await processSqlBackup("user", lms_user).then((data) => {
  //   sqlFileOutPutGenerator(
  //     insert_data(data),
  //     __dirname,
  //     fs,
  //     path,
  //     join,
  //     "./generated_sql/lms-service/update/user.READY.sql"
  //   );
  // });

  // const student_academic = "./input_sql/guardian_student.sql";
  // STUDENT_GUARDIAN_PRODUCTION = await processSqlBackup(
  //   "guardian_student",
  //   student_academic
  // ).then((data) => {
  //   sqlFileOutPutGenerator(
  //     insert_data(data),
  //     __dirname,
  //     fs,
  //     path,
  //     join,
  //     "./generated_sql/lms-service/update/guardian_student.READY.sql"
  //   );
  // });

  const guardian_academic = "./input_sql/guardian.sql";
  GUARDIANS_DELETION_PRODUCTION = await processSqlBackup(
    "guardian",
    guardian_academic
  ).then((data) => {
    sqlFileOutPutGenerator(
      insert_data(data),
      __dirname,
      fs,
      path,
      join,
      "./generated_sql/lms-service/update/guardian.READY.sql"
    );
  });

  // console.log(USERS_PRODUCTION)

  return;

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
