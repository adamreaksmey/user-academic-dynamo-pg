import fetch from "node-fetch";
import { safeFetch } from "./functions.mjs";

const userServiceUrl = `https://sms-api.staging.ibfkh.org/user_service/users/direct`;
const options = {
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};
const IBF_SCHOOL = "61f17951-d509-4b60-967b-a84442f949b6";

export const createGuardianOnKeyCloak = async (user) => {
  const params = {
    ...user,
    password: "123456789",
    app: "lms",
    role: "Guardian",
    schoolId: IBF_SCHOOL,
  };

  console.log(params)

  const response = await fetch(userServiceUrl, {
    ...options,
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    console.log(response)
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
