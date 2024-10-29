import React from "react";
import { Header } from "../Header";
import { Footer } from "../Footer";

type MainLayoutProp = {
  children: React.ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProp): React.JSX.Element => {
  return (
    <div className="min-h-[100vh] flex flex-col flex-1 w-full fixed-container bg-themeWhite">
      <Header></Header>
      {children}
      <Footer></Footer>
    </div>
  );
};
