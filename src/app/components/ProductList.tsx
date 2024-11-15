"use client";
import Image from "next/image";

export interface Courses {
  _id: string;
  Course_Title: string;
  Instructor_Name: string;
  Course_Duration: Date;
  Level: string;
  Enrollment_Count: Number;
  createdAt: Date;
  Status: string;
  image: string;
}

interface ProductListProps {
  products: Courses[];
}

export default function ProductList({ products }: ProductListProps) {
  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 mt-12 w-full">
      {products.map((item) => (
        <div className="card bg-base-100 w-96 shadow-xl" key={item._id}>
          <figure>
            <div className="relative h-[300px] w-[100%]">
              <Image
                src={item.image}
                alt={item.Course_Title || "Product Image"}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: "cover" }}
              />
            </div>
          </figure>

          <div
            className="card-body text-slate-50"
            style={{ boxShadow: "#0097ff10 0px -10px 60px inset" }}
          >
            <h2 className="card-title">ID: {item._id}</h2>
            <h2 className="card-title">Name: {item.Course_Title}</h2>
            <p>
              Created At:{" "}
              {new Date(item.createdAt).toLocaleDateString("th-TH", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            </p>
            <p>Description: {item.Instructor_Name}</p>
            <p>Points: {item.Level}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
