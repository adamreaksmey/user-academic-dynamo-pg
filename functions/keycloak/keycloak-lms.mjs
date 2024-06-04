import fetch from "node-fetch";
import { safeFetch } from "./functions.mjs";

const userServiceUrl = `https://sms-api.ibfkh.org/user_service/users/direct`;
const academicServiceUrl = (guardianId) =>
  `https://sms-api.ibfkh.org/academic_service/schools/61f17951-d509-4b60-967b-a84442f949b6/guardians/${guardianId}`;
const userServicePassword = `https://sms-api.ibfkh.org/user_service/direct/users/user_password`;
const userServiceRoles = `https://sms-api.ibfkh.org/user_service/users/assign_role`;

// --------------------------------------------------------------------

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
    customId: user.id,
    app: "lms",
    role: "Guardian",
    schoolId: IBF_SCHOOL,
  };

  console.log(params);

  const response = await fetch(userServiceUrl, {
    ...options,
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    console.log(response);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const updateUserNameAcademic = async (data) => {
  const param = {
    userName: data.username,
  };

  const response = await fetch(academicServiceUrl(data.guardianId), {
    ...options,
    body: JSON.stringify(param),
  });

  if (!response.ok) {
    console.log(response);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const assignRoleToClients = async (data) => {
  const roles = [
    {
      userId: data.id,
      clientId: IBF_SCHOOL,
      role: "Guardian",
      app: "sms",
    },
  ];
  let res = [];

  for (const iterator of roles) {
    const response = await fetch(userServiceRoles, {
      ...options,
      body: JSON.stringify(iterator),
    });

    console.log(iterator)
    if (!response.ok) {
      console.log(response);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    res.push(await response.json())
  }

  return res;

};
