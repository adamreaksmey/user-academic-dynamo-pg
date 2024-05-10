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
  let LMS_USERS = [];
  let LMS_COURSES_USERS = [];
  let GUARDIANS_STUDENTS = [];

  let USERS_PRODUCTION = [];
  let STUDENTS_PRODUCTION = [];

  /**
   *  Mapping the remaining 1401 students in academic to lms users
   *
   */
  const usersPath = "./sources/USERS-BACKUP-08052024.sql";
  USERS_PRODUCTION = await processSqlBackup("user", usersPath);
  console.log("USERS_PRODUCTION", USERS_PRODUCTION);
  return;
};

main(__filename, __dirname).catch(console.error);
