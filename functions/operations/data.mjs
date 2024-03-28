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

    if (response == "Invalid date") {
      response = "";
    }
    return response;
  } catch (error) {
    console.log("DOB HANDLER ERROR", error);
  }
};

export const startDateHandler = (item) => {
  let response = null;
  if (item.hasOwnProperty("NULL")) {
    response = "";
  } else if (item.hasOwnProperty("S")) {
    response = item?.S;
  }

  return response;
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

export const isUUID = (value) => {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isUUID = uuidPattern.test(value);
  if (isUUID) return value;
  return "b740450d-a05d-4e1d-a235-1d507702f30d";
};
