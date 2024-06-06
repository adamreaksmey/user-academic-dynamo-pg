export const userServiceUrl = `https://sms-api.ibfkh.org/user_service/users/direct`;

export const academicServiceUrl = (guardianId, orgId) => {
  return `https://sms-api.ibfkh.org/academic_service/schools/${orgId}/guardians/${guardianId}`;
};

export const userServicePassword = `https://sms-api.ibfkh.org/user_service/direct/users/user_password`;

export const userServiceRoles = `https://sms-api.ibfkh.org/user_service/users/assign_role`;

export const enrollStudent = (orgId, campusId) => {
  return `https://sms-api.ibfkh.org/academic_service/schools/${orgId}/campus/${campusId}/students`;
};

export const academicAssignGuardian = (orgId, guardianId, uniqueKey) => {
  return `https://sms-api.ibfkh.org/academic_service/schools/${orgId}/guardians/${guardianId}/students/${uniqueKey}`;
};

export const academicUnassignGuardian = (orgId, guardianId, uniqueKey) => {
  return `https://sms-api.ibfkh.org/academic_service/schools/${orgId}/guardians/${guardianId}/students/${uniqueKey}`;
};

export const lmsGetUserInfo = (orgId, uniqueKey) => {
  return `https://sms-api.ibfkh.org/lms_service/organizations/${orgId}/users/${uniqueKey}`;
};
