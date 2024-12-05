import { setStatusJobFilterIndex } from "@/store/jobState";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import React from "react";

const FilterSection = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { statusJobFilterIndex } = useSelector((state: RootState) => state.job);
  const handleClick = (value: number) => {
    dispatch(setStatusJobFilterIndex(value));
  };

  return (
    <div className="px-4">
      {jobFilters.map((filter) => (
        <div
          key={filter.id}
          className="flex justify-start py-2 w-full cursor-pointer"
          onClick={() => handleClick(filter.id)}
        >
          <p
            className={`text-base px-1 text-${
              statusJobFilterIndex === filter.id
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

const jobFilters = [
  { id: 1, label: "All My Job" },
  { id: 2, label: "New Jobs" },
  { id: 3, label: "Approved Jobs" },
  { id: 4, label: "Completed Jobs" },
  { id: 5, label: "Rejected Jobs" },
  { id: 6, label: "Deleted Jobs" },
];

export default FilterSection;
