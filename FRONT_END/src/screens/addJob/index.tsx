"use client";
import dynamic from "next/dynamic";

const CustomEditor = dynamic(() => import("./custom"), {
  ssr: false,
});

export const AddJob = (): React.JSX.Element => {
  return <CustomEditor></CustomEditor>;
};
