import { promises as fs } from "fs";
import { sqlToObjects } from "./sqlToObjects.mjs";
import { fileURLToPath, pathToFileURL } from "url";
import { randomUUID } from "crypto";
import { dirname, join } from "path";
// import courses from "../../logs/lms/courses.mjs";

const ibfProdSchoolId = "61f17951-d509-4b60-967b-a84442f949b6";
const ibfCampusId = "76044dab-2031-4b66-bf0c-be3c273f0687";
const incrementor = 0;
import { dobHandlder } from "./data.mjs";
import guardians from "../../logs/academic/guardians.mjs";
import guardiansToBeReplaced from "../../map/guardians.mjs";

export const processSqlBackup = async (tableName = null, filePath) => {
  const sqlFileContent = await fs.readFile(filePath, { encoding: "utf8" });
  const objectsContent = (await sqlToObjects(sqlFileContent)).map(
    replaceNullWithEmptyString
  );

  let formattedContent = [];

  if (tableName === "guardian_student") {
    for (const data of objectsContent) {
      formattedContent.push({
        tableName,
        uniqueKey: data.idCard,
        guardianId: data.guardianId,
      });
    }
  } else {
    formattedContent = objectsContent;
  }

  return formattedContent;
};

const objHasKey = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

const replaceNullWithEmptyString = (data) => {
  for (const key in data) {
    if (data[key] === "NULL") {
      data[key] = "";
    }
  }
  return data;
};

const FETCHED_COURSES_USERS = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const modulePath = join(__dirname, "../../logs/backup/courses_users.mjs");
  const uniqueUrl = pathToFileURL(modulePath).toString() + "?v=" + Date.now();
  const { default: COURSES_USERS } = await import(uniqueUrl);

  return COURSES_USERS;
};

// const COURSE_INFORMATION = (courseId) => {
//   const courseInfo = courseId
//     ? courses.find((data) => data.lmsCourseId == courseId)
//     : null;

//   return {
//     title: courseInfo ? courseInfo.title : null,
//     structureRecordId: courseInfo ? courseInfo.structureRecordId : null,
//     groupStructureId: courseInfo ? courseInfo.groupStructureId : null,
//   };
// };
