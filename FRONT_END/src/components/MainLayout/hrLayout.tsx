import React from "react";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { Role } from "@/utils/constants";

type HrLayoutProp = {
  children: React.ReactNode;
};

export const HrLayout = ({ children }: HrLayoutProp): React.JSX.Element => {
  return (
    <div className="w-full fixed-container bg-themeWhite">
      <Header role={Role.Recruiter}></Header>
      {children}
      <Footer></Footer>
    </div>
  );
};
