import React from "react";

type FilterSectionProps = {
  setFilterValue: (value: string) => void;
  filterValue: string;
};

const FilterSection: React.FC<FilterSectionProps> = ({
  setFilterValue,
  filterValue,
}): React.JSX.Element => {
  const handleClick = (value: string) => {
    setFilterValue(value);
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
          All My Job
        </p>
      </div>
      <div
        className="flex justify-start py-2 w-full cursor-pointer"
        onClick={() => handleClick("pending,rejected")}
      >
        <p
          className={`text-base px-1 text-${
            filterValue === "pending,rejected"
              ? "themeDark border-b-2"
              : "foreground-400"
          }
          `}
        >
          Posted Jobs
        </p>
      </div>
      <div
        className="flex justify-start py-2 w-full cursor-pointer"
        onClick={() => handleClick("reopened,approved,published")}
      >
        <p
          className={`text-base px-1 text-${
            filterValue === "reopened,approved,published"
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
