-- USER PROGRESS
\copy (SELECT 'INSERT INTO "lms_user_progress" ("activityId", "userNumberId") VALUES ("activityId", "userNumberId");' FROM "lms_user_progress" WHERE "courseId" = 'edea75b8-93f2-494a-8e13-e51471fcef20') TO '/Users/michaellogy/Desktop/sala-projects/dynamo-2-sql-user-academic/input_sql/lms/lms_user_progress_29_05_2024.sql'

-- COURSES USERS
\copy (SELECT 'INSERT INTO "lms_courses_users" ("courseProgress", "userNumberId") VALUES ("courseProgress", "userNumberId");'FROM "lms_courses_users" WHERE "courseId" = 'edea75b8-93f2-494a-8e13-e51471fcef20') TO '/Users/michaellogy/Desktop/sala-projects/dynamo-2-sql-user-academic/input_sql/lms/lms_courses_users_29_05_2024.sql'



-- select count(*)
-- from "lms_user_progress" where
-- "courseId" = 'edea75b8-93f2-494a-8e13-e51471fcef20';

-- select count(*) from "lms_courses_users"
-- where "courseProgress" >= 100
-- and "courseId" = 'edea75b8-93f2-494a-8e13-e51471fcef20'