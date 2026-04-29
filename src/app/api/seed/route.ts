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
  Course_Title_TH?: string;
  instructorName: string;
  Course_Duration: number;
  Level: string;
  Enrollment_Count: number;
  Status: string;
  image: string;
};

type SeedPayload = {
  reset?: boolean;
  reindex?: boolean;
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
  {
    Instructor_Name: "Ploy Srisawat",
    age: 36,
    email: "ploy.srisawat@example.com",
    image: "/S__7667726_0.jpg",
    phone: "085-678-9012",
  },
  {
    Instructor_Name: "Kanya Prasert",
    age: 33,
    email: "kanya.prasert@example.com",
    image: "/20191216_082746.jpg",
    phone: "086-789-0123",
  },
];

const defaultCourses: SeedCourseInput[] = [
  {
    Course_Title: "Next.js Foundations",
    Course_Title_TH: "พื้นฐาน Next.js",
    instructorName: "Ariya Wong",
    Course_Duration: 6.3,
    Level: "Beginner",
    Enrollment_Count: 1_480,
    Status: "Open",
    image: "/16_9.png",
  },
  {
    Course_Title: "MongoDB for LMS Data",
    Course_Title_TH: "MongoDB สำหรับข้อมูล LMS",
    instructorName: "Nattapol Chai",
    Course_Duration: 5.45,
    Level: "Intermediate",
    Enrollment_Count: 980,
    Status: "Open",
    image: "/16_6.png",
  },
  {
    Course_Title: "Typesense Search Essentials",
    Course_Title_TH: "พื้นฐานการค้นหาด้วย Typesense",
    instructorName: "Thanin Techasiri",
    Course_Duration: 4.2,
    Level: "Intermediate",
    Enrollment_Count: 760,
    Status: "Open",
    image: "/16_4.png",
  },
  {
    Course_Title: "Accessible Course Design",
    Course_Title_TH: "ออกแบบคอร์สที่เข้าถึงได้",
    instructorName: "Mira Stark",
    Course_Duration: 3.3,
    Level: "Beginner",
    Enrollment_Count: 1_120,
    Status: "Open",
    image: "/16_i.png",
  },
  {
    Course_Title: "Advanced Content Operations",
    Course_Title_TH: "จัดการเนื้อหา ขั้นสูง",
    instructorName: "Thanin Techasiri",
    Course_Duration: 7.15,
    Level: "Advanced",
    Enrollment_Count: 430,
    Status: "Closed",
    image: "/16_9.png",
  },
  {
    Course_Title: "Instructor Analytics Workflow",
    Course_Title_TH: "เวิร์กโฟลว์วิเคราะห์ผู้สอน",
    instructorName: "Ariya Wong",
    Course_Duration: 4.5,
    Level: "Advanced",
    Enrollment_Count: 690,
    Status: "Open",
    image: "/16_9.png",
  },
  {
    Course_Title: "React Component Patterns",
    Course_Title_TH: "รูปแบบคอมโพเนนต์ React",
    instructorName: "Ariya Wong",
    Course_Duration: 5.25,
    Level: "Intermediate",
    Enrollment_Count: 1_340,
    Status: "Open",
    image: "/16_6.png",
  },
  {
    Course_Title: "Node.js API Design",
    Course_Title_TH: "ออกแบบ API ด้วย Node.js",
    instructorName: "Nattapol Chai",
    Course_Duration: 6.1,
    Level: "Intermediate",
    Enrollment_Count: 890,
    Status: "Open",
    image: "/16_4.png",
  },
  {
    Course_Title: "Cloud Deployment Basics",
    Course_Title_TH: "พื้นฐานการปรับใช้บนคลาวด์",
    instructorName: "Thanin Techasiri",
    Course_Duration: 3.45,
    Level: "Beginner",
    Enrollment_Count: 1_020,
    Status: "Open",
    image: "/16_i.png",
  },
  {
    Course_Title: "Docker for Development Teams",
    Course_Title_TH: "Docker สำหรับทีมพัฒนา",
    instructorName: "Thanin Techasiri",
    Course_Duration: 4.35,
    Level: "Intermediate",
    Enrollment_Count: 780,
    Status: "Open",
    image: "/16_9.png",
  },
  {
    Course_Title: "Data Visualization with Dashboards",
    Course_Title_TH: "แสดงข้อมูลด้วยแดชบอร์ด",
    instructorName: "Ploy Srisawat",
    Course_Duration: 5.15,
    Level: "Beginner",
    Enrollment_Count: 1_560,
    Status: "Open",
    image: "/16_6.png",
  },
  {
    Course_Title: "Product Metrics for Course Teams",
    Course_Title_TH: "ตัวชี้วัดผลิตภัณฑ์สำหรับทีมคอร์ส",
    instructorName: "Ploy Srisawat",
    Course_Duration: 4.05,
    Level: "Intermediate",
    Enrollment_Count: 650,
    Status: "Closed",
    image: "/16_4.png",
  },
  {
    Course_Title: "AI Prompting for Educators",
    Course_Title_TH: "เขียนพรอมป์ AI สำหรับผู้สอน",
    instructorName: "Kanya Prasert",
    Course_Duration: 3.2,
    Level: "Beginner",
    Enrollment_Count: 1_860,
    Status: "Open",
    image: "/16_i.png",
  },
  {
    Course_Title: "Machine Learning Fundamentals",
    Course_Title_TH: "พื้นฐาน Machine Learning",
    instructorName: "Kanya Prasert",
    Course_Duration: 7.3,
    Level: "Intermediate",
    Enrollment_Count: 920,
    Status: "Open",
    image: "/16_9.png",
  },
  {
    Course_Title: "Cybersecurity Awareness",
    Course_Title_TH: "ความปลอดภัย ไซเบอร์ เบื้องต้น",
    instructorName: "Nattapol Chai",
    Course_Duration: 2.45,
    Level: "Beginner",
    Enrollment_Count: 2_240,
    Status: "Open",
    image: "/16_6.png",
  },
  {
    Course_Title: "Secure Backend Architecture",
    Course_Title_TH: "สถาปัตยกรรมแบ็กเอนด์ที่ปลอดภัย",
    instructorName: "Thanin Techasiri",
    Course_Duration: 6.4,
    Level: "Advanced",
    Enrollment_Count: 510,
    Status: "Closed",
    image: "/16_4.png",
  },
  {
    Course_Title: "UX Research for Online Learning",
    Course_Title_TH: "วิจัย UX สำหรับการเรียนออนไลน์",
    instructorName: "Mira Stark",
    Course_Duration: 4.25,
    Level: "Intermediate",
    Enrollment_Count: 1_180,
    Status: "Open",
    image: "/16_i.png",
  },
  {
    Course_Title: "Instructional Video Production",
    Course_Title_TH: "ผลิตวิดีโอการสอน",
    instructorName: "Mira Stark",
    Course_Duration: 5.5,
    Level: "Beginner",
    Enrollment_Count: 830,
    Status: "Open",
    image: "/16_9.png",
  },
  {
    Course_Title: "Advanced TypeScript Practices",
    Course_Title_TH: "แนวทาง TypeScript ขั้นสูง",
    instructorName: "Ariya Wong",
    Course_Duration: 6.2,
    Level: "Advanced",
    Enrollment_Count: 730,
    Status: "Open",
    image: "/16_6.png",
  },
  {
    Course_Title: "Database Indexing Strategies",
    Course_Title_TH: "กลยุทธ์การทำดัชนีฐานข้อมูล",
    instructorName: "Nattapol Chai",
    Course_Duration: 4.4,
    Level: "Advanced",
    Enrollment_Count: 480,
    Status: "Closed",
    image: "/16_4.png",
  },
  {
    Course_Title: "Agile Course Operations",
    Course_Title_TH: "จัดการคอร์สแบบ Agile",
    instructorName: "Ploy Srisawat",
    Course_Duration: 3.35,
    Level: "Beginner",
    Enrollment_Count: 1_090,
    Status: "Open",
    image: "/16_i.png",
  },
  {
    Course_Title: "Capstone LMS Project",
    Course_Title_TH: "โปรเจกต์จบหลักสูตร LMS",
    instructorName: "Kanya Prasert",
    Course_Duration: 8.15,
    Level: "Advanced",
    Enrollment_Count: 360,
    Status: "Open",
    image: "/16_9.png",
  },
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isSeedInstructorInput = (value: unknown): value is SeedInstructorInput =>
  isRecord(value) &&
  isString(value.Instructor_Name) &&
  isFiniteNumber(value.age) &&
  isString(value.email) &&
  isString(value.image) &&
  isString(value.phone);

const isSeedCourseInput = (value: unknown): value is SeedCourseInput =>
  isRecord(value) &&
  isString(value.Course_Title) &&
  (value.Course_Title_TH === undefined || isString(value.Course_Title_TH)) &&
  isString(value.instructorName) &&
  isFiniteNumber(value.Course_Duration) &&
  isString(value.Level) &&
  isFiniteNumber(value.Enrollment_Count) &&
  isString(value.Status) &&
  isString(value.image);

const readSeedArray = <T>(
  value: unknown,
  isValidSeedItem: (item: unknown) => item is T,
  fieldName: string,
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
    reindex: rawPayload.reindex === true,
    instructors: readSeedArray(
      rawPayload.instructors,
      isSeedInstructorInput,
      "instructors",
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
        { new: true, upsert: true },
      ),
    ),
  );

