"use client";
import Image from "next/image";
import { CiClock2 } from "react-icons/ci";
import { MdPeople } from "react-icons/md";
import BtnLevel from "@/app/components/LevelBtn";
import BtnStatus from "@/app/components/StatusBtn";

export interface Courses {
  _id: string;
  Course_Title: string;
  userId: {
    Instructor_Name: String;
    age: Number;
    email: String;
    createdAt: Date;
    image: string;
    phone: String;
  };
  Course_Duration: number;
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
  const durationTime = (duration: number) => {
    const hours = Math.floor(duration); // แยกส่วนชั่วโมง
    const minutes = Math.round((duration - hours) * 100); // แปลงส่วนทศนิยมเป็นนาที
    let text = `${hours} hr ${minutes} mins`;
    // console.log(text);
    return text;
  };

  return (
    <div className="grid smb:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12 w-full">
      {products.map((item) => (
        <div
          className="card bg-white p-4 w-full shadow-xl font-medium"
          key={item._id}
        >
          <figure>
            <div className="relative h-[222px] w-[100%]">
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

          <div className="py-5 border-b-2 mb-4 space-y-2">
            {/* <h2 className="card-title">ID: {item._id}</h2> */}
            <div className="space-x-2">
              <BtnLevel Level={item.Level} />
              <BtnStatus Status={item.Status} />
            </div>
            <h2 className="card-title text-black">{item.Course_Title}</h2>
            <div className="flex justify-items-center items-center gap-2">
              <figure>
                <div className="relative h-[28px] w-[28px] ">
                  <Image
                    className="rounded-full"
                    src={item.userId.image}
                    alt={"Instructor_Name Image"}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </figure>
              <p>{item.userId.Instructor_Name}</p>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="flex justify-items-center items-center gap-2">
              <CiClock2 />
              <p>{durationTime(item.Course_Duration)}</p>
            </div>
            <div className="flex justify-items-center items-center gap-2">
              <MdPeople />
              <p>{`${item.Enrollment_Count.toLocaleString("th-TH")}`}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
