import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";

import mapperFunction from "./functions/mapper.mjs";
import { insert_data } from "./functions/sqlGenerator.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let _data = [];

const main = async (__filename, __dirname) => {
  // Correctly read and convert JSON data to string for JS module export
  // const data = fs.readFileSync(join(__dirname, "./sources/data.json"), "utf8");
  const data = fs.readFileSync(join(__dirname, "./sources/data.json"), "utf8");
  fs.writeFileSync(
    join(__dirname, `./log/data.mjs`),
    `export default ${data};`
  );

  // Initial import with unique URL to bypass cache
  let modulePath = join(__dirname, "./log/data.mjs");
  let uniqueUrl = pathToFileURL(modulePath).toString() + "?v=" + Date.now();
  let jsMapped = await import(uniqueUrl);

  mapperFunction(jsMapped.default, fs);

  // Import again with a new unique URL to get the updated module
  modulePath = join(__dirname, "./log/data.mjs");
  uniqueUrl = pathToFileURL(modulePath).toString() + "?v=" + Date.now();
  const allData = await import(uniqueUrl);

  console.log("Generating sql script....");
  const qResponse = insert_data(allData.default);
  fs.writeFileSync(
    join(__dirname, `./generated_sql/migration_queries.sql`),
    qResponse.join('\n')
  );

  console.log("SQL file generated successfully.");
};

main(__filename, __dirname).catch(console.error);
