PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS enrolments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

CREATE TABLE students (
  id     INTEGER PRIMARY KEY,
  name   TEXT NOT NULL,
  email  TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
  id     INTEGER PRIMARY KEY,
  title  TEXT NOT NULL
);

CREATE TABLE enrolments (
  student_id  INTEGER NOT NULL,
  course_id   INTEGER NOT NULL,
  grade       TEXT,
  PRIMARY KEY (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

INSERT INTO students (name, email) VALUES ('Amina Otieno', 'amina@example.com');
INSERT INTO students (name, email) VALUES ('Brian Kamau', 'brian@example.com');
INSERT INTO students (name, email) VALUES ('Grace Wanjiku', 'grace@example.com');
INSERT INTO students (name, email) VALUES ('David Mwangi', 'david@example.com');

INSERT INTO courses (title) VALUES ('Web Development');
INSERT INTO courses (title) VALUES ('Databases');
INSERT INTO courses (title) VALUES ('Mathematics');

INSERT INTO enrolments (student_id, course_id, grade) VALUES (1, 1, 'A');
INSERT INTO enrolments (student_id, course_id, grade) VALUES (1, 2, 'B');
INSERT INTO enrolments (student_id, course_id, grade) VALUES (2, 1, 'B');
INSERT INTO enrolments (student_id, course_id, grade) VALUES (2, 3, 'C');
INSERT INTO enrolments (student_id, course_id, grade) VALUES (3, 2, 'A');
INSERT INTO enrolments (student_id, course_id, grade) VALUES (3, 3, 'B');

-- Query 1: all courses for one student (by name)
SELECT courses.title, enrolments.grade
FROM students
JOIN enrolments ON enrolments.student_id = students.id
JOIN courses ON courses.id = enrolments.course_id
WHERE students.name = 'Amina Otieno';

-- Query 2: all students on one course
SELECT students.name, students.email
FROM courses
JOIN enrolments ON enrolments.course_id = courses.id
JOIN students ON students.id = enrolments.student_id
WHERE courses.title = 'Web Development';

-- Query 3: number of students per course
SELECT courses.title, COUNT(enrolments.student_id) AS student_count
FROM courses
LEFT JOIN enrolments ON enrolments.course_id = courses.id
GROUP BY courses.id;

-- Query 4: students who have no enrolments
SELECT students.name
FROM students
LEFT JOIN enrolments ON enrolments.student_id = students.id
WHERE enrolments.student_id IS NULL;

-- Query 5: update one enrolment's grade
UPDATE enrolments
SET grade = 'A'
WHERE student_id = 2 AND course_id = 3;