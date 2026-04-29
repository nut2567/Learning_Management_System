"use client";

import { useEffect, useRef, useState } from "react";
import ReactPaginate from "react-paginate";
import FilterBar, { type User } from "@/app/components/FilterBar";
import ProductList, { type Courses } from "@/app/components/ProductList";
import WrapLoading from "@/app/layouts/WrapLoadind";
import {
  GetProduct,
  type CourseFilters,
  type ProductResponse,
} from "@/app/utils/getproduct";
import GetInstructors from "@/app/utils/getInstructors";

const PAGE_LIMIT = 9;

export default function Home({
  initialProducts,
  initialinstructor,
}: {
  initialProducts: ProductResponse;
  initialinstructor: User[];
}) {
  const [product, setProduct] = useState<Courses[]>(initialProducts.product);
  const [user, setUser] = useState<User[]>(initialinstructor);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [Instructor, setInstructor] = useState("");
  const [Status, setStatus] = useState("");
  const [Level, setLevel] = useState("");
  const [Sort, setSort] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(
    Math.ceil(initialProducts.total / PAGE_LIMIT)
  );
  const hasMounted = useRef(false);

  const getFilters = (): CourseFilters => ({ Instructor, Status, Level, Sort });

  const fetchProduct = async (pageIndex: number, filters: CourseFilters) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await GetProduct(pageIndex + 1, PAGE_LIMIT, filters);
      setProduct(response.product);
      setTotalPages(Math.ceil(response.total / PAGE_LIMIT));
      setUser(await GetInstructors());
    } catch {
      setError("Failed to load product data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const nextPage = 0;
    setCurrentPage(nextPage);
    fetchProduct(nextPage, getFilters());
  }, [Level, Status, Instructor, Sort]);

  const handlePageChange = (selectedItem: { selected: number }) => {
    const nextPage = selectedItem.selected;
    setCurrentPage(nextPage);
    fetchProduct(nextPage, getFilters());
  };

  return (
    <div
      className="grid grid-rows-[20px_1fr_20px] text-gray-600 bg-gray-100 min-h-screen smb:p-4 sm:p-12 lg:p-20 xl:p-28 2xl:p-36
    font-[family-name:var(--font-geist-sans)]"
    >
      <main className="flex flex-col row-start-2 sm:items-start">
        <h1 className="sm:text-[40px] smb:text-[28px] font-bold text-black">
          Available Courses
        </h1>
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
          <p>{error}</p>
        ) : isLoading ? (
          <WrapLoading />
        ) : (
          <div className="w-full">
            <ProductList products={product} />
            <ReactPaginate
              previousLabel={
                <button
                  className="py-2 px-4 border font-bold rounded-md cursor-pointer hover:bg-gray-300 transition"
                  type="button"
                >
                  {"<"}
                </button>
              }
              previousClassName=""
              nextLabel={
                <button
                  className="py-2 px-4 border font-bold rounded-md cursor-pointer hover:bg-gray-300 transition"
                  type="button"
                >
                  {">"}
                </button>
              }
              nextClassName=""
              pageLinkClassName="page-button"
              pageLabelBuilder={(page: number) => (
                <button
                  className={`py-2 px-4 border font-bold rounded-md ${
                    currentPage === page - 1
                      ? "bg-[#E3EBFF] text-blue-500 border-blue-500"
                      : "bg-white"
                  }`}
                  type="button"
                >
                  {page}
                </button>
              )}
              pageClassName=""
              activeClassName=""
              breakLabel={
                <button
                  className="py-2 px-4 border font-bold rounded-md"
                  type="button"
                >
                  ...
                </button>
              }
              breakClassName=""
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={handlePageChange}
              containerClassName="flex justify-center mt-8 space-x-2"
              forcePage={currentPage}
              pageCount={totalPages}
            />
          </div>
        )}
      </main>
    </div>
  );
}
