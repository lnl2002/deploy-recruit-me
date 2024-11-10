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
      <div
        className="flex justify-start py-2 w-full cursor-pointer"
        onClick={() => handleClick(1)}
      >
        <p
          className={`text-base px-1 text-${
            statusJobFilterIndex === 1
              ? "themeDark border-b-2"
              : "foreground-400"
          }`}
        >
          All My Job
        </p>
      </div>
      <div
        className="flex justify-start py-2 w-full cursor-pointer"
        onClick={() => handleClick(2)}
      >
        <p
          className={`text-base px-1 text-${
            statusJobFilterIndex === 2
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
        onClick={() => handleClick(3)}
      >
        <p
          className={`text-base px-1 text-${
            statusJobFilterIndex === 3
              ? "themeDark border-b-2"
              : "foreground-400"
          }`}
        >
          Active Jobs
        </p>
      </div>
      <div
        className="flex justify-start py-2 w-full cursor-pointer"
        onClick={() => handleClick(4)}
      >
        <p
          className={`text-base px-1 text-${
            statusJobFilterIndex === 4
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
