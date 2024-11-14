"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import WrapLoading from "@/app/layouts/WrapLoadind";

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
  }, []); // [] เพื่อให้ฟังก์ชันทำงานแค่ครั้งเดียวเมื่อ component mount

  return (
    <div
      className="grid grid-rows-[20px_1fr_20px] bg-gray-100 min-h-screen sm:p-12 lg:p-20 xl:p-28 2xl:p-36
    font-[family-name:var(--font-geist-sans)]"
    >
      <main className="flex flex-col row-start-2 sm:items-start">
        <h1 className="text-[40px] font-bold">Available Courses</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {error ? (
            <p>{error}</p> // แสดง error หากมี
          ) : isLoading ? (
            <p>Loading...</p> // แสดง loading หากกำลังโหลดข้อมูล
          ) : product.length === 0 ? (
            <p>No product data available</p> // แสดงข้อความเมื่อไม่มีข้อมูล
          ) : (
            product.map((item) => (
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
            ))
          )}
        </div>
      </main>
    </div>
  );
}
