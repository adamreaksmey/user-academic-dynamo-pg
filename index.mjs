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
import guardiansToBeReplaced from "./map/guardians.mjs";

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
  let USERS_PRODUCTION = [];
  let STUDENT_GUARDIAN_PRODUCTION = [];
  let GUARDIANS_DELETION_PRODUCTION = [];

  /**
   * Mapping student to guardian
   * 
   */

  /**
   *  Mapping user to guardian
   */
  const lms_user = "./input_sql/user.sql";
  USERS_PRODUCTION = await processSqlBackup("TESTING", lms_user);

  console.log("email ___");
  console.log(USERS_PRODUCTION.filter((d) => d.email == "___").length);

  console.log("guardianName & guardianId exists ___");
  console.log(
    USERS_PRODUCTION.filter(
      (d) => d.guardianName && d.guardianNameId && d.email == "___"
    ).length
  );

  console.log("employer doesnt exist");
  console.log(USERS_PRODUCTION.filter((d) => !d.employer).length);

  console.log("employer exists but no guardianName and guardianId case ___");
  console.log(
    USERS_PRODUCTION.filter(
      (d) => d.employer && !d.guardianName && !d.guardianNameId
    ).length
  );

  USERS_PRODUCTION = USERS_PRODUCTION.filter(
    (d) =>
      d.employer &&
      !d.guardianName &&
      !d.guardianNameId &&
      d.employer !== "Sala.co" &&
      d.employer !== "Other" &&
      d.employer !== "IBF" &&
      d.employer !== "ABC" &&
      d.employer !== "ibf" &&
      // d.employer !== "KKCM" &&
      d.employer !== "cnguy@paragoniu.edu.kh"
  ).map((data) => {
    const activePeopleCase = "Active People''s Plc.";
    let replacedActivePeople = "Active People's Plc.";

    const guardianName = () => {
      if (data.employer == activePeopleCase) return replacedActivePeople;
      // if (data.employer == "KKCM") return "KKCM" + " " + "employer";
    };

    // Preprocess guardians to a Map for quick access
    const guardianMap = new Map(
      guardiansToBeReplaced.map((guardian) => {
        const guardianName = guardian.replacedName
          .replace(/ +(?= )/g, "")
          .trim();
        return [guardianName, guardian];
      })
    );

    const guardianMap_ = new Map(
      guardians.map((guardian) => {
        const guardianName = (guardian.firstName + guardian.lastName)
          .replace(/ +(?= )/g, "")
          .trim();
        return [guardianName, guardian];
      })
    );

    // console.log(guardianName())
    return {
      tableName: "user",
      idCard: data.idCard,
      guardianName: guardianName(),
      guardianId:
        guardianMap.get(guardianName())?.toBeUpdatedId ||
        guardianMap_.get(guardianName())?.guardianId,
      employer: guardianName()
    };
  });

  console.log("before filtered");
  console.log(USERS_PRODUCTION.length);

  console.log("after filtered");
  console.log(
    USERS_PRODUCTION.filter((d) => d.guardianId && d.guardianName).length
  );

  sqlFileOutPutGenerator(
    insert_data(USERS_PRODUCTION.filter((d) => d.guardianId && d.guardianName)),
    __dirname,
    fs,
    path,
    join,
    "./generated_sql/lms-service/update/user.ASSIGN.sql"
  );

  return;

  USERS_PRODUCTION = await processSqlBackup("user", lms_user).then((data) => {
    sqlFileOutPutGenerator(
      insert_data(data),
      __dirname,
      fs,
      path,
      join,
      "./generated_sql/lms-service/update/user.ASSIGN.sql"
    );
  });

  // console.log(USERS_PRODUCTION)

  const qResponse_finalStudentUPDATE = insert_data(ASSIGN_STUDENT_TO_GUARDIAN);

  const outputPath_finalSTUDENT =
    "./generated_sql/production/generated/student-guardian-update.sql";
  sqlFileOutPutGenerator(
    qResponse_finalStudentUPDATE,
    __dirname,
    fs,
    path,
    join,
    outputPath_finalSTUDENT
  );
};

main(__filename, __dirname).catch(console.error);
