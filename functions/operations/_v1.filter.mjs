export const __MASTER_MAPPER = (
  LMS_USER_PROGRESS,
  userNumberIdSet,
  usersMap
) => {
  // Initialize a map to store progress entries for each userNumberId
  const userProgressMap = new Map();

  // Iterate through LMS_USER_PROGRESS to populate userProgressMap
  LMS_USER_PROGRESS.forEach((progress) => {
    if (userNumberIdSet.has(progress.userNumberId)) {
      if (!userProgressMap.has(progress.userNumberId)) {
        userProgressMap.set(progress.userNumberId, []);
      }
      userProgressMap.get(progress.userNumberId).push(progress.activityId);
    }
  });

  // Prepare the final result array
  const PROBLEMATIC_STUDENTS = [];

  // Iterate through the userNumberIdSet to build the final result
  userNumberIdSet.forEach((userNumberId) => {
    const user = usersMap.get(userNumberId);

    if (user) {
      PROBLEMATIC_STUDENTS.push({
        ...user,
        progressArray: userProgressMap.get(userNumberId) || [],
      });
    }
  });

  return PROBLEMATIC_STUDENTS;
};

export const __fetchUserAnswerFromQA = () => {
  const url = `https://lms.staging.ibfkh.org/api-nest-forum/organization/61f17951-d509-4b60-967b-a84442f949b6/discussions?groupId=edea75b8-93f2-494a-8e13-e51471fcef20&limit=10&page=1&type=undefined`;
};
