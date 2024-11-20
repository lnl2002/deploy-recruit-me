import { Images } from "@/images";
import formatSalary from "@/utils/formatSalary";
import { Chip } from "@nextui-org/react";
import { Clock4, Coins, MapPin } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

type JobProps = {
  id: string;
  title: string;
  location: string;
  unit: string;
  minSalary: number;
  maxSalary: number;
  expiredDate: string;
  type: string;
  handleNavigate: (id: string) => void;
};

const Job: React.FC<JobProps> = ({
  id,
  title,
  location,
  unit,
  minSalary,
  maxSalary,
  expiredDate,
  type,
  handleNavigate,
}): React.JSX.Element => {
  const [dueDate, setDueDate] = useState<number>(0);
  const [rankSalary, setRankSalary] = useState<string>("Negotiable");

  useEffect(() => {
    const calculateDaysDifference = () => {
      const targetDate = new Date(expiredDate);
      const currentDate = new Date();
      const timeDifference = targetDate.getTime() - currentDate.getTime();
      const differenceInDays = Math.ceil(
        timeDifference / (1000 * 60 * 60 * 24)
      );
      setDueDate(differenceInDays);
    };

    calculateDaysDifference();
    const intervalId = setInterval(
      calculateDaysDifference,
      1000 * 60 * 60 * 24
    );

    return () => clearInterval(intervalId);
  }, [expiredDate]);

  useEffect(() => {
    if (minSalary === 0 && maxSalary === 0) {
      setRankSalary("Negotiable");
    } else if (minSalary === maxSalary) {
      setRankSalary(formatSalary(maxSalary));
    } else
      setRankSalary(formatSalary(minSalary) + " - " + formatSalary(maxSalary));
  }, [minSalary, maxSalary]);

  return (
    <div
      onClick={() => handleNavigate(id)}
      className="flex flex-col p-4 rounded-xl border gap-4 shadow-md hover:scale-105 cursor-pointer"
    >
      <div className="flex justify-between">
        <div className="flex gap-3">
          <Image
            src={Images.FPT_University}
            height={42}
            width={102}
            alt="Company Image"
            objectFit="cover"
          />
          <div className="flex flex-col gap-2">
            <h1 className="text-themeDark font-bold text-lg">{title}</h1>
            <span className="text-sm text-textSecondary">{unit}</span>
          </div>
        </div>
        {/* <Heart /> */}
      </div>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-3">
          <Chip className="bg-[#CCE2E5] text-blurEffect">
            <div className="flex flex-row items-center gap-2">
              <MapPin size={16} />
              <span className="font-bold">{location}</span>
            </div>
          </Chip>
          <Chip className="bg-[#FCEAE1] text-blurEffect">
            <div className="flex flex-row items-center gap-2">
              <Clock4 size={16} />
              <span className="font-bold">
                {type?.split("")[0].toUpperCase() + type?.slice(1)}
              </span>
            </div>
          </Chip>
          <Chip variant="bordered" className="text-blurEffect">
            <div className="flex flex-row items-center gap-2">
              <Coins size={16} />
              <span className="font-bold">{rankSalary}</span>
            </div>
          </Chip>
        </div>
        <div className="text-themeDark flex gap-1 text-sm">
          <span className="text-themeOrange">{dueDate}</span>
          <span>days left to apply</span>
        </div>
      </div>
    </div>
  );
};

export default Job;