const getInstructorsByName = async () => {
  const instructors = await User.find().lean<StoredInstructor[]>();
  return new Map(
    instructors.map((instructor) => [
      instructor.Instructor_Name,
      instructor._id,
    ]),
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
            Course_Title_TH: course.Course_Title_TH ?? "",
            Course_Duration: course.Course_Duration,
            Level: course.Level,
            Enrollment_Count: course.Enrollment_Count,
            Status: course.Status,
            image: course.image,
            userId: instructorId,
          },
        },
        { new: true, upsert: true },
      );
    }),
  );
};

const buildCourseSearchDocument = (
  course: StoredCourse,
  instructor: StoredInstructor,
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
  createdAt: course.createdAt?.getTime() ?? Date.now(),
});

const getCourseSearchDocuments = async () => {
  const courses = await Courses.find().lean<StoredCourse[]>();
  const instructorIds = Array.from(
    new Set(courses.map((course) => course.userId.toString())),
  );
  const instructors = await User.find({ _id: { $in: instructorIds } }).lean<
    StoredInstructor[]
  >();
  const instructorsById = new Map(
    instructors.map((instructor) => [instructor._id.toString(), instructor]),
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
      { status: 400 },
    );
  }

  try {
    await connectMongoDB();

    const shouldReset =
      request.nextUrl.searchParams.get("reset") === "true" ||
      payload.reset === true;
    const shouldReindex =
      shouldReset ||
      request.nextUrl.searchParams.get("reindex") === "true" ||
      payload.reindex === true;
    const seedInputs = getSeedInputs(payload);

    if (shouldReset) {
      await Promise.all([Courses.deleteMany({}), User.deleteMany({})]);
    }

    if (shouldReindex) {
      await ensureCoursesCollection({ recreate: true });
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
        reindex: shouldReindex,
        instructors: seededInstructors.length,
        courses: seededCourses.length,
        indexedCourses: importResult.imported,
        typesenseCollection: TYPESENSE_COURSES_COLLECTION,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Seed failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
