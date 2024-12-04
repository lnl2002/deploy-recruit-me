import React from "react";

type FilterSectionProps = {
  setFilterValue: (value: string) => void;
  filterValue: string;
  setCurrentPage: (value: number) => void;
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
          All Job
        </p>
      </div>
      <div
        className="flex justify-start py-2 w-full cursor-pointer"
        onClick={() => handleClick("pending")}
      >
        <p
          className={`text-base px-1 text-${
            filterValue === "pending"
              ? "themeDark border-b-2"
              : "foreground-400"
          }
          `}
        >
          Pending Approve Jobs
        </p>
      </div>
      <div
        className="flex justify-start py-2 w-full cursor-pointer"
        onClick={() => handleClick("approved")}
      >
        <p
          className={`text-base px-1 text-${
            filterValue === "approved"
              ? "themeDark border-b-2"
              : "foreground-400"
          }
          `}
        >
          Approved Jobs
        </p>
      </div>
      <div
        className="flex justify-start py-2 w-full cursor-pointer"
        onClick={() => handleClick("reopened,published")}
      >
        <p
          className={`text-base px-1 text-${
            filterValue === "reopened,published"
              ? "themeDark border-b-2"
              : "foreground-400"
          }`}
        >
          Active Jobs
        </p>
      </div>
      <div
        className="flex justify-start py-2 w-full cursor-pointer"
        onClick={() => handleClick("expired")}
      >
        <p
          className={`text-base px-1 text-${
            filterValue === "expired"
              ? "themeDark border-b-2"
              : "foreground-400"
          }`}
        >
          Completed Jobs
        </p>
      </div>
    </div>
  );
};

export default FilterSection;
