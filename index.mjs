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
import { createGuardianOnKeyCloak } from "./functions/keycloak/keycloak-lms.mjs";

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
const delay = async (ms) => {
  for (let i = ms / 1000; i > 0; i--) {
    console.log(`Waiting for ${i} seconds...`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

const main = async (__filename, __dirname) => {
  const LMS_USERS = await processSqlBackup(
    "GUARDIAN",
    "./sources/KEYCLOAK-GUARDIAN.sql"
  );

  for (let i = 0; i < LMS_USERS.length; i += 3) {
    const batch = LMS_USERS.slice(i, i + 3);

    const promises = batch.map((user) => {
      return createGuardianOnKeyCloak({
        id: user.guardianId,
        username: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      }).then((response) => {
        console.log("Response:", response);
      });
    });

    await Promise.all(promises);

    if (i + 3 < LMS_USERS.length) {
      await delay(5000); // Wait for 5 seconds with countdown
    }
  }

  return LMS_USERS;
};

main(__filename, __dirname).catch(console.error);
