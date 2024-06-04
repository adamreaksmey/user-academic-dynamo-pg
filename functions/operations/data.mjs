import moment from "moment";
import fetch from "node-fetch";

export const variousDateHandler = (date) => {
  return moment(date).format("YYYY-MM-DD");
};

export const dobHandlder = (item) => {
  if (!item) return false;

  try {
    const dateOfBirth = item.date_of_birth?.S || item.dob?.S;
    let response = dateOfBirth ? variousDateHandler(dateOfBirth) : null;
    return response === "Invalid date" ? "" : response;
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

export const ObjectHasKey = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Safe fetch function with retries
export const safeFetch = async (url, options, retries = 5) => {
  try {
    const response = await fetch(url, options);
    if (response?.status === 404) {
      console.log("Not Found:", url);
      return null; // Return null or some other indicator of a 'Not Found' response
    }
    if (response.status === 401) {
      console.log("Unauthorized");
    }
    if (!response.ok) {
      console.log(response);
      throw new Error(`HTTP error! status: ${response?.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error.message);
    if (retries > 0 && response.status !== 404) {
      console.log(`Retrying... (${retries} retries left)`);
      await delay(1000); // Wait 1 second before retrying
      return await safeFetch(url, options, retries - 1);
    } else {
      throw new Error("Max retries reached or Not Found");
    }
  }
};

export const newMapper = (data, key) => {
  return new Map(
    data.map((user) => {
      return [user[key], user];
    })
  );
};
