import axios from "axios";
import type { User } from "@/app/components/FilterBar";

type InstructorResponse = {
  userList: User[];
};

const getApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4400";

export default async function GetInstructors(): Promise<User[]> {
  try {
    const { data } = await axios.get<InstructorResponse>(
      `${getApiBaseUrl()}/api/getInstructor`
    );

    if (Array.isArray(data.userList)) {
      return data.userList;
    }

    return [];
  } catch {
    return [];
  }
}
