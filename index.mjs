// import { load_data } from "./functions/dataLoader.mjs";
// import { insert_data } from "./functions/sqlGenerator.mjs";
// import fs from "fs";
// import { fileURLToPath } from 'url';
// import { dirname, join, path } from 'path';

// import mapperFunction from "./functions/mapper.mjs";

// const main = async () => {
//   const __filename = fileURLToPath(import.meta.url);
//   const __dirname = dirname(__filename);

//   const data = fs.readFileSync("./sources/data.json");
//   fs.writeFileSync(`./log/data.mjs`, "export default" + data);

//   const modulePath = path.join(__dirname, "./log/data.mjs");
//   const jsMapped = await import(modulePath);
//   console.log(jsMapped);

//   // very important function, it maps data to generate correct queries.
//   // mapperFunction(mainData, fs);

//   console.log("Generating sql script....");
//   // console.log(subject)

//   // for (let i = 0; i < _data.length; i++) {
//   //   const queries = insert_data(_data[i]);
//   //   contents.push(queries.join("\n"));
//   // }

//   // fs.writeFileSync(`./generated_sql/subjects/subject.sql`, contents[0]);
//   // fs.writeFileSync(`./generated_sql/questions/question.sql`, contents[1]);
//   // fs.writeFileSync(`./generated_sql/answers/answer.sql`, contents[2]);

//   console.log("SQL file generated successfully.");
// };

// main();
import fs from "fs";
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

// Assuming mapperFunction, load_data, insert_data are correctly implemented and not shown here for brevity.
import mapperFunction from "./functions/mapper.mjs";

const main = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Correctly read and convert JSON data to string for JS module export
  const data = fs.readFileSync(join(__dirname, "./sources/data.json"), "utf8");
  fs.writeFileSync(join(__dirname, `./log/data.mjs`), `export default ${data};`);

  // Convert the module path to a URL string for the dynamic import
  const modulePath = join(__dirname, "./log/data.mjs");
  const jsMapped = await import(pathToFileURL(modulePath).toString());
  console.log(jsMapped.default); // Assuming you want to log the default export

  // Continue with your logic
  console.log("Generating sql script....");
  // Further logic for mapper function and SQL generation...

  console.log("SQL file generated successfully.");
};

main().catch(console.error);
