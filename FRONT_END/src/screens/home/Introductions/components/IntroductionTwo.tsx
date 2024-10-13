import React from "react";

import { Chip } from "@nextui-org/react";
import { Globe2, ArrowLeft, ArrowRight } from "lucide-react";

const IntroductionTwo = (): React.JSX.Element => {
  const categoryDescriptionJob = [
    { icon: Globe2, categoryName: "Digital automotive", numberJob: 200 },
    { icon: Globe2, categoryName: "Digital automotive", numberJob: 200 },
    { icon: Globe2, categoryName: "Digital automotive", numberJob: 200 },
    { icon: Globe2, categoryName: "Digital automotive", numberJob: 200 },
    { icon: Globe2, categoryName: "Digital automotive", numberJob: 200 },
    { icon: Globe2, categoryName: "Digital automotive", numberJob: 200 },
  ];
  return (
    <div className="py-10 flex flex-col items-center justify-center gap-4">
      <div className="py-3">
        <Chip variant="bordered">01 Category</Chip>
      </div>
      <div className="flex flex-col items-center">
        <h1 className="uppercase text-themeDark font-bold text-[2vw]">
          Browse by category
        </h1>
        <span className="text-blurEffect text-[1vw]">
          Fin the job that's perfect for you, about 500+ new jobs everyday
        </span>
      </div>
      <div className="w-1/2 grid grid-cols-3 gap-8">
        {categoryDescriptionJob.map((catergory, index) => (
          <div
            key={catergory.categoryName + index + "key"}
            className="flex flex-col justify-center items-center border rounded-xl p-4 gap-2"
          >
            <div className="bg-blurEffectGold p-1 rounded-full">
              <catergory.icon color="#f08900" />
            </div>
            <span className="block text-themeDark font-semibold ">
              {catergory.categoryName}
            </span>
            <span className="block text-blurEffect text-sm">
              {catergory.numberJob} new jobs
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <ArrowLeft
          color="#000"
          size={24}
          className="p-1 bg-tableBorder400 rounded-full cursor-pointer"
        />
        <ArrowRight
          color="#FFF"
          size={24}
          className="p-1 bg-themeOrange rounded-full cursor-pointer"
        />
      </div>
    </div>
  );
};
export default IntroductionTwo;
