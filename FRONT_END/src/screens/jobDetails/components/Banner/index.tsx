import { Image } from "@nextui-org/react";
import { useEffect } from "react";

type BannerProps = {
  bannnerUrl: string;
};

const Banner: React.FC<BannerProps> = (): React.JSX.Element => {
  return (
    <div className="h-96 w-full">
      <Image src="" alt="" />
    </div>
  );
};
export default Banner;
