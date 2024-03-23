export const reWriter = (filePath, fileContent, fs, path) => {
  try {
    console.log("logs/data.mjs file found! re-writing data!")
    fs.writeFileSync(filePath, fileContent);
    console.log("Content successfully written to logs/data.mjs")
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
};
