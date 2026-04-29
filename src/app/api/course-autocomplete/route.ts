import { getCourseAutocompleteSuggestions } from "@lib/typesense";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 10;

const toSuggestionLimit = (value: string | null) => {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return DEFAULT_LIMIT;
  }

  return Math.min(parsedValue, MAX_LIMIT);
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (
    searchParams.get("Search") ??
    searchParams.get("query") ??
    ""
  ).trim();
  const Instructor = searchParams.get("Instructor") || "";
  const Status = searchParams.get("Status") || "";
  const Level = searchParams.get("Level") || "";
  const limit = toSuggestionLimit(searchParams.get("limit"));

  if (Instructor && !Types.ObjectId.isValid(Instructor)) {
    return NextResponse.json(
      { message: "Instructor is not a valid ObjectId" },
      { status: 400 }
    );
  }

  if (!query) {
    return NextResponse.json(
      { message: "Success autocomplete", suggestions: [] },
      { status: 200 }
    );
  }

  try {
    const suggestions = await getCourseAutocompleteSuggestions({
      query,
      limit,
      filters: { Instructor, Status, Level },
    });

    return NextResponse.json(
      { message: "Success autocomplete", suggestions },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch autocomplete suggestions", error },
      { status: 500 }
    );
  }
}
