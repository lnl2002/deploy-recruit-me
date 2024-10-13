import { montserratRegular } from "@/app/fonts";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { Input } from "@nextui-org/input";
import { MapPin, Search, Settings2 } from "lucide-react";
import { Button, Chip, Slider, Switch } from "@nextui-org/react";

export const TopBanner = (): React.JSX.Element => {
  const jobTitle = [
    { title: "IT LECTURE", background: "#FFF", variant: "solid" },
    { title: "DIGITAL AUTOMOTIVE", background: "#FFF", variant: "bordered" },
    {
      title: "INFORMATION TECHNOLOGY",
      background: "#FFF",
      variant: "solid",
    },
    { title: "GRAPHIC DESIGN", background: "#FFF", variant: "bordered" },
    { title: "COMUNICATION", background: "#FFF", variant: "solid" },
  ];
  return (
    <div className="relative w-full h-screen sm:min-h-screen overflow-hidden flex items-center">
      <Image
        className=""
        alt="background"
        src={
          "https://i.pinimg.com/564x/1b/7e/26/1b7e267774e4d91da5d10ab065f3f306.jpg"
        }
        objectFit="cover"
        fill
      />
      {/* <div
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.7455357142857143) 100%, rgba(255,255,255,0.1516981792717087) 100%);",
        }}
        className="w-full h-full absolute bg-custom-gradient"
      ></div> */}
      <div className="absolute flex top-0 bottom-0 left-0 right-0">
        <div className="w-3/6 flex flex-col justify-center items-center">
          <div className="flex flex-col justify-center h-full w-9/12 gap-5">
            <div>
              <span className="inline text-themeDark font-island-moments text-[3vw] font-bold">
                The{" "}
              </span>
              <span className="inline text-themeOrange font-island-moments text-[3vw] font-bold relative">
                Easiest Way{" "}
                <span className="absolute -bottom-2 w-full h-2/4 left-0 rounded-lg bg-[#ce81535c]" />
              </span>
              <span className="block text-themeDark font-island-moments text-[3vw] font-bold">
                to Get Your Dream Job
              </span>
            </div>
            <div>
              <span
                className={twMerge(
                  montserratRegular.className,
                  "text-backgroundDecor500 text-[1vw] sm:text-[1vw]"
                )}
              >
                Discover personalized job opportunities with AI-powered
                recommendations. Track your application status in real-time and
                get notified with updates. Conduct interviews directly on the
                platform for a faster, more efficient hiring process.
              </span>
            </div>
            <div className="pb-20 border-b-2 border-blurEffect">
              <Input
                radius="full"
                size="md"
                placeholder="Search..."
                classNames={{ inputWrapper: "bg-[#FFF]" }}
                startContent={
                  <Search className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                }
                endContent={
                  <div className="flex justify-end items-center gap-4 border-s-2 my-2 ps-6 border-themeDark">
                    <MapPin className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                    <div className="text-default-400 whitespace-nowrap">{`All Location`}</div>
                    <Button size="sm" color="warning" radius="full">
                      Search
                    </Button>
                  </div>
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[2.2vw] font-bold text-themeDark">
                235 K+
              </span>
              <span className="text-[1vw] font-normal text-backgroundDecor500">
                available job
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {jobTitle.map((job) => (
                <Chip
                  classNames={{
                    base: `bg-[${job.background}]`,
                    content: "drop-shadow shadow-black font-semibold",
                  }}
                  // variant={job.variant}
                  key={job.title}
                >
                  {job.title}
                </Chip>
              ))}
            </div>
          </div>
        </div>
        <div className="w-3/6 flex justify-center items-center">
          <div className="flex flex-col items-center justify-center h-full w-full gap-10">
            <div className="bg-[#f9c7b0] w-5/6 flex flex-col justify-center items-center p-3 rounded-lg gap-4">
              <div className="w-full flex justify-between px-5 items-center">
                <span className="text-themeDark">Available</span>
                <Switch classNames={{ base: "", thumb: "bg-[#FFF]" }} />
              </div>
              <div className="flex gap-4 flex-row">
                <div className="flex justify-center items-start px-2">
                  <div className="rounded-full bg-themeWhite p-2">
                    <Settings2 color="#000" size={32} />
                  </div>
                </div>
                <div>
                  <div className="text-themeDark font-semibold">
                    Introduction
                  </div>
                  <div className="text-themeDark">
                    Lorem ipsum dolor sit amet consectetur.
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-themeWhite w-5/6 flex flex-col justify-center items-center p-3 rounded-lg gap-4">
              <div className="flex justify-end -mt-8 w-full">
                <Image
                  alt="logo"
                  src={
                    "https://st4.depositphotos.com/7486768/24632/v/380/depositphotos_246321614-stock-illustration-logo-black-tree-roots-leaves.jpg"
                  }
                  objectFit="cover"
                  width={50}
                  height={50}
                  className="rounded-full"
                />
              </div>
              <div className="w-full flex justify-between px-5 items-center">
                <span className="text-themeDark">+25.25%</span>
              </div>
              <span className="block text-themeDark text-4xl font-bold">
                Boost your career journey effortlessly
              </span>
              <div className="w-full">
                <span className="block text-blurEffect text-end w-full">
                  82%
                </span>
                <Slider
                  size="sm"
                  step={0.01}
                  maxValue={1}
                  minValue={0}
                  aria-label="Temperature"
                  defaultValue={0.82}
                  className="w-full"
                />
              </div>
            </div>
            <div className="bg-[#232f31] w-5/6 flex justify-center items-center p-3 rounded-lg gap-4">
              <div className="bg-themeOrange rounded-full p-4">
                <span className="text-themeWhite">9.8</span>
              </div>
              <div>
                <span className="block text-themeWhite text-medium">
                  Candidate-Job Fit
                </span>
                <span className="block text-tableBorder500 text-xs">
                  Based on the AI assessment of your CV
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center h-full w-full gap-10">
            <Image
              alt="logo"
              src={
                "https://i.pinimg.com/564x/6c/52/3f/6c523f234b578cd9a574a2e708deb325.jpg"
              }
              objectFit="cover"
              width={220}
              height={220}
              className="rounded-lg"
            />
            <Image
              alt="logo"
              src={
                "https://i.pinimg.com/enabled_hi/564x/85/d5/d4/85d5d4ca86e36cd83c493b5b50c154c2.jpg"
              }
              objectFit="cover"
              width={220}
              height={220}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
