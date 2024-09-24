"use client"
import { TopBanner } from "../../components/TopBanner";
import { MainInfoCard } from "./MainInfoCard";
import { useRouter } from "next/navigation";
import { Images } from "@/images";

export const Home = (): React.JSX.Element => {
  const router = useRouter();

  return (
    <div>
      <TopBanner
        src={Images.Banner1}
        h1="FPT education recruitment"
        h2="Your Pathway to Success Starts Here"
        description="Our mission is to bridge the gap between opportunity and talent, fostering an environment where both employers and job seekers can thrive. We are committed to creating meaningful connections that empower individuals to achieve their career aspirations and help businesses grow with the right talent."
      />

      <div className="flex justify-center -translate-y-10">
        <MainInfoCard />
      </div>
    </div>
  );
};
