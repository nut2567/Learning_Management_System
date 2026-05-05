import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GetInstructors from "./getInstructors";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedAxiosGet = vi.mocked(axios.get);

describe("GetInstructors", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  });

  it("returns instructors from the default API base URL", async () => {
    const userList = [
      {
        _id: "user-1",
        Instructor_Name: "Ada Lovelace",
        email: "ada@example.com",
        role: "Instructor",
      },
    ];

    mockedAxiosGet.mockResolvedValueOnce({ data: { userList } });

    await expect(GetInstructors()).resolves.toEqual(userList);
    expect(mockedAxiosGet).toHaveBeenCalledWith(
      "http://localhost:4400/api/getInstructor"
    );
  });

  it("uses NEXT_PUBLIC_API_BASE_URL when it is configured", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://lms.example.com";
    mockedAxiosGet.mockResolvedValueOnce({ data: { userList: [] } });

    await GetInstructors();

    expect(mockedAxiosGet).toHaveBeenCalledWith(
      "https://lms.example.com/api/getInstructor"
    );
  });

  it("returns an empty list when the API shape is invalid", async () => {
    mockedAxiosGet.mockResolvedValueOnce({ data: { userList: null } });

    await expect(GetInstructors()).resolves.toEqual([]);
  });

  it("returns an empty list when the request fails", async () => {
    mockedAxiosGet.mockRejectedValueOnce(new Error("network error"));

    await expect(GetInstructors()).resolves.toEqual([]);
  });
});
