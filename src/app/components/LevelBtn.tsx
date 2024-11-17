export default function BtnLevel({ Level }: { Level: string }) {
  return (
    <button
      className={`py-1 px-3 rounded-full ${
        Level == "Beginner"
          ? "bg-[#E0E0ED] text-gray-500 "
          : Level == "Intermediate"
          ? "bg-[#E3EBFF] text-blue-500"
          : "bg-[#4D7EFF] text-white border-blue-500"
      }`}
    >
      {Level}
    </button>
  );
}
