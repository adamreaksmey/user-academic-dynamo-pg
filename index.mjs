import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import path from "path";
import { learningPath } from "./functions/data/learningPath.mjs";
import { learningPath as stagingLearningPath } from "./functions/data/staging/learningPath.mjs";
import { learningPath as meyLearningPath } from "./functions/data/production/learningPath.mjs";
import { learningPath as localLearningPath } from "./functions/data/local/learningPath.mjs";

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
  let LMS_USERS = [];
  let GUARDIANS = [];

  const searchDelete = (tree, idToDelete) => {
    let cleanTree = tree.filter((el) => el.id != idToDelete);
    for (let i = 0; i < cleanTree.length; i++) {
      if (cleanTree[i].children && cleanTree[i].children.length > 0) {
        cleanTree[i].children = searchDelete(cleanTree[i].children, idToDelete);
      }
    }
    return cleanTree;
  };
  /**
   *  Mapping user to guardian
   */
  const calculateLessonCount = async (lessons) => {
    let countAll = 0;
    const ids = [];

    for (const lesson of lessons) {
      if (lesson.children && lesson.children.length > 0) {
        // Push ids
        for (const child of lesson.children) {
          ids.push(child.id);
        }
        // if lesson/activity has children, we count the progress of its child instead
        const count = await calculateLessonCount(lesson.children);
        countAll = countAll + count;
      } else if (lesson.type == "lesson" || lesson.type == "certification") {
        // for empty lesson
      } else {
        ids.push(lesson.id); // Assuming you want to push the lesson's id if it's not a lesson or certification
        countAll++;
      }
    }
    return countAll;
  };

  calculateLessonCount(localLearningPath).then((result) => {
    console.log("Total learning path =>", result);
  });

  // fs.writeFileSync(
  //   join(__dirname, "./functions/data/production/re-learningPath.mjs"),
  //   `const learningPath = ${JSON.stringify(
  //     searchDelete(meyLearningPath, "49f975eb-15aa-4e94-869e-93165fa67e1e")
  //   )}`
  // );

  return;
};

main(__filename, __dirname).catch(console.error);
