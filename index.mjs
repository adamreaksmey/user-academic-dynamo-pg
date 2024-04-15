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

const main = async (__filename, __dirname) => {
  // DynamoDB content transformer
  // formatDynamoDBJson("./sources/data.json", "./sources/data.json", fs);

  const sqlFilePath = "./generated_sql/academic-service/testing-backup-test.sql";
  const sqlFileContent = fs.readFileSync(sqlFilePath, { encoding: "utf8" });

  // console.log(sqlFileContent)
  const jsonContent = await sqlToObjects(sqlFileContent);
  return console.log(jsonContent);
  // Getting file contents

  console.log("-- importing file data --");
  const data = fs.readFileSync(join(__dirname, "./sources/data.json"), "utf8");
  const filePath = path.join(__dirname, "./logs/data.mjs");
  const fileContent = `export default ${data};`;

  reWriter(filePath, fileContent, fs, path);

  // Initial import with unique URL to bypass cache
  let modulePath = join(__dirname, "./logs/data.mjs");
  let uniqueUrl = pathToFileURL(modulePath).toString() + "?v=" + Date.now();
  let jsMapped = await import(uniqueUrl);

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

  const qResponse = insert_data(allData.default);
  const outputPath = "./generated_sql/academic-service/guardians.sql";
  sqlFileOutPutGenerator(qResponse, __dirname, fs, path, join, outputPath);
};

main(__filename, __dirname).catch(console.error);
