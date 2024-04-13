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
import formatDynamoDBJson from "./functions/dynamo-formatter.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const main = async (__filename, __dirname) => {
  // DynamoDB content transformer
  formatDynamoDBJson("./sources/data.json", "./sources/data.json", fs);

  console.log("-- importing file data --");
  const data = fs.readFileSync(join(__dirname, "./sources/data.json"), "utf8");
  const filePath = path.join(__dirname, "./logs/data.mjs");
  const fileContent = `export default ${data};`;

  reWriter(filePath, fileContent, fs, path);

  // Initial import with unique URL to bypass cache
  let modulePath = join(__dirname, "./logs/data.mjs");
  let uniqueUrl = pathToFileURL(modulePath).toString() + "?v=" + Date.now();
  let jsMapped = await import(uniqueUrl);

  // mapping your json data beforing to the sql generator
  mapperFunction(jsMapped.default, fs);

  // Import again with a new unique URL to get the updated module
  console.log("-- re-importing --");

  /**
   * Guardians
   */
  modulePath = join(__dirname, "./logs/data.mjs");
  uniqueUrl = pathToFileURL(modulePath).toString() + "?v=" + Date.now();
  const allData = await import(uniqueUrl);

  const qResponse = insert_data(allData.default);
  const outputPath = "./generated_sql/academic-service/guardians.sql";
  sqlFileOutPutGenerator(qResponse, __dirname, fs, path, join, outputPath);

  console.log("\x1b[36m%s\x1b[0m", "--- GUARDIANS HAVE BEEN GENERATED ---");

  /**
   * Students ( mapped )
   */
  modulePath = join(__dirname, "./logs/academic/students.mjs");
  uniqueUrl = pathToFileURL(modulePath).toString() + "?v=" + Date.now();
  const allData_students = await import(uniqueUrl);

  const qResponse_students = insert_data(allData_students.default);
  const outputPath_students = "./generated_sql/academic-service/students.sql";
  sqlFileOutPutGenerator(
    qResponse_students,
    __dirname,
    fs,
    path,
    join,
    outputPath_students
  );

  console.log("\x1b[36m%s\x1b[0m", "--- STUDENTS HAVE BEEN GENERATED ---");

  /**
   * Guard Students junction table ( mapped )
   */
  modulePath = join(__dirname, "./logs/academic/guardian_student.mjs");
  uniqueUrl = pathToFileURL(modulePath).toString() + "?v=" + Date.now();
  const allData_students_guardian = await import(uniqueUrl);

  const qResponse_students_guardian = insert_data(
    allData_students_guardian.default
  );
  const outputPath_students_guardian =
    "./generated_sql/academic-service/guardian_student.sql";
  sqlFileOutPutGenerator(
    qResponse_students_guardian,
    __dirname,
    fs,
    path,
    join,
    outputPath_students_guardian
  );

  console.log(
    "\x1b[33m%s\x1b[0m",
    "--- Guardian Students junction HAVE BEEN GENERATED ---"
  );

  /**
   * LMS USERS
   */
  modulePath = join(__dirname, "./logs/lms/users.mjs");
  uniqueUrl = pathToFileURL(modulePath).toString() + "?v=" + Date.now();
  const allData_lms_users = await import(uniqueUrl);

  const qResponse_lms_users = insert_data(allData_lms_users.default);
  const outputPath_lms_users = "./generated_sql/lms-service/users.sql";
  sqlFileOutPutGenerator(
    qResponse_lms_users,
    __dirname,
    fs,
    path,
    join,
    outputPath_lms_users
  );

  console.log(
    "\x1b[33m%s\x1b[0m",
    "--- LMS users junction HAVE BEEN GENERATED ---"
  );

  /**
   *  ACADEMIC SUBJECTS
   */
  modulePath = join(__dirname, "./logs/academic/subjects.mjs");
  uniqueUrl = pathToFileURL(modulePath).toString() + "?v=" + Date.now();
  const allData_subjects = await import(uniqueUrl);

  const qResponse_subjects = insert_data(allData_subjects.default);
  const outputPath_subjects = "./generated_sql/academic-service/subjects.sql";
  sqlFileOutPutGenerator(
    qResponse_subjects,
    __dirname,
    fs,
    path,
    join,
    outputPath_subjects
  );

  console.log("\x1b[33m%s\x1b[0m", "--- Subjects HAVE BEEN GENERATED ---");

  /**
   *  LMS COURSE USER JUNCTION TABLE
   */
  modulePath = join(__dirname, "./logs/lms/lms_course_users.mjs");
  uniqueUrl = pathToFileURL(modulePath).toString() + "?v=" + Date.now();
  const allData_course_user = await import(uniqueUrl);

  const qResponse_course_user = insert_data(allData_course_user.default);
  const outputPath_course_user =
    "./generated_sql/lms-service/lms_course_users.sql";
  sqlFileOutPutGenerator(
    qResponse_course_user,
    __dirname,
    fs,
    path,
    join,
    outputPath_course_user
  );

  console.log(
    "\x1b[33m%s\x1b[0m",
    "--- LMS USERS COURSES HAVE BEEN GENERATED ---"
  );

  console.log("SQL file generated successfully.");
};

main(__filename, __dirname).catch(console.error);
