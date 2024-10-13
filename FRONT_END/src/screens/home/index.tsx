"use client";
import { TopBanner } from "../../components/TopBanner";
import { MainInfoCard } from "./MainInfoCard";
import { useRouter } from "next/navigation";
import { Images } from "@/images";
import Introduction from "./Introductions";
import ListJob from "./ListJob";
import FooterComponent from "./Footer";

export const Home = (): React.JSX.Element => {
  const router = useRouter();

  return (
    <div>
      <TopBanner />
      <Introduction />
      <ListJob />
      <FooterComponent />

      {/* <div className="flex justify-center -translate-y-10"> */}
      {/* <MainInfoCard /> */}
      {/* </div> */}
    </div>
  );
};
