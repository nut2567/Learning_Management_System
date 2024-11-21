import { GiSettingsKnobs } from "react-icons/gi";

interface FilterBarProps {
  Instructor: string;
  setInstructor: (value: string) => void;
  Level: string;
  setLevel: (value: string) => void;
  Status: string;
  setStatus: (value: string) => void;
  Sort: string;
  setSort: (value: string) => void;
  instructors: User[];
}

export interface User {
  id: string;
  Instructor_Name: string;
  email: string;
  role: string;
}

export default function FilterBar({
  Instructor,
  setInstructor,
  Level,
  setLevel,
  Status,
  setStatus,
  Sort,
  setSort,
  instructors,
}: FilterBarProps) {
  return (
    <div
      id="filter"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4  w-full"
    >
      {/* Instructor Filter */}
      <div className="flex flex-col space-y-2">
        <label htmlFor="select-1" className="block font-medium">
          Instructor
        </label>
        <select
          id="select-1"
          className="p-2 bg-white border rounded-md focus:ring-2 focus:ring-blue-500"
          value={Instructor}
          onChange={(e) => setInstructor(e.target.value)}
        >
          <option value="">All</option>
          {instructors.map((user) => (
            <option key={user.id} value={user.id}>
              {user.Instructor_Name}
            </option>
          ))}
        </select>
      </div>

      {/* Level Filter */}
      <div className="flex flex-col space-y-2">
        <label htmlFor="select-2" className="block font-medium">
          Level
        </label>
        <select
          id="select-2"
          className="p-2 bg-white border rounded-md focus:ring-2 focus:ring-blue-500"
          value={Level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="">All</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {/* Status Filter */}
      <div className="flex flex-col space-y-2">
        <label htmlFor="select-3" className="block font-medium">
          Status
        </label>
        <select
          id="select-3"
          className="p-2 bg-white border rounded-md focus:ring-2 focus:ring-blue-500"
          value={Status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Sort Filter */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <GiSettingsKnobs className="-rotate-90 w-5 h-5 text-gray-600" />
          <label htmlFor="select-sort" className="block font-medium">
            Sort by
          </label>
        </div>
        <select
          id="select-sort"
          className="p-2 bg-white border rounded-md focus:ring-2 focus:ring-blue-500"
          value={Sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="Recommended">Recommended</option>
          <option value="A-Z">Course title (A-Z)</option>
          <option value="Z-A">Course title (Z-A)</option>
          <option value="countHigh">Enrollment count (High to low)</option>
          <option value="countLow">Enrollment count (Low to high)</option>
          <option value="durationHigh">Course duration (Hight to low)</option>
          <option value="durationLow">Course duration (Low to high)</option>
        </select>
      </div>
    </div>
  );
}
