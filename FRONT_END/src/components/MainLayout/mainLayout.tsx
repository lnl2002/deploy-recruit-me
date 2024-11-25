"use client"
import React from "react";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { AIChat } from "../AiChat";

type MainLayoutProp = {
  children: React.ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProp): React.JSX.Element => {
  return (
    <div className="w-full fixed-container bg-themeWhite h-full">
      <Header></Header>
      <div className="min-h-screen">
        {children}
        <div className="fixed right-10 bottom-10">
          <AIChat />
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
};
