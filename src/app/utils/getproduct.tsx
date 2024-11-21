import axios from "axios";
import ProductList, { Courses } from "@/app/components/ProductList";
export async function GetProduct(
  page = 1,
  limit = 9,
  filters = { Instructor: "", Status: "", Level: "", Sort: "" }
) {
  try {
    // ดึงค่าจาก filters
    const { Instructor, Status, Level, Sort } = filters;

    // สร้าง params object สำหรับ axios
    const params: any = { page, limit };

    // เพิ่มค่าที่ไม่ว่างลงใน params
    if (Instructor) params.Instructor = Instructor;
    if (Status) params.Status = Status;
    if (Level) params.Level = Level;
    if (Sort) params.Sort = Sort;

    const baseURL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
    const { data } = await axios.get(`${baseURL}/api/getcourse`, { params });
    // ทำการเรียก API
    console.log(data);
    // ตรวจสอบและส่งข้อมูลที่ได้รับ
    if (data && data.courses) {
      return data; // Return data from response
    } else {
      return { product: [], total: 0 }; // Return empty data if no products
    }
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { product: [], total: 0 };
  }
}

export default async function CoursesSSR() {
  const data = await GetProduct(); // ดึงข้อมูลจาก API

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Available Courses</h1>
      <ProductList products={data.courses || []} />
    </div>
  );
}
