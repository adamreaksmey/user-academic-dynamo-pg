export const reWriter = (filePath, fileContent, fs, path) => {
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
};
