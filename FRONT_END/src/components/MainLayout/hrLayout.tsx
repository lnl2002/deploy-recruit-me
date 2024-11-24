import React from "react";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { Role } from "@/utils/constants";

type HrLayoutProp = {
  children: React.ReactNode;
};

export const HrLayout = ({ children }: HrLayoutProp): React.JSX.Element => {
  return (
    <div className="flex-1 flex flex-col w-full fixed-container bg-themeWhite">
      <Header role={Role.Recruiter}></Header>
      <div className="min-h-screen">{children}</div>
      <Footer></Footer>
    </div>
  );
};
