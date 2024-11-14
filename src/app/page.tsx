"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import WrapLoading from "@/app/layouts/WrapLoadind";
import { GiSettingsKnobs } from "react-icons/gi";
import FilterBar from "@/app/components/FilterBar";

interface Courses {
  _id: string;
  Course_Title: string;
  Instructor_Name: string;
  Course_Duration: Date;
  Level: string;
  Enrollment_Count: Number;
  createdAt: Date;
  Status: string;
  image: string;
}

export async function getProduct() {
  // ใช้ await รอให้ axios.get() ดึงข้อมูลเสร็จสิ้น
  const resp = await axios.get(`/api/getproduct`);

  // ตรวจสอบ response ใน console
  console.log(resp);
  // Check if there is product data in the response
  // ตั้งค่า state ด้วยข้อมูลที่ได้จาก API
  if (resp.data && resp.data.product) {
    return resp.data.product; // Set product data
  } else {
    return null; // No product data found
  }
}

export default function Home() {
  const [product, setProduct] = useState<Courses[]>([]); // ใช้ useState เพื่อจัดเก็บข้อมูล user
  const [isLoading, setIsLoading] = useState(true); // Tracks loading state
  const [error, setError] = useState(""); // Tracks errors if they occur
  const [Instructor, setInstructor] = useState("");
  const [Status, setStatus] = useState("");
  const [Level, setLevel] = useState("");
  const [Sort, setSort] = useState("");

  const fetchProduct = async () => {
    try {
      const productData = await getProduct(); // รอการดึงข้อมูลจาก getProduct
      setProduct(productData || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load product data");
    } finally {
      setIsLoading(false);
    }
  };
  // ใช้ useEffect เพื่อเรียก เมื่อ component ถูก mount
  useEffect(() => {
    fetchProduct(); // เรียกใช้ฟังก์ชันดึงข้อมูล
  }, [Level, Status, Instructor, Sort]); // [] เพื่อให้ฟังก์ชันทำงานแค่ครั้งเดียวเมื่อ component mount

  return (
    <div
      className="grid grid-rows-[20px_1fr_20px] text-gray-600 bg-gray-100 min-h-screen smb:p-4 sm:p-12 lg:p-20 xl:p-28 2xl:p-36
    font-[family-name:var(--font-geist-sans)]"
    >
      <main className="flex flex-col row-start-2 sm:items-start">
        <h1 className="sm:text-[40px] smb:text-[28px] font-bold text-black ">
          Available Courses
        </h1>
        {/* ใช้ FilterBar */}
        <FilterBar
          Instructor={Instructor}
          setInstructor={setInstructor}
          Level={Level}
          setLevel={setLevel}
          Status={Status}
          setStatus={setStatus}
          Sort={Sort}
          setSort={setSort}
        />
        {error ? (
          <p>{error}</p> // แสดง error หากมี
        ) : isLoading ? (
          <WrapLoading /> // แสดง loading หากกำลังโหลดข้อมูล
        ) : product.length === 0 ? (
          <div className="mt-32  smb:px-4 sm:px-12 lg:px-20 xl:px-28 2xl:px-32 w-full text-center items-center flex-col flex font-semibold">
            <Image
              src="/file-search.svg"
              alt="SVG Icon"
              width={40}
              height={40}
            />
            <h2 className="text-[20px] mt-4">No result</h2>
            <p className="text-[14px]">Try to remove filters and sorting</p>
          </div> // แสดงข้อความเมื่อไม่มีข้อมูล
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
            {product.map((item) => (
              <div className="card bg-base-100 w-96 shadow-xl" key={item._id}>
                <figure>
                  <div className="relative h-[300px] w-[100%]">
                    <Image
                      src={item.image}
                      alt={item.Course_Title || "Product Image"}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </figure>

                <div
                  className="card-body text-slate-50"
                  style={{ boxShadow: "#0097ff10 0px -10px 60px inset" }}
                >
                  <h2 className="card-title">ID: {item._id}</h2>
                  <h2 className="card-title">Name: {item.Course_Title}</h2>
                  <p>
                    Created At:{" "}
                    {new Date(item.createdAt).toLocaleDateString("th-TH", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </p>
                  <p>Description: {item.Instructor_Name}</p>
                  <p>Points: {item.Level}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
