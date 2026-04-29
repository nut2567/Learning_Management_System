const DEFAULT_TYPESENSE_HOST = "http://127.0.0.1:8108";
const DEFAULT_TYPESENSE_API_KEY = "xyz";
const ERROR_PREVIEW_LIMIT = 500;
const HTTP_NOT_FOUND = 404;

export const TYPESENSE_COURSES_COLLECTION =
  process.env.TYPESENSE_COURSES_COLLECTION ?? "courses";

export type CourseSearchDocument = {
  id: string;
  courseTitle: string;
  courseDuration: number;
  level: string;
  enrollmentCount: number;
  status: string;
  image: string;
  instructorId: string;
  instructorName: string;
  instructorEmail: string;
  instructorImage: string;
  instructorPhone: string;
  createdAt: number;
};

type TypesenseField = {
  name: string;
  type: "string" | "float" | "int32" | "int64";
  facet?: boolean;
  sort?: boolean;
};

type TypesenseCollectionSchema = {
  name: string;
  fields: TypesenseField[];
  default_sorting_field: string;
};

type TypesenseImportLine = {
  success?: boolean;
  error?: string;
};

type TypesenseSearchHit = {
  document: CourseSearchDocument;
};

type TypesenseSearchResponse = {
  found: number;
  hits?: TypesenseSearchHit[];
};

export type CourseSearchFilters = {
  Instructor?: string;
  Status?: string;
  Level?: string;
  Sort?: string;
};

export type CourseSearchProduct = {
  _id: string;
  Course_Title: string;
  Course_Duration: number;
  Level: string;
  Enrollment_Count: number;
  createdAt: string;
  Status: string;
  image: string;
  userId: {
    _id: string;
    Instructor_Name: string;
    email: string;
    image: string;
    phone: string;
  };
};

const coursesCollectionSchema: TypesenseCollectionSchema = {
  name: TYPESENSE_COURSES_COLLECTION,
  fields: [
    { name: "courseTitle", type: "string" },
    { name: "courseDuration", type: "float", sort: true },
    { name: "level", type: "string", facet: true },
    { name: "enrollmentCount", type: "int32", sort: true },
    { name: "status", type: "string", facet: true },
    { name: "image", type: "string" },
    { name: "instructorId", type: "string", facet: true },
    { name: "instructorName", type: "string", facet: true },
    { name: "instructorEmail", type: "string" },
    { name: "instructorImage", type: "string" },
    { name: "instructorPhone", type: "string" },
    { name: "createdAt", type: "int64", sort: true },
  ],
  default_sorting_field: "enrollmentCount",
};

const getTypesenseHost = () =>
  (process.env.TYPESENSE_HOST ?? DEFAULT_TYPESENSE_HOST).replace(/\/$/, "");

const getTypesenseApiKey = () =>
  process.env.TYPESENSE_API_KEY ?? DEFAULT_TYPESENSE_API_KEY;

const getTypesenseUrl = (path: string) => `${getTypesenseHost()}${path}`;

const readErrorPreview = async (response: Response) => {
  const text = await response.text();
  return text.slice(0, ERROR_PREVIEW_LIMIT);
};

const typesenseFetch = async (path: string, init: RequestInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("X-TYPESENSE-API-KEY", getTypesenseApiKey());

  const response = await fetch(getTypesenseUrl(path), {
    ...init,
    headers,
  });

  if (!response.ok) {
    const preview = await readErrorPreview(response);
    throw new Error(`Typesense request failed (${response.status}): ${preview}`);
  }

  return response;
};

export async function ensureCoursesCollection(options = { recreate: false }) {
  if (options.recreate) {
    const deleteResponse = await fetch(
      getTypesenseUrl(`/collections/${TYPESENSE_COURSES_COLLECTION}`),
      {
        method: "DELETE",
        headers: {
          "X-TYPESENSE-API-KEY": getTypesenseApiKey(),
        },
      }
    );

    if (!deleteResponse.ok && deleteResponse.status !== HTTP_NOT_FOUND) {
      const preview = await readErrorPreview(deleteResponse);
      throw new Error(
        `Typesense collection delete failed (${deleteResponse.status}): ${preview}`
      );
    }
  }

  const collectionResponse = await fetch(
    getTypesenseUrl(`/collections/${TYPESENSE_COURSES_COLLECTION}`),
    {
      headers: {
        "X-TYPESENSE-API-KEY": getTypesenseApiKey(),
      },
    }
  );

  if (collectionResponse.ok) {
    return;
  }

  if (collectionResponse.status !== HTTP_NOT_FOUND) {
    const preview = await readErrorPreview(collectionResponse);
    throw new Error(
      `Typesense collection lookup failed (${collectionResponse.status}): ${preview}`
    );
  }

  await typesenseFetch("/collections", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(coursesCollectionSchema),
  });
}

