export default function BtnStatus({ Status }: { Status: string }) {
  return (
    <button
      className={`py-1 px-3 rounded-full bg-base${
        Status == "Open" ? " text-[#42AB8B]" : "text-gray-500 "
      }`}
      style={{ border: "1px solid #E0E0ED" }}
    >
      {Status}
    </button>
  );
}
