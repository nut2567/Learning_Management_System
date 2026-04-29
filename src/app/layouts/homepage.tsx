"use client";

import { useDeferredValue, useEffect, useRef, useState } from "react";
import ReactPaginate from "react-paginate";
import { SearchIcon } from "lucide-react";
import FilterBar, { type User } from "@/app/components/FilterBar";
import ProductList, { type Courses } from "@/app/components/ProductList";
import WrapLoading from "@/app/layouts/WrapLoadind";
import {
  GetCourseSuggestions,
  GetProduct,
  type CourseFilters,
  type CourseSuggestion,
  type ProductResponse,
} from "@/app/utils/getproduct";
import GetInstructors from "@/app/utils/getInstructors";

const PAGE_LIMIT = 9;
const THAI_CHARACTER_PATTERN = /[\u0E00-\u0E7F]/;

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
  const [Search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalResults, setTotalResults] = useState(initialProducts.total);
  const [totalPages, setTotalPages] = useState(
    Math.ceil(initialProducts.total / PAGE_LIMIT),
  );
  const [suggestions, setSuggestions] = useState<CourseSuggestion[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const hasMounted = useRef(false);
  const selectedSuggestionRef = useRef("");
  const deferredSearch = useDeferredValue(Search.trim());
  const resultStart = totalResults === 0 ? 0 : currentPage * PAGE_LIMIT + 1;
  const resultEnd = Math.min((currentPage + 1) * PAGE_LIMIT, totalResults);
  const resultSummary =
    totalResults === 0
      ? "Found 0 courses"
      : `Showing ${resultStart.toLocaleString(
          "th-TH",
        )}-${resultEnd.toLocaleString("th-TH")} of ${totalResults.toLocaleString(
          "th-TH",
        )} courses`;

  const getFilters = (): CourseFilters => ({
    Instructor,
    Status,
    Level,
    Sort,
    Search: deferredSearch,
  });

  const fetchProduct = async (pageIndex: number, filters: CourseFilters) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await GetProduct(pageIndex + 1, PAGE_LIMIT, filters);
      setProduct(response.product);
      setTotalResults(response.total);
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
  }, [Level, Status, Instructor, Sort, deferredSearch]);

  useEffect(() => {
    if (
      deferredSearch.length < 2 ||
      deferredSearch === selectedSuggestionRef.current
    ) {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      return;
    }

    let isCancelled = false;

    const fetchSuggestions = async () => {
      const response = await GetCourseSuggestions(
        {
          Instructor,
          Status,
          Level,
          Sort: "",
          Search: deferredSearch,
        },
        6,
      );

      if (isCancelled) {
        return;
      }

      setSuggestions(response.suggestions);
      setIsSuggestionsOpen(response.suggestions.length > 0);
    };

    // fetchSuggestions();

    return () => {
      isCancelled = true;
    };
  }, [Instructor, Level, Status, deferredSearch]);

  const handlePageChange = (selectedItem: { selected: number }) => {
    const nextPage = selectedItem.selected;
    setCurrentPage(nextPage);
    fetchProduct(nextPage, getFilters());
  };

  const handleSelectSuggestion = (suggestion: CourseSuggestion) => {
    const selectedTitle =
      THAI_CHARACTER_PATTERN.test(Search) && suggestion.titleTh
        ? suggestion.titleTh
        : suggestion.title;

    selectedSuggestionRef.current = selectedTitle;
    setSearch(selectedTitle);
    setSuggestions([]);
    setIsSuggestionsOpen(false);
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
        <div className="w-full mb-6">
          <label htmlFor="course-search" className="block font-medium mb-2">
            Search courses
          </label>
          <div className="relative">
            <SearchIcon
              aria-hidden="true"
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
            />
            <input
              id="course-search"
              type="search"
              value={Search}
              onChange={(event) => {
                selectedSuggestionRef.current = "";
                setSearch(event.target.value);
                setIsSuggestionsOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsSuggestionsOpen(false);
                }
              }}
              onFocus={() => setIsSuggestionsOpen(suggestions.length > 0)}
              onBlur={() => {
                setTimeout(() => setIsSuggestionsOpen(false), 100);
              }}
              placeholder="Search by course, instructor, level, or status"
              autoComplete="off"
              className="w-full rounded-md border bg-white py-3 pl-10 pr-4 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            {false && isSuggestionsOpen && suggestions.length > 0 ? (
              <div
                role="listbox"
                aria-label="Course suggestions"
                className="absolute z-20 mt-2 w-full overflow-hidden rounded-md border bg-white shadow-lg"
              >
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    role="option"
                    aria-selected="false"
                    className="flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleSelectSuggestion(suggestion);
                    }}
                  >
                    <span className="font-semibold text-gray-900">
                      {suggestion.title}
                    </span>
                    {suggestion.titleTh ? (
                      <span className="text-sm text-gray-700">
                        {suggestion.titleTh}
                      </span>
                    ) : null}
                    <span className="text-sm text-gray-500">
                      {suggestion.instructorName} | {suggestion.level} |{" "}
                      {suggestion.status} |{" "}
                      {suggestion.enrollmentCount.toLocaleString("th-TH")}{" "}
                      enrolled
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
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
        <div className="mt-6 flex w-full flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-gray-800">{resultSummary}</p>
          {deferredSearch ? (
            <p className="text-gray-500">Search: "{deferredSearch}"</p>
          ) : null}
        </div>
        {error ? (
          <p>{error}</p>
        ) : isLoading ? (
          <WrapLoading />
        ) : (
          <div className="w-full">
            {product.length > 0 ? (
              <ProductList products={product} />
            ) : (
              <p className="mt-12 rounded-md border bg-white p-6 text-gray-600">
                No courses match the current search and filters.
              </p>
            )}
            {totalPages > 1 ? (
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
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
