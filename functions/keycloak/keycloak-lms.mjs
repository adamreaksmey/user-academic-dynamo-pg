import fetch from "node-fetch";
import { safeFetch } from "./functions.mjs";

const userServiceUrl = `https://sms-api.staging.ibfkh.org/user_service/users/direct`;
const options = {
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json", // Include Content-Type header
  },
};
const IBF_SCHOOL = "61f17951-d509-4b60-967b-a84442f949b6";

export const createGuardianOnKeyCloak = async () => {
  const params = {
    username: "d.guardian3",
    firstName: "Draft",
    lastName: "Guardian 3",
    email: "draftGuardian@sala.co",
    phone: "099887766",
    password: "testing-password",
    app: "lms",
    role: "Guardian",
    schoolId: IBF_SCHOOL,
  };

  const response = await fetch(userServiceUrl, {
    ...options,
    body: JSON.stringify(params), // Convert params object to JSON string
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
