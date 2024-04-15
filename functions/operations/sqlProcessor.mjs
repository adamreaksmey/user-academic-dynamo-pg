import fs from "fs";
import { sqlToObjects } from "./sqlToObjects.mjs";
import { randomUUID } from "crypto";

const ibfProdSchoolId = "61f17951-d509-4b60-967b-a84442f949b6";
const ibfCampusId = "76044dab-2031-4b66-bf0c-be3c273f0687";
const incrementor = 0;
import { dobHandlder } from "./data.mjs";

export const processSqlBackup = async (tableName, filePath) => {
  let formattedContent = [];
  const sqlFileContent = fs.readFileSync(filePath, { encoding: "utf8" });

  const objectsContent = await sqlToObjects(sqlFileContent).map((data) =>
    replaceNullWithEmptyString(data)
  );

  if (tableName == "student") {
    formattedContent = objectsContent.map((data) => {
      return {
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
        groupStructureId: data.userNumberId,
        structureRecordId: null,
      };
    });
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
