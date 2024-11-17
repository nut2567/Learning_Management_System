"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import WrapLoading from "@/app/layouts/WrapLoadind";
import FilterBar from "@/app/components/FilterBar";
import ProductList, { Courses } from "@/app/components/ProductList";
import ReactPaginate from "react-paginate";
async function getProduct(
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

    // ทำการเรียก API
    const resp = await axios.get(`/api/getcourse`, { params });

    // ตรวจสอบและส่งข้อมูลที่ได้รับ
    if (resp.data && resp.data.product) {
      return resp.data; // Return data from response
    } else {
      return { product: [], total: 0 }; // Return empty data if no products
    }
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { product: [], total: 0 };
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

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProduct = async (page: number) => {
    page = page == 0 ? 1 : page + 1;
    setIsLoading(true);
    try {
      const limit = 9;
      const filters = { Instructor, Status, Level, Sort };
      const response = await getProduct(page, limit, filters);
      setProduct(response.product || []);
      setTotalPages(Math.ceil(response.total / limit));
    } catch (err) {
      console.error(err);
      setError("Failed to load product data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // รีเซ็ตหน้าเป็นหน้าแรกเมื่อ Filter เปลี่ยน
    fetchProduct(0);
  }, [Level, Status, Instructor, Sort]);

  // ทำงานเมื่อ currentPage เปลี่ยน
  useEffect(() => {
    fetchProduct(currentPage);
  }, [currentPage]);

  const handlePageChange = (selectedItem: { selected: number }) => {
    let next = selectedItem.selected;
    console.log(next);
    setCurrentPage(next); // อัปเดต currentPage ตามที่เลือกใน ReactPaginate
  };

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
          <div className="w-full">
            <ProductList products={product} />
            {/* Pagination */}
            <ReactPaginate
              // previousLabel={<span>{"<"}</span>}
              // nextLabel={<span>{">"}</span>}
              previousLabel={
                <button className="py-2 px-4 border font-bold  rounded-md cursor-pointer hover:bg-gray-300 transition">
                  {"<"}
                </button>
              }
              previousClassName=""
              nextLabel={
                <button className="py-2 px-4 border font-bold rounded-md cursor-pointer hover:bg-gray-300 transition">
                  {">"}
                </button>
              }
              nextClassName=""
              pageLinkClassName="page-button"
              pageLabelBuilder={(page: number) => (
                <button
                  className={`py-2 px-4 border font-bold rounded-md
                    ${
                      currentPage === page - 1
                        ? "bg-[##E3EBFF] text-blue-500 border-blue-500"
                        : " bg-white"
                    }
                  `}
                >
                  {page}
                </button>
              )}
              pageClassName=""
              activeClassName={""}
              pageCount={totalPages}
              breakLabel={
                <button className="py-2 px-4 border font-bold rounded-md">
                  ...
                </button>
              }
              breakClassName=""
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={handlePageChange}
              containerClassName="flex justify-center mt-8 space-x-2"
              forcePage={currentPage} // เพิ่ม forcePage เพื่อให้ sync กับ currentPage
            />
          </div>
        )}
      </main>
    </div>
  );
}
