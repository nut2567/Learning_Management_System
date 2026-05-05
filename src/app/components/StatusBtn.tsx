export default function BtnStatus({ Status }: { Status: string }) {
  const statusClass =
    Status === "Open" ? "text-[#42AB8B]" : "text-gray-500";

  return (
    <button
      className={`py-1 px-3 rounded-full bg-base ${statusClass}`}
      style={{ border: "1px solid #E0E0ED" }}
    >
      {Status}
    </button>
  );
}
