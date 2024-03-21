import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";

const mapperFunction = (
  data,
  fs,
  subjects = [],
  questions = [],
  answers = []
) => {
  // file dirs
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const removedItemName = data.map((item) => item.Item);
  fs.writeFileSync("./log/dynamo-logs.js", JSON.stringify(removedItemName));
  const removedValuePrefix = removedItemName.map((item) => {
    let mappedData;

    mappedData = {

      tableName: "answers",
    };
    answers.push(mappedData);
  });

  fs.writeFileSync(
    join(__dirname, "../log/data.mjs"),
    `export default ${JSON.stringify(removedValuePrefix)}`
  );
};

export default mapperFunction;
