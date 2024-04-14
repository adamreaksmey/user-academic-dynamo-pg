const tableConfig = {
  user: {
    updateColumns: ["dob", "guardianId", "guardianName"],
    idColumn: "userId",
  },
  student: {
    updateColumns: ["groupStructureId", "structureRecordId"],
    idColumn: "idCard",
  },
  lms_courses_users: {
    updateColumns: ["courseId"],
    idColumn: "userNumberId"
  }
};

const insert_data = (data) => {
  console.log("-- generating sql --");
  let queries = [];
  for (let item of data) {
    // Prepare column names and values
    let columns = Object.keys(item).filter((key) => key !== "tableName");
    let values = columns.map((column) => {
      let value = item[column];
      if (typeof value === "string") {
        return `'${value.replace(/'/g, "''")}'`; // Properly escape single quotes in strings
      } else if (value === null || value === undefined || value === "") {
        return "NULL"; // Explicitly handle null, undefined, and empty string values
      } else {
        return `'${JSON.stringify(value)}'`; // Convert other data types to JSON string and quote
      }
    });

    if (
      tableConfig[item.tableName] &&
      columns.includes(tableConfig[item.tableName].idColumn)
    ) {
      const config = tableConfig[item.tableName];
      let updateColumns = config.updateColumns.filter(col => columns.includes(col));
      
      let updateSet = updateColumns.map(col => {
        let valueIndex = columns.indexOf(col);
        return `"${col}" = ${values[valueIndex] === "''" ? "NULL" : values[valueIndex]}`;
      }).join(", ");

      // If no update columns are present, set the first configurable column to NULL
      if (!updateSet && config.updateColumns.length) {
        updateSet = `"${config.updateColumns[0]}" = NULL`;
      }

      let idIndex = columns.indexOf(config.idColumn);
      let idValue = values[idIndex];

      // Special logic for lms_courses_users
      if (item.tableName === "lms_courses_users") {
        queries.push(`DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.user WHERE "userNumberId" = ${idValue}) THEN
    IF EXISTS (SELECT 1 FROM public.${item.tableName} WHERE "${config.idColumn}" = ${idValue}) THEN
      UPDATE public.${item.tableName} SET ${updateSet} WHERE "${config.idColumn}" = ${idValue};
    ELSE
      INSERT INTO public.${item.tableName} (${columns.map(col => `"${col}"`).join(", ")}) VALUES (${values
        .map(value => (value === "''" ? "NULL" : value))
        .join(", ")});
    END IF;
  END IF;
END $$;`);
      } else {
        // Regular logic for other tables
        queries.push(`DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.${item.tableName} WHERE "${config.idColumn}" = ${idValue}) THEN
    UPDATE public.${item.tableName} SET ${updateSet} WHERE "${config.idColumn}" = ${idValue};
  ELSE
    INSERT INTO public.${item.tableName} (${columns.map(col => `"${col}"`).join(", ")}) VALUES (${values
      .map(value => (value === "''" ? "NULL" : value))
      .join(", ")});
  END IF;
END $$;`);
      }
    } else {
      // Build the standard insert query for other cases
      queries.push(
        `INSERT INTO public.${item.tableName} (${columns
          .map(column => `"${column}"`)
          .join(", ")}) VALUES (${values
          .map(value => (value === "''" ? "NULL" : value))
          .join(", ")});`
      );
    }
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
    fs.writeFileSync(join(__dirname, outputPath), qResponse.join("\n"));
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
