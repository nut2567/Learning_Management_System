import axios from "axios";
export default async function GetInstructors() {
  try {
    const baseURL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
    const { data } = await axios.get(`${baseURL}/api/instructor`);
    console.log(data);
    // ตรวจสอบและส่งข้อมูล
    if (data && data.userList) {
      return data.userList;
    }
    return [];
  } catch (err) {
    console.error("Error fetching instructors:", err);
    return [];
  }
}
