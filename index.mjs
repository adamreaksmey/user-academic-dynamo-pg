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
import { sqlToObjects } from "./functions/operations/sqlToObjects.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 
 * @param {*} __filename 
 * @param {*} __dirname 
 * @returns 
 * 
 *  Note: my sql parser isnt working correctly especially dealing with semi colons
 *  so if found, please console log, it will show you which line has a semi colon and
 *  manually remove them yourself.
 */
const main = async (__filename, __dirname) => {
  const sqlFilePath_user = "./generated_sql/lms-service/backup/lms_user_backup.sql";
  const sqlFileContent_user = fs.readFileSync(sqlFilePath_user, { encoding: "utf8" });

  // console.log(sqlFileContent)
  const objectsContent_user = await sqlToObjects(sqlFileContent_user);
  const formattedContent_user = objectsContent_user.map((data) => {
    return {
      tableName: "user",
      ...data,
    };
  });
  fs.writeFileSync(
    "./logs/backup/users.mjs",
    `export default ${JSON.stringify(formattedContent_user)}`
  );

  const sqlFilePath_courses_user = "./generated_sql/lms-service/backup/lms_courses_users_backup.sql";
  const sqlFileContent_courses_user = fs.readFileSync(sqlFilePath_courses_user, { encoding: "utf8" });

  const objectsContent_courses_user = await sqlToObjects(sqlFileContent_courses_user);
  const formattedContent_courses_user = objectsContent_courses_user.map((data) => {
    return {
      tableName: "lms_courses_users",
      ...data,
    };
  });

  fs.writeFileSync(
    "./logs/backup/courses_users.mjs",
    `export default ${JSON.stringify(formattedContent_courses_user)}`
  );

  let modulePath = join(__dirname, "./logs/backup/users.mjs");
  let uniqueUrl = pathToFileURL(modulePath).toString() + "?v=" + Date.now();
  let jsMapped = await import(uniqueUrl);

  const qResponse = insert_data(jsMapped.default);
  const outputPath = "./generated_sql/backup-rewritten/user.sql";
  sqlFileOutPutGenerator(qResponse, __dirname, fs, path, join, outputPath);

  return console.log("Successfully rewritten and mapped user and courses");
  // Getting file contents

  console.log("-- importing file data --");
  const data = fs.readFileSync(join(__dirname, "./sources/data.json"), "utf8");
  const filePath = path.join(__dirname, "./logs/data.mjs");
  const fileContent = `export default ${data};`;

  reWriter(filePath, fileContent, fs, path);

  // Initial import with unique URL to bypass cache
  // let modulePath = join(__dirname, "./logs/data.mjs");
  // let uniqueUrl = pathToFileURL(modulePath).toString() + "?v=" + Date.now();
  // let jsMapped = await import(uniqueUrl);

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

  // const qResponse = insert_data(allData.default);
  // const outputPath = "./generated_sql/academic-service/guardians.sql";
  // sqlFileOutPutGenerator(qResponse, __dirname, fs, path, join, outputPath);
};

main(__filename, __dirname).catch(console.error);
