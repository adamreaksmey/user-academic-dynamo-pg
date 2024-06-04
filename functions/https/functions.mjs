// import fetch from "node-fetch";
import axios from "axios";

import {
  userServiceUrl,
  academicServiceUrl,
  userServicePassword,
  userServiceRoles,
  enrollStudent,
} from "./urls.mjs";

// --------------------------------------------------------------------

const options = {
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};
const headers = {
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};

const IBF_SCHOOL = "61f17951-d509-4b60-967b-a84442f949b6";
const IBF_CAMPUSID = "76044dab-2031-4b66-bf0c-be3c273f0687";

export const enrollStudentAcademic = async (data) => {
  console.log("STUDENT =>", data);

  try {
    const response = await axios.post(
      enrollStudent(IBF_SCHOOL, IBF_CAMPUSID),
      data,
      headers
    );

    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error(`HTTP error! status: ${error.response.status}`);
  }
};

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

  const response = await fetch(
    academicServiceUrl(data.guardianId, IBF_SCHOOL),
    {
      ...options,
      body: JSON.stringify(param),
    }
  );

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

    console.log(iterator);
    if (!response.ok) {
      console.log(response);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    res.push(await response.json());
  }

  return res;
};
