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
 * studentId: no need, auto generated
 * schoolId: organizationId
 * campusId: null ( until created )
 * idCard: idCard
 * firstName: firstName
 * lastName: lastName
 * firstNameNative: firstName
 * lastNameNative: lastName
 * gender: smallCase(gender)
 * dob: dob || date_of_birth
 * remark: remark
 * status: status
 *
 */

import {
  dobHandlder,
  idCardHandler,
  startDateHandler,
  isUUID,
} from "./operations/data.mjs";
import { randomUUID } from 'crypto';

const mapperFunction = (data, fs) => {
  console.log("-- mapping file data --");
  // file dirs
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const removedItemName = data.map((item) => item.Item);
  const ibfProdSchoolId = "61f17951-d509-4b60-967b-a84442f949b6";

  const removedValuePrefix = removedItemName
    .map((item, index) => {
      if (!item.hasOwnProperty("schoolId")) {
        return {
          tableName: "guardian",
          guardianId: randomUUID(),
          schoolId: ibfProdSchoolId,
          firstName: item.employer?.S || "N/A",
          lastName: item.employer?.S || "N/A",
          email: `employer${index}@gmail.com`,
          userName: `employer${index}`
        };
      }
      // If the condition is not met, return undefined
      return undefined;
    })
    .filter((item) => item !== undefined);

  // console.log(removedValuePrefix);

  fs.writeFileSync(
    join(__dirname, "../logs/data.mjs"),
    `export default ${JSON.stringify(removedValuePrefix)}`
  );
};

export default mapperFunction;
