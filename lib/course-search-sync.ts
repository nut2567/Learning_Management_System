import {
  deleteCourseFromTypesense,
  ensureCoursesCollection,
  importCoursesToTypesense,
  type CourseSearchDocument,
} from "@lib/typesense";
import Courses, { User } from "@models/schema";

type ObjectIdLike = {
  toString: () => string;
};

type StoredInstructor = {
  _id: ObjectIdLike;
  Instructor_Name: string;
  email: string;
  image: string;
  phone: string;
};

type StoredCourse = {
  _id: ObjectIdLike;
  Course_Title: string;
  Course_Title_TH?: string;
  Course_Duration: number;
  Level: string;
  Enrollment_Count: number;
  Status: string;
  image: string;
  userId: ObjectIdLike;
  createdAt?: Date;
};

const toCreatedAtTimestamp = (createdAt?: Date) => {
  if (createdAt instanceof Date) {
    return createdAt.getTime();
  }

  return Date.now();
};

export const buildCourseSearchDocument = (
  course: StoredCourse,
  instructor: StoredInstructor
): CourseSearchDocument => ({
  id: course._id.toString(),
  courseTitle: course.Course_Title,
  courseTitleTh: course.Course_Title_TH ?? "",
  courseDuration: course.Course_Duration,
  level: course.Level,
  enrollmentCount: course.Enrollment_Count,
  status: course.Status,
  image: course.image,
  instructorId: instructor._id.toString(),
  instructorName: instructor.Instructor_Name,
  instructorEmail: instructor.email,
  instructorImage: instructor.image,
  instructorPhone: instructor.phone,
  createdAt: toCreatedAtTimestamp(course.createdAt),
});

export async function getCourseSearchDocuments(courseIds?: string[]) {
  const courseQuery = courseIds ? { _id: { $in: courseIds } } : {};
  const courses = await Courses.find(courseQuery).lean<StoredCourse[]>();
  const instructorIds = Array.from(
    new Set(courses.map((course) => course.userId.toString()))
  );
  const instructors = await User.find({ _id: { $in: instructorIds } }).lean<
    StoredInstructor[]
  >();
  const instructorsById = new Map(
    instructors.map((instructor) => [instructor._id.toString(), instructor])
  );

  return courses.flatMap((course) => {
    const instructor = instructorsById.get(course.userId.toString());
    if (!instructor) {
      return [];
    }

    return [buildCourseSearchDocument(course, instructor)];
  });
}

export async function syncCourseToTypesense(courseId: string) {
  const documents = await getCourseSearchDocuments([courseId]);
  await ensureCoursesCollection();
  const result = await importCoursesToTypesense(documents);

  return { indexedCourses: result.imported };
}

export async function syncInstructorCoursesToTypesense(instructorId: string) {
  const courses = await Courses.find({ userId: instructorId })
    .select("_id")
    .lean<{ _id: ObjectIdLike }[]>();
  const courseIds = courses.map((course) => course._id.toString());
  const documents = await getCourseSearchDocuments(courseIds);
  await ensureCoursesCollection();
  const result = await importCoursesToTypesense(documents);

  return { indexedCourses: result.imported };
}

export async function deleteCourseFromTypesenseIndex(courseId: string) {
  await ensureCoursesCollection();
  return deleteCourseFromTypesense(courseId);
}
