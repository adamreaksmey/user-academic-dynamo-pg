export const sqlToObjects = (sql) => {
  // Split the input into individual INSERT statements
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Function to parse a single INSERT statement into an object
  const parseInsertStatement = (statement) => {
    // Extract column names
    // console.log("statement", statement)
    const columnPart = statement.match(/\(([^)]+)\)/)[1];
    const columns = columnPart
      .split(",")
      .map((column) => column.trim().replace(/"/g, ""));

    // Extract the values part, starting from 'VALUES (' to the end of the statement, excluding the last parenthesis.
    const valuesPart = statement.match(/VALUES\s+\((.+)\)$/)[1];

    // Manually parse the values to consider nested commas and parentheses
    const values = [];
    let current = "";
    let inQuotes = false;
    let parenDepth = 0;
    for (let i = 0; i < valuesPart.length; i++) {
      const char = valuesPart[i];

      if (char === "'" && !inQuotes) {
        inQuotes = true;
        current += char;
      } else if (char === "'" && inQuotes) {
        inQuotes = false;
        current += char;
        if (i + 1 < valuesPart.length && valuesPart[i + 1] !== ",") {
          continue;
        }
      } else if (inQuotes) {
        current += char;
      } else if (char === "(") {
        parenDepth++;
        current += char;
      } else if (char === ")") {
        if (parenDepth > 0) {
          parenDepth--;
          current += char;
        }
      } else if (char === "," && parenDepth === 0 && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    if (current !== "") {
      values.push(current.trim());
    }

    // Create the object
    const rowObject = {};
    columns.forEach((column, index) => {
      rowObject[column] = values[index].replace(/^'(.*)'$/, "$1");
    });

    return rowObject;
  };

  return statements.map(parseInsertStatement);
};
