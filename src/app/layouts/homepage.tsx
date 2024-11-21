"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import WrapLoading from "@/app/layouts/WrapLoadind";
import FilterBar, { User } from "@/app/components/FilterBar";
import ProductList, { Courses } from "@/app/components/ProductList";
import ReactPaginate from "react-paginate";
import { GetProduct } from "@/app/utils/getproduct";
import GetInstructors from "@/app/utils/getInstructors";

export default function Home({
  initialProducts,
  initialinstructor,
}: {
  initialProducts: any;
  initialinstructor: any;
}) {
  const [product, setProduct] = useState<Courses[]>(initialProducts.product); // ใช้ useState เพื่อจัดเก็บข้อมูล user
  const [user, setUser] = useState<User[]>(initialinstructor);
  const [isLoading, setIsLoading] = useState(false); // Tracks loading state
  const [error, setError] = useState(""); // Tracks errors if they occur
  const [Instructor, setInstructor] = useState("");
  const [Status, setStatus] = useState("");
  const [Level, setLevel] = useState("");
  const [Sort, setSort] = useState("");
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const limit = 9;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialProducts.total / limit);

  const fetchProduct = async (page: number) => {
    page = page ? page : 1;
    setIsLoading(true);
    try {
      const filters = { Instructor, Status, Level, Sort };
      const response = await GetProduct(page, limit, filters);
      setProduct(response.product || []);
      if (response.total != 0) {
        setTotalPages(Math.ceil(response.total / limit));
      } else {
        setTotalPages(0);
      }
      setUser(await GetInstructors());
    } catch (err) {
      console.error(err);
      setError("Failed to load product data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false); // แก้ไขสถานะหลังจากครั้งแรก
      return; // หยุดไม่ให้ fetchProduct ทำงานครั้งแรก
    }

    // รีเซ็ตหน้าเป็นหน้าแรกเมื่อ Filter เปลี่ยน
    fetchProduct(1);
  }, [Level, Status, Instructor, Sort]);

  // ทำงานเมื่อ currentPage เปลี่ยน
  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false); // แก้ไขสถานะหลังจากครั้งแรก
      return; // หยุดไม่ให้ fetchProduct ทำงานครั้งแรก
    }

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
          instructors={user}
        />
        {error ? (
          <p>{error}</p> // แสดง error หากมี
        ) : isLoading ? (
          <WrapLoading /> // แสดง loading หากกำลังโหลดข้อมูล
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
                      currentPage === page
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
              pageCount={totalPages}
            />
          </div>
        )}
      </main>
    </div>
  );
}
