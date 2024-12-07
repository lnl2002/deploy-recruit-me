import React from "react";

import {} from "@nextui-org/react";
import { Facebook, Globe, Mail, Phone } from "lucide-react";

const IntroductionOne = (): React.JSX.Element => {
  return (
    <div className="bg-themeOrange px-12 py-6">
      <div className="grid lg:grid-cols-4 sm:grid-cols-2 ">
        <div className="flex gap-2 flex-row">
          <Globe />
          <span>https://fe-deploy-recruit-me.vercel.app/</span>
        </div>
        <div className="flex gap-2 flex-row">
          <Mail />
          <span>fptCPG35@fpt.cr.vn</span>
        </div>
        <div className="flex gap-2 flex-row">
          <Phone />
          <span>1-791-463-5020 x9458</span>df
        </div>
        <div className="flex gap-2 flex-row">
          <Facebook />
          <span>https://fe-deploy-recruit-me.vercel.app/</span>
        </div>
      </div>
    </div>
  );
};

export default IntroductionOne;
