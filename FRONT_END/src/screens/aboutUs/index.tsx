import { montserratMedium, montserratRegular, montserratSemiBold } from "@/app/fonts";
import { TopBanner } from "@/components/TopBanner";
import { Images } from "@/images";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

export const AboutUs = (): React.JSX.Element => {
  return (
    <div>
      <TopBanner
        src={Images.Banner1}
        h1="FPT education recruit"
        h2="Connecting Talent, Creating Futures"
        description="Our mission is to bridge the gap between opportunity and talent, fostering an environment where both employers and job seekers can thrive. We are committed to creating meaningful connections that empower individuals to achieve their career aspirations and help businesses grow with the right talent."
      />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 m-5 md:m-20">
        <div className="hidden md:block md:col-span-1"></div>
        <div className="md:col-span-4">
          <p
            className={twMerge(
              montserratSemiBold.className,
              "text-textPrimary text-4xl md:text-5xl"
            )}
            id="our-story"
          >
            ABOUT US
          </p>
        </div>
        <div className="md:col-span-1 mt-5 md:mt-7">
          <a href="#our-story" className="block text-textSecondary text-sm hover:text-textPrimary transition">
            OUR STORY
          </a>
          <a href="#vision" className="block text-textSecondary text-sm hover:text-textPrimary transition">
            VISION
          </a>
          <a href="#mission" className="block text-textSecondary text-sm hover:text-textPrimary transition">
            MISSION
          </a>
        </div>
        <div className="md:col-span-4">
          <p
            className={twMerge(
              montserratRegular.className,
              "text-textSecondary text-base md:text-lg mt-5 md:mt-7"
            )}
          >
            Founded by a team of passionate professionals who understand the challenges of the job market, our mission is to simplify the recruitment process. We believe that every individual has unique skills and potential, and every company has a unique culture and vision. By leveraging cutting-edge technology and a deep understanding of the industry, we aim to match the right talent with the right opportunities.<br />
            <br />
            Join us on this journey and take the first step towards your dream career or finding the perfect candidate for your team. Together, we can build a future where everyone thrive.
          </p>
        </div>
      </div>

      <div className="relative w-full h-[34rem] md:h-[40rem] overflow-hidden flex items-center p-5 md:p-20">
        <Image
          className="object-cover w-full h-full"
          alt="background"
          src={"/images/about_large_banner.png"}
          layout="fill"
        />
      </div>

      <div className="flex justify-center m-5 md:m-20"  id="vision">
        <p
          className={twMerge(
            montserratMedium.className,
            "text-textPrimary text-xl md:text-4xl text-center max-w-screen-sm"
          )}
        >
          "Empowering careers, connecting talent with opportunity, and building futures together."
        </p>
      </div>
      <div className="m-5 md:m-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative w-full h-80 md:h-full">
            <Image
              fill
              objectFit="contain"
              src={"/images/card_thumb_2.png"}
              alt="product_link_image"
            />
          </div>
          <div className="mt-5 md:mt-8">
            <div id="mission">
              <h2
                className={twMerge(
                  montserratSemiBold.className,
                  "text-textPrimary text-2xl md:text-4xl"
                )}
              >
                Mission to the Community
              </h2>
              <p
                className={twMerge(
                  montserratRegular.className,
                  "max-w-screen-sm mt-4 md:mt-6 text-textSecondary text-base md:text-lg"
                )}
              >
                Our mission is to bridge the gap between exceptional talent and outstanding opportunities, fostering a community where both employers and job seekers thrive. We are committed to creating a transparent, inclusive, and empowering recruitment process that not only matches skills with roles but also aligns values and aspirations. 
                <br/><br />
                By nurturing meaningful connections, we aim to build a future where everyone can achieve their career dreams and contribute to a better world.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
