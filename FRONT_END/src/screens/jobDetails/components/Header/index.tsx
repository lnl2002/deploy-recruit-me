import { Image } from "@nextui-org/react";
import React from "react";

type HeaderProps = {
  bannerUrl?: string;
  imageUrl?: string;
};

const Header: React.FC<HeaderProps> = ({
  bannerUrl,
  imageUrl,
}): React.JSX.Element => {
  return (
    <div className="">
      <Image src={bannerUrl} alt="" radius="none" />;
    </div>
  );
};

export default Header;
