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
  const usersPath = "./generated_sql/production/lms-prod-user.sql";
  USERS_PRODUCTION = await processSqlBackup("user", usersPath);

  const studentsPath = "./generated_sql/production/academic-prod-student.sql";
  STUDENTS_PRODUCTION = await processSqlBackup(
    "student_UPDATEONLY",
    studentsPath
  );

  const filteringStudentsContents = STUDENTS_PRODUCTION.filter(
    (data) => data.structureRecordId == "edfead77-9c32-4709-b868-4648d3fa4cce"
  );

  const filteringUsersContents = USERS_PRODUCTION.filter(
    (data) => data.email == "___"
  ).filter((item) => item.employer && item.idCard);

  console.log(
    "TOTAL USERS FOUND WITH EMPLOYERS",
    filteringUsersContents.length
  );

  // Pre-compute and store normalized employer names and IDs for quick lookup
  const guardianIdByNormalizedEmployerName = new Map();
  guardians.forEach((data) => {
    const normalizedEmployerName = (data.firstName + data.lastName)
      .replace(/\s+/g, "")
      .toLowerCase();
    guardianIdByNormalizedEmployerName.set(
      normalizedEmployerName,
      data.guardianId
    );
  });

  // Active People's Plc. is a special case and can be handled outside the loop
  const activePeoplesPlcId =
    guardianIdByNormalizedEmployerName.get("activepeople'splc.");

  // Map student IDs by idCard for quick lookup
  const studentIdByIdCard = new Map();
  STUDENTS_PRODUCTION.forEach((data) => {
    studentIdByIdCard.set(data.idCard, data.studentId);
  });

  const MAP_STUDENT_TO_GUARDIAN_ACADEMIC = filteringUsersContents
    .map((item) => {
      let guardianId = null;
      if (item.employer === "Active People''s Plc.") {
        guardianId = activePeoplesPlcId;
      } else {
        const normalizedEmployerName = item.employer
          .replace(/\s+/g, "")
          .toLowerCase();
        guardianId = guardianIdByNormalizedEmployerName.get(
          normalizedEmployerName
        );
      }

      return {
        tableName: "student_UPDATEONLY",
        guardianId: guardianId,
        idCard: item.idCard,
        studentId: studentIdByIdCard.get(item.idCard),
      };
    })
    .filter((d) => d.guardianId)
    .map((i) => {
      delete i.idCard;
      return {
        ...i,
      };
    });

  const ASSIGN_STUDENT_TO_GUARDIAN = filteringUsersContents.map((item) => {
    let guardianId = null;
    if (item.employer === "Active People''s Plc.") {
      guardianId = activePeoplesPlcId;
    } else {
      const normalizedEmployerName = item.employer
        .replace(/\s+/g, "")
        .toLowerCase();
      guardianId = guardianIdByNormalizedEmployerName.get(
        normalizedEmployerName
      );
    }
    return {
      tableName: "user",
      guardianId: guardianId,
      guardianName: item.employer,
      userNumberId: item.userNumberId,
    };
  });

  return;
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

  console.log("AFTER MAPPED");
  // console.log(MAP_STUDENT_TO_GUARDIAN_ACADEMIC);

  // const qResponse_finalStudentUPDATE = insert_data(FINAL_STUDENTS_UPDATE);

  // const outputPath_finalSTUDENT =
  //   "./generated_sql/production/generated/students_update.sql";
  // sqlFileOutPutGenerator(
  //   qResponse_finalStudentUPDATE,
  //   __dirname,
  //   fs,
  //   path,
  //   join,
  //   outputPath_finalSTUDENT
  // );

  return;
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

  /**
   *  Mapping students after exportation to guardians
   */
  const student_guardian = LMS_USERS.map((item) => {
    if (item._employer) {
      return {
        tableName: "guardian_student",
        studentId: item.studentId,
        guardianId:
          guardians.find((data) => {
            const employer_name = (data.firstName + data.lastName)
              .replace(/\s+/g, "")
              .toLowerCase();
            return (
              employer_name === item._employer.replace(/\s+/g, "").toLowerCase()
            );
          })?.guardianId || null,
      };
    }
  }).filter((n) => n && n.guardianId);

  fs.writeFileSync(
    join(__dirname, "./logs/backup/student_guardians.mjs"),
    `${JSON.stringify(student_guardian)}`
  );

  /**
   * Generating query for students
   *
   */
  const qResponse = insert_data(
    // delete _employer ( for testing purposes )
    LMS_USERS.map((d) => {
      delete d._employer;
      delete d.userNumberId;
      return {
        ...d,
      };
    })
  );
  const outputPath = "./generated_sql/backup-written/student.sql";
  sqlFileOutPutGenerator(qResponse, __dirname, fs, path, join, outputPath);

  /**
   * Generating query for student_guardians
   *
   */
  const qResponse_studentGuardian = insert_data(student_guardian);
  const outputPath_studentGuardian =
    "./generated_sql/backup-written/student_guardian.sql";
  sqlFileOutPutGenerator(
    qResponse_studentGuardian,
    __dirname,
    fs,
    path,
    join,
    outputPath_studentGuardian
  );

  /**
   * Generating query for guardians
   *
   */
  const qResponse_guardians = insert_data(guardians);
  const outputPath_guardians = "./generated_sql/backup-written/guardians.sql";
  sqlFileOutPutGenerator(
    qResponse_guardians,
    __dirname,
    fs,
    path,
    join,
    outputPath_guardians
  );

  /**
   *
   * Generatiing update for lms_user
   */
  const lms_users = LMS_USERS.map((item) => {
    // console.log(item)
    if (item._employer) {
      // Normalize employer name once
      const normalizedEmployerName = item._employer
        .replace(/\s+/g, "")
        .toLowerCase();

      // Find the matching guardian once
      const matchingGuardian = guardians.find((data) => {
        const employer_name = (data.firstName + data.lastName)
          .replace(/\s+/g, "")
          .toLowerCase();
        return employer_name === normalizedEmployerName;
      });

      // Construct the result object using the found guardian
      return {
        tableName: "user",
        userNumberId: item.userNumberId,
        guardianId: matchingGuardian?.guardianId || null,
        guardianName: matchingGuardian
          ? matchingGuardian.firstName + " " + matchingGuardian.lastName
          : null,
      };
    }
  }).filter((n) => n); // Filter out undefined results

  const qResponse_update_user = insert_data(lms_users);
  const outputPath_update_user =
    "./generated_sql/backup-written/update-user.sql";
  sqlFileOutPutGenerator(
    qResponse_update_user,
    __dirname,
    fs,
    path,
    join,
    outputPath_update_user
  );

  return;
};

main(__filename, __dirname).catch(console.error);
