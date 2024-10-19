import { Images } from "@/images";
import { Chip } from "@nextui-org/react";
import { Sparkle } from "lucide-react";
import Image from "next/image";

const IntroductionThree = (): React.JSX.Element => {
  const infomationAboutUs = [
    {
      icon: Sparkle,
      title: "Among Asia's Best Workplaces",
      subtitle:
        "Recognized by HR Asia as one of the top 130 companies in Asia in 2018.",
    },
    {
      icon: Sparkle,
      title: "Educational Support for Family Members",
      subtitle: "Preferential tuition at FPT Education for your family.",
    },
    {
      icon: Sparkle,
      title: "Special Bonuses and Allowances",
      subtitle: "Annual bonuses and participation in company events.",
    },
  ];
  return (
    <div className="mx-36 my-3">
      <div className="grid grid-cols-2">
        <div className="flex flex-col mx-16 gap-3">
          <Chip variant="bordered">02 Abour Us</Chip>
          <p className="mt-2 text-2xl text-themeDark font-bold">
            A Premier Workplace with Comprehensive Benefits
          </p>
          <span className="text-sm text-blurEffect">
            Committed to providing the best working environment and
            comprehensive benefits for our employees, ensuring personal growth
            and professional development.
          </span>
          <div className="flex flex-col gap-3 mt-3">
            {infomationAboutUs.map((infomation, index) => (
              <div
                className="flex flex-row gap-4 items-start"
                key={infomation.title + index + "key"}
              >
                <div>
                  <infomation.icon
                    size={30}
                    className="p-1.5 bg-blurEffectGold rounded-full"
                    color="#f08900"
                  />
                </div>
                <div className="flex gap-1 flex-col">
                  <p className="font-bold text-themeDark">{infomation.title}</p>
                  <span className="text-sm text-blurEffect">
                    {infomation.subtitle}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mx-16">
          <Image alt="NextUI hero Image" src={Images.InterviewOne} />
        </div>
      </div>
    </div>
  );
};

export default IntroductionThree;
