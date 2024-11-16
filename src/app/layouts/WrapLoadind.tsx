// app/users/loading.tsx
function Loading() {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className=" customskeleton h-52 w-full"></div>
      <div className="flex gap-4">
        <div className=" customskeleton h-5 w-1/3"></div>
        <div className=" customskeleton h-5 w-1/3"></div>
      </div>
      <div className=" customskeleton h-4 w-full"></div>
      <div className=" customskeleton h-4 w-full"></div>

      <div className="flex justify-between gap-4  w-full">
        <div className="flex gap-2  items-center w-full">
          <div className=" customskeleton h-6 w-6"></div>
          <div className=" customskeleton h-5 w-3/4"></div>
        </div>
        <div className="flex gap-2  items-center w-full">
          <div className=" customskeleton h-6 w-6"></div>
          <div className=" customskeleton h-5 w-3/4"></div>
        </div>
      </div>
    </div>
  );
}
export default function WrapLoading() {
  return (
    <div className="w-full">
      <p className="text-3xl flex items-center  justify-center my-12">
        กำลังโหลดข้อมูล
        <span className="loading loading-dots loading-lg"></span>
      </p>
      <div className="grid smb:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4  w-full">
        <Loading />
        <Loading />
        <Loading />
      </div>
    </div>
  );
}
