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

  const removedValuePrefix = removedItemName
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
      (function () {
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

  fs.writeFileSync(
    join(__dirname, "../logs/data.mjs"),
    `export default ${JSON.stringify(removedValuePrefix)}`
  );
};

export default mapperFunction;
