import { promises as fs } from "fs";
import { sqlToObjects } from "./sqlToObjects.mjs";
import { fileURLToPath, pathToFileURL } from "url";
import { randomUUID } from "crypto";
import { dirname, join } from "path";
import courses from "../../logs/lms/courses.mjs";

const ibfProdSchoolId = "61f17951-d509-4b60-967b-a84442f949b6";
const ibfCampusId = "76044dab-2031-4b66-bf0c-be3c273f0687";
const incrementor = 0;
import { dobHandlder } from "./data.mjs";

export const processSqlBackup = async (tableName, filePath) => {
  const sqlFileContent = await fs.readFile(filePath, { encoding: "utf8" });
  const objectsContent = (await sqlToObjects(sqlFileContent)).map(
    replaceNullWithEmptyString
  );

  let formattedContent = [];
  if (tableName === "student") {
    const COURSES_USERS = await FETCHED_COURSES_USERS();
    for (const data of objectsContent) {
      const userFound = COURSES_USERS.find(
        (user) => user.userNumberId === data.userNumberId
      );
      const courseInfo = COURSE_INFORMATION(userFound.courseId);
      console.log("COURSE INFO =>", courseInfo);

      formattedContent.push({
        tableName,
        schoolId: ibfProdSchoolId,
        studentId: randomUUID(),
        idCard: data?.idCard || "",
        firstName: data?.firstName || "",
        lastName: data?.lastName || "",
        firstNameNative: data?.firstName || "",
        lastNameNative: data?.lastName || "",
        gender: data?.gender.toLowerCase() || "",
        dob: dobHandlder(data.dob),
        remark: [data.remark?.replaceAll("'", "`") ?? ""],
        status: "start",
        profile: {
          position: data?.position?.replaceAll("'", "`") || "",
          phone: data.phone,
        },
        uniqueKey: data?.idCard,
        campusId: ibfCampusId,
        groupStructureId: courseInfo.groupStructureId,
        structureRecordId: courseInfo.structureRecordId,
      });
    }
  } else {
    formattedContent = objectsContent;
  }

  return formattedContent;
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

const COURSE_INFORMATION = (courseId) => {
  if (!courseId) return "";
  const courseInfo = courses.find((data) => data.lmsCourseId == courseId);
  if (courseInfo) {
    return {
      structureRecordId: courseInfo.structureRecordId,
      groupStructureId: courseInfo.groupStructureId,
    };
  }
  return {
    structureRecordId: null,
    groupStructureId: null,
  };
};
