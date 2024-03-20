const insert_data = (data) => {
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
    let query = `INSERT INTO ${item.tableName} (${columns
      .map((column) => `"${column}"`)
      .join(", ")}) VALUES (${values
      .map((value) => (value === "''" ? "NULL" : value))
      .join(", ")});`;
    queries.push(query);
  }
  return queries;
};

export { insert_data };
