export const dobHandlder = (item) => {
  let response = null;
  try {
    if (item) {
      if (item.hasOwnProperty("date_of_birth")) {
        response = item?.date_of_birth?.S;
      } else if (item.hasOwnProperty("dob")) {
        response = item?.dob?.S;
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

export const idCardHandler = (idCard) => {
  if (idCard == "empty") {
    return "";
  }
  return idCard;
};
