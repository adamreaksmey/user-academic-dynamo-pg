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

import { dobHandlder, headerHandler } from "./operations/data.mjs";

const mapperFunction = (data, fs) => {
  // file dirs
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const removedItemName = data.map((item) => item.Item);
  // fs.writeFileSync("./log/dynamo-logs.js", JSON.stringify(removedItemName));
  const removedValuePrefix = removedItemName.map((item) => {
    let mappedData = {};

    mappedData = {
      tableName: "students",
      schoolId: item.organizationId?.S ?? "",
      campusId: "",
      idCard: item.idCard?.S ?? "",
      firstName: item.firstName?.S ?? "",
      lastName: item.lastName?.S ?? "",
      firstNameNative: item.firstName?.S ?? "",
      lastNameNative: item.lastName?.S ?? "",
      gender: item.gender?.S?.toLowerCase() ?? "",
      dob: dobHandlder(item) ?? "",
      remark: item?.remark?.S ?? "",
      status: item?.status?.S ?? "",
    };

    return mappedData;
  });
  // .filter(Boolean);

  // console.log(removedValuePrefix);

  fs.writeFileSync(
    join(__dirname, "../log/data.mjs"),
    `export default ${JSON.stringify(removedValuePrefix)}`
  );
};

export default mapperFunction;
