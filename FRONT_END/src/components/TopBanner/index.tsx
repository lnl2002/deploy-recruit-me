import { montserratRegular } from "@/app/fonts";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

export const TopBanner = (): React.JSX.Element => {
  return (
    <div className="relative w-full h-96 sm:h-screen overflow-hidden flex items-center">
      <Image
        className=""
        alt="background"
        src={
          "https://i.pinimg.com/564x/6d/87/b0/6d87b07f1c75ed40edce0e483e2a4730.jpg"
        }
        objectFit="cover"
        fill
      />
      <div
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.7455357142857143) 0%, rgba(255,255,255,0.1516981792717087) 100%);",
        }}
        className="w-full h-full absolute bg-custom-gradient"
      ></div>
      <div className="absolute flex top-0 bottom-0 left-0 right-0">
        <div className="w-3/6">
          <div>
            <div>
              <span className="text-black font-island-moments text-[4vw]">
                The
              </span>
              <span className="text-orange-600 font-island-moments text-[4vw]">
                Easiest Way
              </span>
            </div>
            <div>
              <span className="text-orange-600 font-island-moments text-[4vw]">
                to Get Your Dream Job
              </span>
            </div>
          </div>
          {/* <h2
            className={twMerge(
              montserratRegular.className,
              "text-themeWhite text-3xl sm:text-4xl"
            )}
          ></h2> */}
          <p
            className={twMerge(
              montserratRegular.className,
              "max-w-screen-sm hidden sm:block mt-6 text-themeWhite"
            )}
          ></p>
        </div>
        <div className="w-3/6"></div>
      </div>
    </div>
  );
};
