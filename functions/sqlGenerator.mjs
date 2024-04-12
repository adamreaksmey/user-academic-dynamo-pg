const insert_data = (data) => {
  console.log("-- generating sql --");
  let queries = [];
  for (let item of data) {
    // Prepare column names and values
    let columns = Object.keys(item).filter(
      (key) => key !== "tableName" && key !== "recordType"
    );
    let values = columns.map((column) => {
      let value = item[column];

      if (typeof value === "string") {
        return `'${value.replace(/'/g, "''")}'`;
      } else if (value === null || value === undefined || value === "") {
        return "NULL";
      } else {
        return `'${JSON.stringify(value)}'`;
      }
    });

    // Build the query
    let query = `INSERT INTO public.${item.tableName} (${columns
      .map((column) => `"${column}"`)
      .join(", ")}) VALUES (${values
      .map((value) => (value === "''" ? "NULL" : value))
      .join(", ")});`;
    queries.push(query);
  }
  return queries;
};

const sqlFileOutPutGenerator = (
  qResponse,
  __dirname,
  fs,
  path,
  join,
  outputPath
) => {
  const filePath = path.join(__dirname, outputPath);
  try {
    fs.writeFileSync(
      join(__dirname, outputPath),
      qResponse.join("\n")
    );
  } catch (error) {
    if (error.code === "ENOENT") {
      // Create the parent directory if it doesn't exist
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      // Write the file again
      fs.writeFileSync(filePath, qResponse);
      console.log("File created successfully at", filePath);
    } else {
      console.error("Error occurred while writing the file:", error);
    }
  }
};

export { insert_data, sqlFileOutPutGenerator };
