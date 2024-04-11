import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";

/**
 *
 * @param {*} data
 * @param {*} fs
 * @param {*} subjects
 * @param {*} questions
 * @param {*} answers
 *
 */

import {
  dobHandlder,
  idCardHandler,
  startDateHandler,
  isUUID,
  fullNameHandler,
} from "./operations/data.mjs";
import { randomUUID } from "crypto";

const mapperFunction = (data, fs) => {
  console.log("-- mapping file data --");
  // file dirs
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const removedItemName = data.map((item) => item.Item);
  const ibfProdSchoolId = "61f17951-d509-4b60-967b-a84442f949b6";

  const guardians = removedItemName
    .map((item, index) => {
      if (!Object.prototype.hasOwnProperty.call(item, "schoolId")) {
        // Extract employer name or default to "N/A"
        const employerName = item.employer?.S || "N/A";
        const fullName = fullNameHandler(employerName) || {};

        // Return an object that includes the employerName for later filtering
        return {
          tableName: "guardian",
          guardianId: randomUUID(),
          schoolId: ibfProdSchoolId,
          firstName: fullName.firstName || "N/A",
          lastName: fullName.lastName || "N/A",
          email: `employer${index}@gmail.com`,
          userName: `employer${index}`,
          employerName,
        };
      }
      // If the condition is not met, return undefined
      return undefined;
    })
    .filter((item) => item !== undefined)
    .filter(
      (() => {
        const seenEmployers = new Set();
        return function (item) {
          if (!seenEmployers.has(item.employerName)) {
            seenEmployers.add(item.employerName);
            return true;
          }
          return false;
        };
      })()
    )
    .filter((item) => item.firstName !== "N/A" && item.lastName !== "N/A")
    .map((data) => {
      delete data.employerName;
      return data;
    });

  const students = removedItemName
    .map((item) => {
      if (!Object.prototype.hasOwnProperty.call(item, "schoolId")) {
        return {
          tableName: "student",
          studentId: item.userId?.S,
          schoolId: ibfProdSchoolId,
          idCard: idCardHandler(item.idCard?.S),
          firstName: item.firstName?.S ?? "N/A",
          lastName: item.lastName?.S ?? "N/A",
          firstNameNative: item.firstName?.S ?? "",
          lastNameNative: item.lastName?.S ?? "",
          gender: item.gender?.S?.toLowerCase() ?? "",
          dob: dobHandlder(item) ?? "",
          remark: [item?.remark?.S?.replaceAll("'", "`") ?? ""],
          status: item?.status?.S ?? "start",
          profile: {
            position: item?.position?.S?.replaceAll("'", "`"),
            phone: item?.phone?.S,
          },
          uniqueKey: idCardHandler(item.idCard?.S),
        };
      }

      if (!item.idCard?.S) {
        usersWithNoIdCard.push(item);
      }
      // If the condition is not met, return undefined
      return undefined;
    })
    .filter((item) => item !== undefined);


    const student_guardian = removedItemName.map((item) => {
      if (!Object.prototype.hasOwnProperty.call(item, "schoolId")) {

      }
    })

  // students
  fs.writeFileSync(
    join(__dirname, "../logs/academic/students.mjs"),
    `export default ${JSON.stringify(students)}`
  );

  // guardians
  fs.writeFileSync(
    join(__dirname, "../logs/data.mjs"),
    `export default ${JSON.stringify(guardians)}`
  );
};

export default mapperFunction;
