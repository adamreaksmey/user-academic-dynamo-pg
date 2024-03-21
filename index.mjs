import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";

import mapperFunction from "./functions/mapper.mjs";
import { insert_data } from "./functions/sqlGenerator.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let questions = [],
  subjects = [],
  answers = [];

const loadModules = async () => {
  const questionModule = await import("./log/questions/question.mjs");
  questions = questionModule.default;

  const subjectModule = await import("./log/subjects/subject.mjs");
  subjects = subjectModule.default;

  const answerModule = await import("./log/answers/answer.mjs");
  answers = answerModule.default;
};

const main = async (__filename, __dirname) => {
  // Correctly read and convert JSON data to string for JS module export
  // const data = fs.readFileSync(join(__dirname, "./sources/data.json"), "utf8");
  const data = fs.readFileSync(join(__dirname, "./sources/data.json"), "utf8");
  fs.writeFileSync(
    join(__dirname, `./log/data.mjs`),
    `export default ${data};`
  );

  // Convert the module path to a URL string for the dynamic import
  const modulePath = join(__dirname, "./log/data.mjs");
  const jsMapped = await import(pathToFileURL(modulePath).toString());

  mapperFunction(jsMapped.default, fs);
  await loadModules()
    .then(() => {
      console.log({
        question: questions,
        subjects: subjects,
        answers: answers,
      });
    })
    .catch((err) => {
      console.log(err);
    });

  // Continue with your logic
  console.log("Generating sql script....");
  // Further logic for mapper function and SQL generation...

  console.log("SQL file generated successfully.");
};

main(__filename, __dirname).catch(console.error);
