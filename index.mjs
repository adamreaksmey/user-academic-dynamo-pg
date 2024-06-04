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
import mergedUsers from "./logs/lms/merged.mjs";
import { ObjectHasKey, newMapper } from "./functions/operations/data.mjs";
import {
  createGuardianOnKeyCloak,
  updateUserNameAcademic,
  assignRoleToClients,
} from "./functions/keycloak/keycloak-lms.mjs";
import { enrollStudentAcademic } from "./functions/https/functions.mjs";
import { g_Keycloak } from "./logs/keycloak/guardians.mjs";
import { toBeEnrolledStudents } from "./logs/academic/tobe-enrolled-students.mjs";

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
const delay = async (ms) => {
  for (let i = ms / 1000; i > 0; i--) {
    console.log(`Waiting for ${i} seconds...`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

const main = async (__filename, __dirname) => {
  const users = await processSqlBackup(
    "none",
    "./input_sql/lms/lms_user_04_06_2024.sql"
  );
  const course_users = await processSqlBackup(
    "none",
    "./input_sql/lms/lms_courses_users_04_06_2024.sql"
  );
  const subjects = await processSqlBackup(
    "none",
    "./input_sql/academic/academic_subject_04_06_2024.sql"
  );

  // ------ Mappers -------
  const usersMap = newMapper(users, "uniqueKey");
  const course_users_map = newMapper(course_users, "userNumberId");
  const subjects_map = newMapper(subjects, "lmsCourseId");
  // ----------------------
  const dataKeys = [
    "phone",
    "email",
    "userName",
    "firstName",
    "lastName",
    "firstNameNative",
    "lastNameNative",
    "gender",
    "dob",
    "guardianId",
    "guardianName",
    "uniqueKey",
    "profile",
    "groupStructureId",
    "structureRecordId",
    "idCard",
  ];
  const finalData = [];

  for (const iterator of toBeEnrolledStudents) {
    const getUserNumberId_by_idCard = usersMap.get(iterator).userNumberId;
    const getCourseInfo_by_userNumberId = course_users_map.get(
      getUserNumberId_by_idCard
    );
    const courseId = getCourseInfo_by_userNumberId.courseId;
    const getStructureInfo = subjects_map.get(courseId);

    const userData = usersMap.get(iterator);
    const dataObject = {};

    for (const key of dataKeys) {
      dataObject[key] = userData[key] == "" ? null : userData[key];
    }

    dataObject.groupStructureId = getStructureInfo.groupStructureId;
    dataObject.structureRecordId = getStructureInfo.structureRecordId;
    dataObject.profile = JSON.parse(userData.profile);

    finalData.push(dataObject);
  }

  // ENROLLMENT HAPPENS HERE
  for (const iterator of finalData) {
    const response = await enrollStudentAcademic(iterator);
    console.log(response);
  }
};

main(__filename, __dirname).catch(console.error);
