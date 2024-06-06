// import fetch from "node-fetch";
import axios from "axios";

import {
  userServiceUrl,
  academicServiceUrl,
  lmsGetUserInfo,
  userServiceRoles,
  enrollStudent,
  academicAssignGuardian,
  academicUnassignGuardian,
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

export const getUserInfo = async (uniqueKey) => {
  try {
    const response = await axios({
      method: "GET",
      url: lmsGetUserInfo(IBF_SCHOOL, uniqueKey),
    });

    // console.log("response from get user info", response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error(`HTTP error! status: ${error.response.status}`);
  }
};

export const unassignStudentFromGuardian = async (data) => {
  const { oldGuardianId, uniqueKey } = data;
  try {
    const response = await axios({
      method: "DELETE",
      url: academicUnassignGuardian(IBF_SCHOOL, oldGuardianId, uniqueKey),
    });

    console.log("response from unassign guardian", response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error(`HTTP error! status: ${error.response.status}`);
  }
};

export const assignGuardian = async (data) => {
  const { guardianId, uniqueKey } = data;
  console.log("From assigning guardian", data);
  try {
    const response = await axios({
      method: "PATCH",
      url: academicAssignGuardian(IBF_SCHOOL, guardianId, uniqueKey),
    });

    console.log("response from guardian", response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error(`HTTP error! status: ${error.response.status}`);
  }
};

export const enrollStudentAcademic = async (data) => {
  try {
    const response = await axios.post(
      enrollStudent(IBF_SCHOOL, IBF_CAMPUSID),
      data,
      headers
    );

    console.log("Enrollment successful!");
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
