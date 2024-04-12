import moment from "moment";

export const dobHandlder = (item) => {
  let response = null;
  try {
    if (item) {
      if (Object.prototype.hasOwnProperty.call(item, "date_of_birth")) {
        response = variousDateHandler(item?.date_of_birth?.S);
      } else if (Object.prototype.hasOwnProperty.call(item, "dob")) {
        response = variousDateHandler(item?.dob?.S);
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

export const fullNameHandler = (item) => {
  if (!item) return "N/A";
  const sentence = item;
  const firstSpaceIndex = sentence.indexOf(" ");

  // Get the part up to and including the first space
  const firstValue =
    firstSpaceIndex !== -1
      ? sentence.substring(0, firstSpaceIndex + 1)
      : sentence;

  // Get the rest of the sentence after the first space, or "employer" if there's no space
  const restOfSentence =
    firstSpaceIndex !== -1
      ? sentence.substring(firstSpaceIndex + 1)
      : "employer";

  return {
    firstName: firstValue,
    lastName: restOfSentence,
  };
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

export const updateUserByName = (usersArray, name, newDetails) => {
  const index = usersArray.findIndex((user) => user.name === name);

  // Check if the user was found
  if (index !== -1) {
    // Update the user's details with newDetails
    usersArray[index] = { ...usersArray[index], ...newDetails };
    return true; // Return true to indicate success
  }

  return false; // Return false if the user was not found
};
