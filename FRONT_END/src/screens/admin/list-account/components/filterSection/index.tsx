import React from "react";

type FilterSectionProps = {
  setFilterValue: (value: string) => void;
  setCurrentPage: (value: number) => void;
  filterValue: string;
};

const FilterSection: React.FC<FilterSectionProps> = ({
  setFilterValue,
  filterValue,
  setCurrentPage,
}): React.JSX.Element => {
  const handleClick = (value: string) => {
    setFilterValue(value);
    setCurrentPage(1);
  };

  return (
    <div className="px-4">
      <div
        className="flex justify-start py-2 w-full cursor-pointer"
        onClick={() => handleClick("")}
      >
        <p
          className={`text-base px-1 text-${
            !filterValue ? "themeDark border-b-2" : "foreground-400"
          }`}
        >
          All Account
        </p>
      </div>
      <div
        className="flex justify-start py-2 w-full cursor-pointer"
        onClick={() => handleClick("INTERVIEW_MANAGER")}
      >
        <p
          className={`text-base px-1 text-${
            filterValue === "INTERVIEW_MANAGER"
              ? "themeDark border-b-2"
              : "foreground-400"
          }
          `}
        >
          Interview Manager Account
        </p>
      </div>
      <div
        className="flex justify-start py-2 w-full cursor-pointer"
        onClick={() => handleClick("RECRUITER")}
      >
        <p
          className={`text-base px-1 text-${
            filterValue === "RECRUITER"
              ? "themeDark border-b-2"
              : "foreground-400"
          }
          `}
        >
          Recruiter Account
        </p>
      </div>
      <div
        className="flex justify-start py-2 w-full cursor-pointer"
        onClick={() => handleClick("INTEVIEWER")}
      >
        <p
          className={`text-base px-1 text-${
            filterValue === "INTEVIEWER"
              ? "themeDark border-b-2"
              : "foreground-400"
          }`}
        >
          Interviewer Account
        </p>
      </div>
      <div
        className="flex justify-start py-2 w-full cursor-pointer"
        onClick={() => handleClick("CANDIDATE")}
      >
        <p
          className={`text-base px-1 text-${
            filterValue === "CANDIDATE"
              ? "themeDark border-b-2"
              : "foreground-400"
          }`}
        >
          Candidate Account
        </p>
      </div>
    </div>
  );
};

export default FilterSection;
