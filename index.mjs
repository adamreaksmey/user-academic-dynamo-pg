import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";

import mapperFunction from "./functions/mapper.mjs";
import { insert_data } from "./functions/sqlGenerator.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const main = async (__filename, __dirname) => {
  // Correctly read and convert JSON data to string for JS module export
  // const data = fs.readFileSync(join(__dirname, "./sources/data.json"), "utf8");
  console.log("-- importing file data --");

  const data = fs.readFileSync(join(__dirname, "./sources/data.json"), "utf8");
  const filePath = path.join(__dirname, "./log/data.mjs");
  const fileContent = `export default ${data};`;

  try {
    fs.writeFileSync(filePath, fileContent);
    console.log("File created successfully at", filePath);
  } catch (error) {
    if (error.code === "ENOENT") {
      // Create the parent directory if it doesn't exist
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      // Write the file again
      fs.writeFileSync(filePath, fileContent);
      console.log("File created successfully at", filePath);
    } else {
      console.error("Error occurred while writing the file:", error);
    }
  }

  // Initial import with unique URL to bypass cache
  let modulePath = join(__dirname, "./log/data.mjs");
  let uniqueUrl = pathToFileURL(modulePath).toString() + "?v=" + Date.now();
  let jsMapped = await import(uniqueUrl);

  console.log("-- mapping file data --");
  mapperFunction(jsMapped.default, fs);

  // Import again with a new unique URL to get the updated module
  console.log("-- re-importing --");

  modulePath = join(__dirname, "./log/data.mjs");
  uniqueUrl = pathToFileURL(modulePath).toString() + "?v=" + Date.now();
  const allData = await import(uniqueUrl);

  console.log(allData.default);

  console.log("-- generating sql --");
  const qResponse = await insert_data(allData.default);
  fs.writeFileSync(
    join(__dirname, `./generated_sql/migration_queries.sql`),
    qResponse.join("\n")
  );

  console.log("SQL file generated successfully.");
};

main(__filename, __dirname).catch(console.error);
