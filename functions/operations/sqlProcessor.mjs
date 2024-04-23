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

export const processSqlBackup = async (tableName = null, filePath) => {
  const sqlFileContent = await fs.readFile(filePath, { encoding: "utf8" });
  const objectsContent = (await sqlToObjects(sqlFileContent)).map(
    replaceNullWithEmptyString
  );

  let formattedContent = [];
  let totalNumberOfUserFound = [];
  let usersNotFound = [];
  let usersWithoutIdCard = [];

  if (tableName === "student") {
    const COURSES_USERS = await FETCHED_COURSES_USERS();
    for (const data of objectsContent) {
      const userFound = COURSES_USERS.find(
        (user) => user.userNumberId === data.userNumberId
      );

      if (!userFound) {
        usersNotFound.push(data);
      }

      if (
        !Object.prototype.hasOwnProperty.call(data, "idCard") &&
        !data.idCard
      ) {
        usersWithoutIdCard.push(data);
      }

      const courseInfo = COURSE_INFORMATION(userFound?.courseId);

      if (userFound) {
        totalNumberOfUserFound.push(userFound);
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
          dob: dobHandlder(data.dob) || "",
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
          _employer:
            data?.employer == "" || !data?.employer ? null : data?.employer,
          userNumberId: data?.userNumberId,
        });
      }
    }
  } else {
    formattedContent = objectsContent;
  }

  // console.log("Total numbers of users from lms", formattedContent.length);
  // console.log(
  //   "Total numbers of users found in lms_courses",
  //   totalNumberOfUserFound.length
  // );
  // console.log("Users not found in course", usersNotFound);
  // console.log("Users without idCard", usersWithoutIdCard);

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
  const courseInfo = courseId
    ? courses.find((data) => data.lmsCourseId == courseId)
    : null;

  return {
    title: courseInfo ? courseInfo.title : null,
    structureRecordId: courseInfo ? courseInfo.structureRecordId : null,
    groupStructureId: courseInfo ? courseInfo.groupStructureId : null,
  };
};