const parseImportLine = (line: string): TypesenseImportLine =>
  JSON.parse(line) as TypesenseImportLine;

const getTypesenseSortBy = (sort = "") => {
  if (sort === "countHigh") {
    return "enrollmentCount:desc";
  }

  if (sort === "countLow") {
    return "enrollmentCount:asc";
  }

  if (sort === "durationHigh") {
    return "courseDuration:desc";
  }

  if (sort === "durationLow") {
    return "courseDuration:asc";
  }

  return "";
};

const escapeFilterValue = (value: string) => `\`${value.replace(/`/g, "\\`")}\``;

const buildSearchFilterBy = (filters: CourseSearchFilters) => {
  const filterParts: string[] = [];

  if (filters.Instructor) {
    filterParts.push(`instructorId:=${escapeFilterValue(filters.Instructor)}`);
  }

  if (filters.Status) {
    filterParts.push(`status:=${escapeFilterValue(filters.Status)}`);
  }

  if (filters.Level) {
    filterParts.push(`level:=${escapeFilterValue(filters.Level)}`);
  }

  return filterParts.join(" && ");
};

const toCourseProduct = (
  document: CourseSearchDocument
): CourseSearchProduct => ({
  _id: document.id,
  Course_Title: document.courseTitle,
  Course_Duration: document.courseDuration,
  Level: document.level,
  Enrollment_Count: document.enrollmentCount,
  createdAt: new Date(document.createdAt).toISOString(),
  Status: document.status,
  image: document.image,
  userId: {
    _id: document.instructorId,
    Instructor_Name: document.instructorName,
    email: document.instructorEmail,
    image: document.instructorImage,
    phone: document.instructorPhone,
  },
});

export async function importCoursesToTypesense(
  documents: CourseSearchDocument[]
) {
  if (documents.length === 0) {
    return { imported: 0 };
  }

  const body = documents.map((document) => JSON.stringify(document)).join("\n");
  const response = await typesenseFetch(
    `/collections/${TYPESENSE_COURSES_COLLECTION}/documents/import?action=upsert`,
    {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body,
    }
  );

  const lines = (await response.text()).split("\n").filter(Boolean);
  const results = lines.map(parseImportLine);
  const failedResults = results.filter((result) => result.success !== true);

  if (failedResults.length > 0) {
    const firstError = failedResults.at(0)?.error ?? "Unknown import error";
    throw new Error(`Typesense import failed: ${firstError}`);
  }

  return { imported: results.length };
}

export async function deleteCourseFromTypesense(documentId: string) {
  const response = await fetch(
    getTypesenseUrl(
      `/collections/${TYPESENSE_COURSES_COLLECTION}/documents/${documentId}`
    ),
    {
      method: "DELETE",
      headers: {
        "X-TYPESENSE-API-KEY": getTypesenseApiKey(),
      },
    }
  );

  if (response.status === HTTP_NOT_FOUND) {
    return { deleted: false };
  }

  if (!response.ok) {
    const preview = await readErrorPreview(response);
    throw new Error(
      `Typesense document delete failed (${response.status}): ${preview}`
    );
  }

  return { deleted: true };
}

export async function searchCoursesInTypesense({
  query,
  page,
  limit,
  filters,
}: {
  query: string;
  page: number;
  limit: number;
  filters: CourseSearchFilters;
}) {
  const params = new URLSearchParams({
    q: query,
    query_by: "courseTitle,instructorName,level,status",
    page: String(page),
    per_page: String(limit),
  });
  const filterBy = buildSearchFilterBy(filters);
  const sortBy = getTypesenseSortBy(filters.Sort);

  if (filterBy) {
    params.set("filter_by", filterBy);
  }

  if (sortBy) {
    params.set("sort_by", sortBy);
  }

  const response = await typesenseFetch(
    `/collections/${TYPESENSE_COURSES_COLLECTION}/documents/search?${params.toString()}`
  );
  const data = (await response.json()) as TypesenseSearchResponse;

  return {
    product: (data.hits ?? []).map((hit) => toCourseProduct(hit.document)),
    total: data.found,
  };
}
