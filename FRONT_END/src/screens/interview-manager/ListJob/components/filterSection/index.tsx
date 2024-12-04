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
      {filterOptions.map((filter) => (
        <div
          key={filter.value}
          className="flex justify-start py-2 w-full cursor-pointer"
          onClick={() => handleClick(filter.value)}
        >
          <p
            className={`text-base px-1 text-${
              filterValue === filter.value
                ? "themeDark border-b-2"
                : "foreground-400"
            }`}
          >
            {filter.label}
          </p>
        </div>
      ))}
    </div>
  );
};

const filterOptions = [
  { value: "", label: "All Job" },
  { value: "pending", label: "Pending Approve Jobs" },
  { value: "approved", label: "Approved Jobs" },
  { value: "expired", label: "Expired Jobs" },
  { value: "completed", label: "Completed Jobs" },
];

export default FilterSection;
