import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import _courses from "../logs/lms/courses.mjs";

/**
 *
 * @param {*} data
 * @param {*} fs
 * @param {*} subjects
 * @param {*} questions
 * @param {*} answers
 *
 */

import {
  dobHandlder,
  idCardHandler,
  startDateHandler,
  isUUID,
  fullNameHandler,
} from "./operations/data.mjs";
import { randomUUID } from "crypto";

const mapperFunction = (data, fs) => {
  console.log("-- mapping file data --");
  // file dirs
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const removedItemName = data.map((item) => item.Item);
  const ibfProdSchoolId = "61f17951-d509-4b60-967b-a84442f949b6";
  const ibfCampusId = "76044dab-2031-4b66-bf0c-be3c273f0687";
  // return console.log('current users data', removedItemName.length)

  /**
   *  ACADEMIC SERVICE ( GUARDIAN TABLE )
   */
  const guardians = removedItemName
    .map((item, index) => {
      if (!Object.prototype.hasOwnProperty.call(item, "schoolId")) {
        // Extract employer name or default to "N/A"
        const employerName = item.employer?.S?.trim() || "N/A";
        const fullName = fullNameHandler(employerName) || {};

        // Return an object that includes the employerName for later filtering
        return {
          tableName: "guardian",
          guardianId: randomUUID(),
          schoolId: ibfProdSchoolId,
          firstName: fullName.firstName || "N/A",
          lastName: fullName.lastName || "N/A",
          email: `employer${index}@gmail.com`,
          userName: `employer${index}`,
          employerName,
        };
      }
      // If the condition is not met, return undefined
      return undefined;
    })
    .filter((item) => item !== undefined)
    .filter(
      (() => {
        const seenEmployers = new Set();
        return function (item) {
          if (!seenEmployers.has(item.employerName)) {
            seenEmployers.add(item.employerName);
            return true;
          }
          return false;
        };
      })()
    )
    .filter((item) => item.firstName !== "N/A" && item.lastName !== "N/A");

  /**
   *  LMS SERVICE ( COURSES TABLE )
   */
  const courses = removedItemName
    .map((item, index) => {
      if (!Object.prototype.hasOwnProperty.call(item, "schoolId")) {
        return item?.courses?.L?.map((data, index) => {
          return {
            organizationId: ibfProdSchoolId,
            title: data.M.title.S || "N/A",
            studentId: item.userId?.S,
            groupStructureId: _courses.find(
              (_data) => _data?.title?.trim() == data?.M?.title?.S?.trim()
            )?.groupStructureId,
            structureRecordId: _courses.find(
              (_data) => _data?.title?.trim() == data?.M?.title?.S?.trim()
            )?.structureRecordId,
            lmsCourseId: _courses.find(
              (_data) => _data?.title?.trim() == data?.M?.title?.S?.trim()
            )?.lmsCourseId,
          };
        });
      }
      return undefined;
    })
    .filter((item) => item !== undefined)
    .flat();

  /**
   *  ACADEMIC SERVICE ( STUDENTS TABLE )
   */
  const courseLookup = courses.reduce((acc, course) => {
    if (!acc[course.studentId]) {
      acc[course.studentId] = [];
    }
    acc[course.studentId].push(course);
    return acc;
  }, {});

  const students = removedItemName.reduce((result, item) => {
    if (!Object.prototype.hasOwnProperty.call(item, "schoolId")) {
      const foundCourses = courseLookup[item.userId?.S] || [];

      if (foundCourses.length > 1)
        console.log("Found user with more than 1 course", foundCourses);

      // Prepare reusable data
      const baseData = {
        tableName: "student",
        studentId: item.userId?.S,
        schoolId: ibfProdSchoolId,
        idCard: idCardHandler(item.idCard?.S),
        firstName: item.firstName?.S ?? "N/A",
        lastName: item.lastName?.S ?? "N/A",
        firstNameNative: item.firstName?.S ?? "",
        lastNameNative: item.lastName?.S ?? "",
        gender: item.gender?.S?.toLowerCase() ?? "",
        dob: dobHandlder(item),
        remark: [item?.remark?.S?.replaceAll("'", "`") ?? ""],
        status: item?.status?.S ?? "start",
        profile: {
          position: item?.position?.S?.replaceAll("'", "`"),
          phone: item?.phone?.S,
        },
        uniqueKey: idCardHandler(item.idCard?.S),
        campusId: ibfCampusId,
      };

      // Handle multiple courses
      if (foundCourses.length > 1) {
        foundCourses.forEach((course, index) => {
          result.push({
            ...baseData,
            studentId: index === 0 ? item.userId?.S : randomUUID(),
            groupStructureId: course.groupStructureId,
            structureRecordId: course.structureRecordId,
          });
        });
      } else if (foundCourses.length <= 1) {
        result.push({
          ...baseData,
          groupStructureId: courses.find(
            (data) => data.studentId == item.userId?.S
          )?.groupStructureId,
          structureRecordId: courses.find(
            (data) => data.studentId == item.userId?.S
          )?.structureRecordId,
          campusId: ibfCampusId,
        });
      }
    }
    return result;
  }, []);

  /**
   *  ACADEMIC SERVICE ( STUDENT_GUARDIAN TABLE)
   */
  console.log("generating student_guardian");
  const student_guardian = removedItemName
    .map((item) => {
      if (!Object.prototype.hasOwnProperty.call(item, "schoolId")) {
        return {
          tableName: "guardian_student",
          studentId: item.userId?.S,
          guardianId:
            guardians.find((data) => data.employerName == item.employer?.S)
              ?.guardianId || null,
        };
      }

      return undefined;
    })
    .filter((item) => item !== undefined && item.guardianId);

  /**
   *  LMS SERVICE ( USER TABLE )
   */
  console.log("generating lms_users");
  let userNumberId = 32974;
  
  const lms_users = removedItemName
    .map((item, index) => {
      if (!Object.prototype.hasOwnProperty.call(item, "schoolId")) {
        return {
          tableName: "user",
          organizationId: ibfProdSchoolId,
          userId: item.userId?.S,
          studentId: item.userId?.S,
          firstName: item.firstName?.S ?? "N/A",
          lastName: item.lastName?.S ?? "N/A",
          firstNameNative: item.firstName?.S ?? "",
          lastNameNative: item.lastName?.S ?? "",
          idCard: idCardHandler(item.idCard?.S),
          gender: item.gender?.S?.toLowerCase() ?? "",
          phone: item?.phone?.S,
          employer: item.employer?.S,
          userName: item.userName?.S || `${item.firstName?.S}.${index}`,
          position: item.position?.S,
          department: [item.department?.S || "N/A"],
          profile: {
            email: item.email?.S || "N/A",
            phone: item?.phone?.S || "N/A",
            userName: item.userName?.S || `${item.firstName?.S}.${index}`,
          },
          email: item.email?.S || "N/A",
          dob: dobHandlder(item),
          remark: [item?.remark?.S?.replaceAll("'", "`") ?? ""],
          uniqueKey: idCardHandler(item.idCard?.S),
          examinations: item?.examinations?.L?.map((exam, index) => {
            return {
              organizationId: exam.M?.organizationId?.S,
              name: exam.M?.name?.S,
              endDate: exam.M?.endDate?.S,
              subjectId: exam.M?.subjectId?.S,
              startDate: exam.M?.startDate?.S,
            };
          }),
          guardianId: guardians.find(
            (_c) => _c.employerName?.trim() == item.employer?.S?.trim()
          )?.guardianId,
          guardianName: guardians.find(
            (_c) => _c.employerName?.trim() == item.employer?.S?.trim()
          )?.employerName,
          userNumberId: userNumberId++,
        };
      }

      return undefined;
    })
    .filter((item) => item !== undefined);

  /**
   *  ACADEMIC SERVICE ( SUBJECT TABLE )
   */
  console.log("generating subjects");
  const subjects = _courses.map((item, index) => {
    return {
      tableName: "subject",
      schoolId: ibfProdSchoolId,
      campusId: ibfCampusId,
      groupStructureId: item.groupStructureId,
      structureRecordId: item.structureRecordId,
      name: item.title,
      nameNative: item.title,
      code: item.code,
      lmsCourseId: item.lmsCourseId,
    };
  });

  /**
   *  LMS SERVICE ( LMS_COURSES_USERS TABLE )
   */
  console.log("generating lms_courses_users");
  const userNumberIdMap = new Map(
    lms_users.map((user) => [user.userId, user.userNumberId])
  );

  const courseMap = new Map(
    courses.map((course) => [course.studentId, course.lmsCourseId])
  );

  console.log("generating lms_courses_users");

  const lms_course_users = removedItemName
    .reduce((result, item) => {
      if (!Object.prototype.hasOwnProperty.call(item, "schoolId")) {
        const userNumberId = userNumberIdMap.get(item.userId?.S);

        // Prepare reusable data
        const baseData = {
          tableName: "lms_courses_users",
          organizationId: ibfProdSchoolId,
          recordType: "enrolluser",
          status: "start",
          progress: 0,
          userProgresses: [],
          userNumberId: userNumberId,
        };

        const foundCourses = courseLookup[item.userId?.S] || [];
        foundCourses.forEach((COURSE) => {
          result.push({
            ...baseData,
            courseId: COURSE.lmsCourseId,
          });
        });

        // Handle case where no or only one course is found using a map lookup
        if (foundCourses.length <= 1) {
          const courseId = courseMap.get(item.userId?.S);
          if (courseId) {
            result.push({
              ...baseData,
              courseId: courseId,
            });
          }
        }
      }

      return result;
    }, [])
    .filter((item) => item.courseId);

  // student_guardian
  fs.writeFileSync(
    join(__dirname, "../logs/academic/guardian_student.mjs"),
    `export default ${JSON.stringify(student_guardian)}`
  );

  // students
  fs.writeFileSync(
    join(__dirname, "../logs/academic/students.mjs"),
    `export default ${JSON.stringify(students)}`
  );

  // guardians
  fs.writeFileSync(
    join(__dirname, "../logs/data.mjs"),
    `export default ${JSON.stringify(
      guardians.map((data) => {
        delete data.employerName;
        return data;
      })
    )}`
  );

  // lms users
  fs.writeFileSync(
    join(__dirname, "../logs/lms/users.mjs"),
    `export default ${JSON.stringify(lms_users)}`
  );

  // subjects
  fs.writeFileSync(
    join(__dirname, "../logs/academic/subjects.mjs"),
    `export default ${JSON.stringify(subjects)}`
  );

  // lms_courses_users
  fs.writeFileSync(
    join(__dirname, "../logs/lms/lms_course_users.mjs"),
    `export default ${JSON.stringify(lms_course_users)}`
  );
};

export default mapperFunction;
