"use client"
import React from "react";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { Role } from "@/utils/constants";

type InterviewerLayoutProp = {
  children: React.ReactNode;
};

export const InterviewerLayout = ({ children }: InterviewerLayoutProp): React.JSX.Element => {
  return (
    <div className="flex-1 flex flex-col w-full fixed-container ">
      <Header role={Role.Interviewer}></Header>
      <div className="min-h-screen">{children}</div>
      <Footer></Footer>
    </div>
  );
};
