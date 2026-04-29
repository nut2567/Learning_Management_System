import {
  BookOpen,
  Boxes,
  Database,
  Dock,
  FileSearch,
  Gauge,
  Search,
  Server,
  Wrench,
} from "lucide-react";

const projectFeatures = [
  {
    title: "Course catalog",
    description:
      "แสดงรายการคอร์สพร้อมรูปภาพ ระดับความยาก สถานะ ระยะเวลา จำนวนผู้เรียน และข้อมูลผู้สอน",
  },
  {
    title: "Search experience",
    description:
      "ค้นหาคอร์สจากชื่อภาษาอังกฤษ ชื่อภาษาไทย ผู้สอน ระดับ และสถานะ พร้อม autocomplete และจำนวนผลลัพธ์ทั้งหมด",
  },
  {
    title: "Course management",
    description:
      "เพิ่ม แก้ไข ลบคอร์ส และซิงก์ข้อมูลจาก MongoDB เข้า Typesense เพื่อให้ระบบค้นหาอัปเดตตามข้อมูลล่าสุด",
  },
  {
    title: "Seed and indexing",
    description:
      "มี API สำหรับ seed ข้อมูลตัวอย่างและ reindex Typesense โดยไม่ต้องลบข้อมูล MongoDB",
  },
];

const toolGroups = [
  {
    icon: BookOpen,
    title: "Next.js App Router",
    description:
      "ใช้สร้างหน้าเว็บและ API routes เช่น course list, course management, seed และ autocomplete",
  },
  {
    icon: Boxes,
    title: "React + TypeScript",
    description:
      "ใช้ทำส่วนติดต่อผู้ใช้แบบ component และเพิ่ม type safety ให้ข้อมูลคอร์ส ผู้สอน และผลลัพธ์จาก API",
  },
  {
    icon: Gauge,
    title: "Tailwind CSS + DaisyUI",
    description:
      "ใช้จัด layout, responsive spacing, button, table, modal และ style พื้นฐานของระบบ",
  },
  {
    icon: Database,
    title: "MongoDB + Mongoose",
    description:
      "ใช้เก็บข้อมูลหลักของคอร์สและผู้สอน พร้อม schema สำหรับข้อมูลที่แอปจัดการ",
  },
  {
    icon: Search,
    title: "Typesense",
    description:
      "ใช้ทำ search index, autocomplete, filtering และ sorting เพื่อให้การค้นหาคอร์สเร็วขึ้น",
  },
  {
    icon: Server,
    title: "Docker Compose",
    description:
      "ใช้รันบริการ local สำหรับ MongoDB และ Typesense ให้เริ่มใช้งานโปรเจกต์ได้ง่าย",
  },
  {
    icon: FileSearch,
    title: "Axios + Fetch API",
    description:
      "ใช้เรียก API ระหว่างหน้าเว็บกับ backend routes และเรียก Typesense จากฝั่ง server",
  },
  {
    icon: Wrench,
    title: "Lucide React + React Icons",
    description:
      "ใช้แสดงไอคอนในปุ่ม เมนู และข้อมูลประกอบบนหน้าคอร์สและหน้าอธิบายโปรเจกต์",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10 text-gray-700 sm:px-12 lg:px-24">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-600">
            About Project
          </p>
          <h1 className="text-3xl font-bold text-black sm:text-4xl">
            Learning Management System
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">
            โปรเจกต์นี้เป็นระบบจัดการและค้นหาคอร์สเรียน
            สำหรับแสดงรายการคอร์ส จัดการข้อมูลคอร์สและผู้สอน
            พร้อมระบบค้นหาที่รองรับทั้งภาษาอังกฤษและภาษาไทย
          </p>
        </div>

        <div className="mb-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-md border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Dock className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-black">Project purpose</h2>
            </div>
            <p className="leading-7 text-gray-600">
              ระบบนี้ช่วยให้ผู้ใช้ดูคอร์สที่เปิดสอน ค้นหาคอร์สที่ต้องการ
              กรองตามผู้สอน ระดับ หรือสถานะ และช่วยให้ผู้ดูแลระบบเพิ่ม แก้ไข
              หรือลบข้อมูลคอร์สได้จากหน้า Manage
            </p>
          </div>

          <div className="rounded-md border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-black">Creator</h2>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              Nutthawat Witdumring
            </p>
            <p className="mt-2 leading-7 text-gray-600">
              ผู้สร้างโปรเจกต์ Learning Management System
            </p>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-black">
            What this project does
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {projectFeatures.map((feature) => (
              <article
                className="rounded-md border bg-white p-5 shadow-sm"
                key={feature.title}
              >
                <h3 className="font-bold text-gray-900">{feature.title}</h3>
                <p className="mt-2 leading-7 text-gray-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-black">
            Tools and technologies
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {toolGroups.map((tool) => {
              const Icon = tool.icon;

              return (
                <article
                  className="rounded-md border bg-white p-5 shadow-sm"
                  key={tool.title}
                >
                  <Icon className="mb-4 h-6 w-6 text-blue-600" />
                  <h3 className="font-bold text-gray-900">{tool.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {tool.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
