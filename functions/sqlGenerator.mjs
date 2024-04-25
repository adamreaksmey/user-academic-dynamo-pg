const tableConfig = {
  user: {
    updateColumns: ["guardianId", "guardianName", "employer"],
    idColumn: "idCard",
  },
  student: {
    updateColumns: ["groupStructureId", "structureRecordId"],
    idColumn: "idCard",
  },
  lms_courses_users: {
    updateColumns: ["courseId"],
    idColumn: "userNumberId",
  },
  guardian_student: {
    updateColumns: ["guardianId"],
    idColumn: "studentId",
  },
  student_UPDATEONLY: {
    updateColumns: ["guardianId", "studentId"],
    idColumn: "studentId",
  },
  guardian: {
    updateColumns: ["guardianId"],
    idColumn: "guardianId",
  },
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
        return `'${value.replace(/'/g, "`")}'`; // Properly escape single quotes in strings
      } else if (
        value === null ||
        value === undefined ||
        value === "" ||
        value === "NULL"
      ) {
        return "NULL"; // Explicitly handle null, undefined, and empty string values
      } else {
        return `'${JSON.stringify(value)}'`; // Convert other data types to JSON string and quote
      }
    });

    const idCard = (() => {
      return Object.prototype.hasOwnProperty.call(item, "idCard")
        ? item.idCard
        : null;
    })();

    if (
      tableConfig[item.tableName] &&
      columns.includes(tableConfig[item.tableName].idColumn)
    ) {
      const config = tableConfig[item.tableName];
      let updateColumns = config.updateColumns.filter((col) =>
        columns.includes(col)
      );

      let updateSet = updateColumns
        .map((col) => {
          let valueIndex = columns.indexOf(col);
          return `"${col}" = ${
            values[valueIndex] === "''" ? "NULL" : values[valueIndex]
          }`;
        })
        .join(", ");

      // console.log(updateSet)

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
    IF EXISTS (SELECT 1 FROM public.${item.tableName} WHERE "${
          config.idColumn
        }" = ${idValue}) THEN
      UPDATE public.${item.tableName} SET ${updateSet} WHERE "${
          config.idColumn
        }" = ${idValue};
    ELSE
      INSERT INTO public.${item.tableName} (${columns
          .map((col) => `"${col}"`)
          .join(", ")}) VALUES (${values
          .map((value) => (value === "''" ? "NULL" : value))
          .join(", ")});
    END IF;
  END IF;
END $$;`);
      } else if (item.tableName == "student") {
        queries.push(`DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.${item.tableName} WHERE "${
          config.idColumn
        }" = ${idValue}) THEN
  INSERT INTO public.${item.tableName} (${columns
          .map((col) => `"${col}"`)
          .join(", ")}) VALUES (${values
          .map((value) => (value === "''" ? "NULL" : value))
          .join(", ")});
  END IF;
END $$;`);
      } else if (item.tableName === "guardian_student") {
        // Regular logic for other tables
        queries.push(`DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM public.${item.tableName} WHERE "${
          config.idColumn
        }" = ${idValue}) THEN
          INSERT INTO public.${item.tableName} (${columns
          .map((col) => `"${col}"`)
          .join(", ")}) VALUES (${values
          .map((value) => (value === "''" ? "NULL" : value))
          .join(", ")});
          END IF;
        END $$;`);
      } else if (item.tableName == "user") {
        queries.push(`
UPDATE public.${item.tableName}
SET ${updateSet}
WHERE "${config.idColumn}" = ${idValue};
        `);
      } else if (item.tableName == "student_UPDATEONLY" && idValue !== "NULL") {
        queries.push(`DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM public.${item.tableName} WHERE "${
          config.idColumn
        }" = ${idValue}) THEN
          INSERT INTO public.${item.tableName} (${columns
          .map((col) => `"${col}"`)
          .join(", ")}) VALUES (${values
          .map((value) => (value === "''" ? "NULL" : value))
          .join(", ")});
          END IF;
        END $$;`);
      } else if (item.tableName == "guardian") {
        queries.push(
          `DELETE FROM public.${item.tableName} WHERE ${updateSet};`
        );
      }
    } else {
      // Build the standard insert query for other cases
      queries.push(
        `INSERT INTO public.${item.tableName} (${columns
          .map((column) => `"${column}"`)
          .join(", ")}) VALUES (${values
          .map((value) => (value === "''" ? "NULL" : value))
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
