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
  isUUID
} from "./operations/data.mjs";

const mapperFunction = (data, fs) => {
  console.log("-- mapping file data --");
  // file dirs
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const removedItemName = data.map((item) => item.Item);
  // fs.writeFileSync("./log/dynamo-logs.js", JSON.stringify(removedItemName));
  const removedValuePrefix = removedItemName
    .map((item) => {
      if (!item.hasOwnProperty("schoolId")) {
        return {
          tableName: "student",
          schoolId: isUUID(item.organizationId?.S),
          campusId: "",
          idCard: idCardHandler(item.idCard?.S),
          firstName: item.firstName?.S ?? "N/A",
          lastName: item.lastName?.S ?? "N/A",
          firstNameNative: item.firstName?.S ?? "",
          lastNameNative: item.lastName?.S ?? "",
          gender: item.gender?.S?.toLowerCase() ?? "",
          dob: dobHandlder(item) ?? "",
          remark: [item?.remark?.S ?? ""],
          status: item?.status?.S ?? "N/A",
          profile: {
            position: item?.position?.S?.replace("'", "`"),
            phone: item?.phone?.S,
          },
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
