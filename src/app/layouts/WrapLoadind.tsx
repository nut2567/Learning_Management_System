// app/users/loading.tsx
export default function WrapLoading() {
  return (
    <div className="flex-col text-center flex items-center  justify-center h-dvh">
      <p className="text-3xl flex items-end  justify-end mb-4">
        กำลังโหลดข้อมูล
        <span className="loading loading-dots loading-lg"></span>
      </p>

      <div className="flex w-52 flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="skeleton h-16 w-16 shrink-0 rounded-full"></div>
          <div className="flex flex-col gap-4">
            <div className="skeleton h-4 w-20"></div>
            <div className="skeleton h-4 w-28"></div>
          </div>
        </div>
        <div className="skeleton h-32 w-full"></div>
      </div>
    </div>
  );
}
