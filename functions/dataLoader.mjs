import fs from "fs";

const load_data = (file_path) => {
  let rawdata = fs.readFileSync(file_path, "utf8");
  let modifiedData = rawdata.replace(/\}$/gm, " }, ");
  let data = JSON.stringify([modifiedData]);
  return data;
};

export { load_data };
