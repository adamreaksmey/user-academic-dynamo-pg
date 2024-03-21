export const dobHandlder = (item) => {
  let response = null;
  try {
    if (!item) {
      if (item.hasOwnProperty("date_of_birth")) {
        response = item?.date_of_birth;
      } else if (item.hasOwnProperty("dob")) {
        response = item?.dob;
      }
    } else {
      response = false;
    }
    return response;
  } catch (error) {
    console.log("DOB HANDLER ERROR", error);
  }
};

export const headerHandler = (item) => {
  return (
    (item.hasOwnProperty("idCard") && item.idCard?.S !== "empty") ||
    item.idCard?.S == "" ||
    !item.idCard?.S
  );
};
