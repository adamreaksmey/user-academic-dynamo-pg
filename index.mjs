import fs from "fs";

import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import path from "path";

import {
  insert_data,
  sqlFileOutPutGenerator,
} from "./functions/sqlGenerator.mjs";
import { processSqlBackup } from "./functions/operations/sqlProcessor.mjs";
import guardians from "./logs/academic/guardians.mjs";

import { sqlToObjects } from "./functions/operations/sqlToObjects.mjs";
import { promises as pfs } from "fs";
import mergedUsers from "./logs/lms/merged.mjs";
import { ObjectHasKey } from "./functions/operations/data.mjs";

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
  let LMS_USERS = [];
  let LMS_COURSES_USERS = [];
  let GUARDIANS_STUDENTS = [];

  let USERS_PRODUCTION = [];
  let STUDENTS_PRODUCTION = [];

  const mappedUsers = mergedUsers.filter(
    (user) => ObjectHasKey(user, "userName") && user.userName
  );
  return;
};

// const combineJsonFiles = async (filePaths, outputFilePath) => {
//   const filePaths = [];
//   for (let i = 1; i < 26; i++) {
//     filePaths.push(`./logs/lms/file${i}.json`);
//   }

//   //   combineJsonFiles(filePaths, "./logs/lms/merged.mjs");
//   try {
//     let combinedData = [];

//     // Loop through the array of file paths and read each file
//     for (const filePath of filePaths) {
//       const fileContents = await pfs.readFile(filePath, "utf8");
//       const data = JSON.parse(fileContents); // Parse the JSON data
//       combinedData = combinedData.concat(data); // Combine the data into a single array
//     }

//     // Prepare the JavaScript module content with default export
//     const jsContent = `export default ${JSON.stringify(
//       combinedData,
//       null,
//       2
//     )};`;

//     // Write the combined data as a .mjs file
//     await pfs.writeFile(outputFilePath, jsContent, "utf8");
//     console.log(`Combined data written to ${outputFilePath}`);

//     return combinedData; // Return the combined data
//   } catch (error) {
//     console.error("Failed to read or write files:", error);
//   }
// };

// const writeToFile = async (data, filePath) => {
//   try {
//     // Convert data to a string if it's not already (e.g., if it's an object or array)
//     const dataString = JSON.stringify(data, null, 2); // Pretty print JSON

//     // Get directory from filePath
//     const dir = path.dirname(filePath);

//     // Check if directory exists; if not, create it
//     try {
//       await pfs.access(dir);
//     } catch (error) {
//       console.log(`Directory does not exist, creating ${dir}...`);
//       await pfs.mkdir(dir, { recursive: true }); // Recursive allows creation of nested directories
//     }

//     // Write the file to the specified path
//     await pfs.writeFile(filePath, dataString);
//     console.log(`Data successfully written to ${filePath}`);
//   } catch (error) {
//     console.error("Failed to write to file:", error);
//   }
// };

main(__filename, __dirname).catch(console.error);
