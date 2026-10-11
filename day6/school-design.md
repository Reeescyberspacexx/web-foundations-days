# School Database Design

## Tables

- **students**: one row per student. It has an `id` (primary key), a `name`, and an `email` that must be unique so two students cannot share one.
- **courses**: one row per course. It has an `id` (primary key) and a `title`.
- **enrolments**: one row for each time a student is enrolled on a course. It holds `student_id` and `course_id` (both foreign keys) and the `grade`. Its primary key is the pair `(student_id, course_id)`, so the same student cannot enrol on the same course twice.

## Relationships

- **One-to-many:** one student has many enrolments, and one course has many enrolments. Each enrolment row belongs to exactly one student and one course, so it holds a foreign key to each.
- **Many-to-many:** students and courses are many-to-many. One student takes many courses, and one course has many students.
- **Why a join table is needed:** a student cannot store several course ids in one column, because each column must hold one value. A course cannot do this for students either. The `enrolments` table stores one row per student-course pair, and it is also the natural place for the grade, because a grade belongs to the pair and not to the student or the course alone.

## Index

I would add an index on `enrolments(course_id)`:

`CREATE INDEX idx_enrolments_course_id ON enrolments(course_id);`

The primary key `(student_id, course_id)` already speeds up searches by student. Searches by course, such as "all students on this course" or "number of students per course", would otherwise have to scan every enrolment row. The index lets the database jump straight to the matching rows. The cost is slightly slower inserts and a little extra storage, which is a good trade for a read-heavy system.

## SQL or NoSQL?

I would choose SQL. The school data is clearly structured and full of relationships between students, courses and enrolments, which SQL handles well with foreign keys and JOINs. Rules such as a unique email, no duplicate enrolments, and "an enrolment must point to a real student and course" are enforced by the database itself, so the data stays correct. Questions such as "which students have no enrolments" are simple with a LEFT JOIN. A document database could work, but related data would be duplicated or embedded, which makes updates and consistency harder.
