import { connectMongoDB } from "@lib/mongodb";
import {
  ensureCoursesCollection,
  importCoursesToTypesense,
  TYPESENSE_COURSES_COLLECTION,
  type CourseSearchDocument,
} from "@lib/typesense";
import Courses, { User } from "@models/schema";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

type ObjectIdLike = {
  toString: () => string;
};

type SeedInstructorInput = {
  Instructor_Name: string;
  age: number;
  email: string;
  image: string;
  phone: string;
};

type SeedCourseInput = {
  Course_Title: string;
  instructorName: string;
  Course_Duration: number;
  Level: string;
  Enrollment_Count: number;
  Status: string;
  image: string;
};

type SeedPayload = {
  reset?: boolean;
  instructors?: SeedInstructorInput[];
  courses?: SeedCourseInput[];
};

type StoredInstructor = SeedInstructorInput & {
  _id: ObjectIdLike;
  createdAt?: Date;
};

type StoredCourse = Omit<SeedCourseInput, "instructorName"> & {
  _id: ObjectIdLike;
  userId: ObjectIdLike;
  createdAt?: Date;
};

const defaultInstructors: SeedInstructorInput[] = [
  {
    Instructor_Name: "Ariya Wong",
    age: 34,
    email: "ariya.wong@example.com",
    image: "/bukky.jpg",
    phone: "081-234-5678",
  },
  {
    Instructor_Name: "Nattapol Chai",
    age: 39,
    email: "nattapol.chai@example.com",
    image: "/nut.jpg",
    phone: "082-345-6789",
  },
  {
    Instructor_Name: "Mira Stark",
    age: 31,
    email: "mira.stark@example.com",
    image: "/Jon_Snow.png",
    phone: "083-456-7890",
  },
  {
    Instructor_Name: "Thanin Techasiri",
    age: 42,
    email: "thanin.tech@example.com",
    image: "/Titan.jpg",
    phone: "084-567-8901",
  },
];

