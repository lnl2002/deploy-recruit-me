import { Images } from "@/images";
import { Button } from "@nextui-org/react";
import Image from "next/image";

const IntroductionFour = (): React.JSX.Element => {
  return (
    <div className="relative w-full h-96 sm:min-h-96 overflow-hidden flex items-center my-12">
      <Image
        src={Images.FPT_University}
        alt="background"
        objectFit="cover"
        fill
      />
      <div className="absolute flex justify-center items-center top-0 bottom-0 left-0 right-0">
        <div className="w-1/3 flex flex-col items-center gap-4">
          <h1 className="text-themeWhite text-3xl font-extrabold text-center">
            Experience one of Asia's best working environment
          </h1>
          <p className="text-sm text-themeWhite">
            Find the job that's perfect for you, about 500+ new jobs everyday
          </p>
          <div>
            <Button
              size="sm"
              radius="full"
              className="bg-[#FFF] text-themeDark px-14 font-bold"
            >
              Search Job
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroductionFour;
