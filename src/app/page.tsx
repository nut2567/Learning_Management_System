import Home from "@/app/layouts/homepage";
import { GetProduct } from "@/app/utils/getproduct";
import GetInstructors from "@/app/utils/getInstructors";

export default async function HomePage() {
  const initialProducts = await GetProduct();
  const initialinstructor = await GetInstructors();
  return (
    <Home
      initialProducts={initialProducts}
      initialinstructor={initialinstructor}
    />
  );
}
