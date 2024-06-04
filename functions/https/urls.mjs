export const userServiceUrl = `https://sms-api.ibfkh.org/user_service/users/direct`;

export const academicServiceUrl = (guardianId, orgId) => {
  return `https://sms-api.ibfkh.org/academic_service/schools/${orgId}/guardians/${guardianId}`;
};

export const userServicePassword = `https://sms-api.ibfkh.org/user_service/direct/users/user_password`;

export const userServiceRoles = `https://sms-api.ibfkh.org/user_service/users/assign_role`;

export const enrollStudent = (orgId, campusId) => {
  return `https://sms-api.ibfkh.org/academic_service/schools/${orgId}/campus/${campusId}/students`;
};
