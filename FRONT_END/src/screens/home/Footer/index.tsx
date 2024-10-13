import { Images } from "@/images";
import Image from "next/image";

const FooterComponent = (): React.JSX.Element => {
  return (
    <div className="w-full flex flex-row justify-center mt-12">
      <Image src={Images.JHBanner} alt="Job hiring" objectFit="cover" />
    </div>
  );
};

export default FooterComponent;
