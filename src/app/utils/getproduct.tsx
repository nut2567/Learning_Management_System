import axios from "axios";
import type { Courses } from "@/app/components/ProductList";

export type CourseFilters = {
  Instructor: string;
  Status: string;
  Level: string;
  Sort: string;
};

export type ProductResponse = {
  product: Courses[];
  total: number;
};

const DEFAULT_PRODUCTS_RESPONSE: ProductResponse = {
  product: [],
  total: 0,
};

const getApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4400";

const getCourseParams = (
  page: number,
  limit: number,
  filters: CourseFilters
) => {
  const params: Record<string, string | number> = { page, limit };

  if (filters.Instructor) {
    params.Instructor = filters.Instructor;
  }

  if (filters.Status) {
    params.Status = filters.Status;
  }

  if (filters.Level) {
    params.Level = filters.Level;
  }

  if (filters.Sort) {
    params.Sort = filters.Sort;
  }

  return params;
};

export async function GetProduct(
  page = 1,
  limit = 9,
  filters: CourseFilters = { Instructor: "", Status: "", Level: "", Sort: "" }
): Promise<ProductResponse> {
  try {
    const { data } = await axios.get<ProductResponse>(
      `${getApiBaseUrl()}/api/getcourse`,
      {
        params: getCourseParams(page, limit, filters),
      }
    );

    if (Array.isArray(data.product)) {
      return data;
    }

    return DEFAULT_PRODUCTS_RESPONSE;
  } catch {
    return DEFAULT_PRODUCTS_RESPONSE;
  }
}