const defaultCourses: SeedCourseInput[] = [
  {
    Course_Title: "Next.js Foundations",
    instructorName: "Ariya Wong",
    Course_Duration: 6.3,
    Level: "Beginner",
    Enrollment_Count: 1_480,
    Status: "Open",
    image: "/16_9.png",
  },
  {
    Course_Title: "MongoDB for LMS Data",
    instructorName: "Nattapol Chai",
    Course_Duration: 5.45,
    Level: "Intermediate",
    Enrollment_Count: 980,
    Status: "Open",
    image: "/16_6.png",
  },
  {
    Course_Title: "Typesense Search Essentials",
    instructorName: "Thanin Techasiri",
    Course_Duration: 4.2,
    Level: "Intermediate",
    Enrollment_Count: 760,
    Status: "Open",
    image: "/16_4.png",
  },
  {
    Course_Title: "Accessible Course Design",
    instructorName: "Mira Stark",
    Course_Duration: 3.3,
    Level: "Beginner",
    Enrollment_Count: 1_120,
    Status: "Open",
    image: "/16_i.png",
  },
  {
    Course_Title: "Advanced Content Operations",
    instructorName: "Thanin Techasiri",
    Course_Duration: 7.15,
    Level: "Advanced",
    Enrollment_Count: 430,
    Status: "Closed",
    image: "/S__7667726_0.jpg",
  },
  {
    Course_Title: "Instructor Analytics Workflow",
    instructorName: "Ariya Wong",
    Course_Duration: 4.5,
    Level: "Advanced",
    Enrollment_Count: 690,
    Status: "Open",
    image: "/20191216_082746.jpg",
  },
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isSeedInstructorInput = (
  value: unknown
): value is SeedInstructorInput =>
  isRecord(value) &&
  isString(value.Instructor_Name) &&
  isFiniteNumber(value.age) &&
  isString(value.email) &&
  isString(value.image) &&
  isString(value.phone);

const isSeedCourseInput = (value: unknown): value is SeedCourseInput =>
  isRecord(value) &&
  isString(value.Course_Title) &&
  isString(value.instructorName) &&
  isFiniteNumber(value.Course_Duration) &&
  isString(value.Level) &&
  isFiniteNumber(value.Enrollment_Count) &&
  isString(value.Status) &&
  isString(value.image);

const readSeedArray = <T>(
  value: unknown,
  isValidSeedItem: (item: unknown) => item is T,
  fieldName: string
) => {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array`);
  }

  const invalidItem = value.find((item) => !isValidSeedItem(item));
  if (invalidItem) {
    throw new Error(`${fieldName} contains an invalid seed item`);
  }

  return value;
};

const readSeedPayload = async (request: NextRequest): Promise<SeedPayload> => {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return {};
  }

  const rawPayload = await request.json();
  if (!isRecord(rawPayload)) {
    throw new Error("Seed payload must be a JSON object");
  }

  return {
    reset: rawPayload.reset === true,
    instructors: readSeedArray(
      rawPayload.instructors,
      isSeedInstructorInput,
      "instructors"
    ),
    courses: readSeedArray(rawPayload.courses, isSeedCourseInput, "courses"),
  };
};

const getSeedInputs = (payload: SeedPayload) => ({
  instructors:
    payload.instructors && payload.instructors.length > 0
      ? payload.instructors
      : defaultInstructors,
  courses:
    payload.courses && payload.courses.length > 0
      ? payload.courses
      : defaultCourses,
});

const seedInstructors = async (instructors: SeedInstructorInput[]) =>
  Promise.all(
    instructors.map((instructor) =>
      User.findOneAndUpdate(
        { Instructor_Name: instructor.Instructor_Name },
        { $set: instructor },
        { new: true, upsert: true }
      )
    )
  );

const getInstructorsByName = async () => {
  const instructors = await User.find().lean<StoredInstructor[]>();
  return new Map(
    instructors.map((instructor) => [
      instructor.Instructor_Name,
      instructor._id,
    ])
  );
};

const seedCourses = async (courses: SeedCourseInput[]) => {
  const instructorsByName = await getInstructorsByName();

  return Promise.all(
    courses.map((course) => {
      const instructorId = instructorsByName.get(course.instructorName);
      if (!instructorId) {
        throw new Error(`Instructor not found: ${course.instructorName}`);
      }

      return Courses.findOneAndUpdate(
        {
          Course_Title: course.Course_Title,
          userId: instructorId,
        },
        {
          $set: {
            Course_Title: course.Course_Title,
            Course_Duration: course.Course_Duration,
            Level: course.Level,
            Enrollment_Count: course.Enrollment_Count,
            Status: course.Status,
            image: course.image,
            userId: instructorId,
          },
        },
        { new: true, upsert: true }
      );
    })
  );
};

const buildCourseSearchDocument = (
  course: StoredCourse,
  instructor: StoredInstructor
): CourseSearchDocument => ({
  id: course._id.toString(),
  courseTitle: course.Course_Title,
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
  createdAt: course.createdAt?.getTime() ?? Date.now(),
});

const getCourseSearchDocuments = async () => {
  const courses = await Courses.find().lean<StoredCourse[]>();
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
};

export async function POST(request: NextRequest) {
  let payload: SeedPayload;

  try {
    payload = await readSeedPayload(request);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Invalid seed payload",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }

  try {
    await connectMongoDB();

    const shouldReset =
      request.nextUrl.searchParams.get("reset") === "true" ||
      payload.reset === true;
    const seedInputs = getSeedInputs(payload);

    if (shouldReset) {
      await Promise.all([
        Courses.deleteMany({}),
        User.deleteMany({}),
        ensureCoursesCollection({ recreate: true }),
      ]);
    } else {
      await ensureCoursesCollection();
    }

    const seededInstructors = await seedInstructors(seedInputs.instructors);
    const seededCourses = await seedCourses(seedInputs.courses);
    const searchDocuments = await getCourseSearchDocuments();
    const importResult = await importCoursesToTypesense(searchDocuments);

    return NextResponse.json(
      {
        message: "Seed completed",
        reset: shouldReset,
        instructors: seededInstructors.length,
        courses: seededCourses.length,
        indexedCourses: importResult.imported,
        typesenseCollection: TYPESENSE_COURSES_COLLECTION,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Seed failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
