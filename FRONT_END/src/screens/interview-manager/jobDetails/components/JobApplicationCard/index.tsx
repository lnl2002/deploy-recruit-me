import formatSalary from "@/utils/formatSalary";
import {
  AlarmClock,
  Clock4,
  LayoutGrid,
  MapPin,
  Waypoints,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type JobApplicationCardProps = {
  minSalary: number;
  maxSalary: number;
  address: string;
  expiredDate: string;
  numberPerson: number;
  career: string;
  type: string;
};

const JobApplicationCard: React.FC<JobApplicationCardProps> = ({
  minSalary,
  maxSalary,
  address,
  expiredDate,
  numberPerson,
  career,
  type,
}): React.JSX.Element => {
  const router = useRouter()
  const [rankSalary, setRankSalary] = useState<string>("Negotiable");

  useEffect(() => {
    if (minSalary === 0 && maxSalary === 0) {
      setRankSalary("Negotiable");
    } else if (minSalary === maxSalary) {
      setRankSalary(formatSalary(maxSalary));
    } else
      setRankSalary(formatSalary(minSalary) + " - " + formatSalary(maxSalary));
  }, [minSalary, maxSalary]);

  return (
    <div className="">
      <div className="flex items-start gap-4 mb-4">
        <div>
          <MapPin size={22} color="#000" />
        </div>
        <p className="text-themeDark text-sm font-bold">{address}</p>
      </div>

      {/* <p className="text-backgroundDecor500 text-sm mb-6">
        Please send us your detailed CV to apply for this job post.
      </p> */}

      <p className="text-themeDark text-xl font-bold mb-1">{rankSalary}</p>
      <p className="text-backgroundDecor500 text-xs mb-6">Avg. salary</p>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-[#F6F5F9]">
            <Clock4 size={18} color="#000" />
          </div>
          <div>
            <p className="text-sm text-themeDark font-bold">
              {type[0].toUpperCase() + type.slice(1)}
            </p>
            <p className="text-xs text-backgroundDecor500">Job type</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-[#F6F5F9]">
            <LayoutGrid size={18} color="#000" />
          </div>
          <div>
            <p className="text-sm text-themeDark font-bold">{career}</p>
            <p className="text-xs text-backgroundDecor500">Occupation</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-[#F6F5F9]">
            <Waypoints size={18} color="#000" />
          </div>
          <div>
            <p className="text-sm text-themeDark font-bold">
              {numberPerson} people
            </p>
            <p className="text-xs text-backgroundDecor500">Quantity</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-[#F6F5F9]">
            <AlarmClock size={18} color="#000" />
          </div>
          <div>
            <p className="text-sm text-themeDark font-bold">
              {new Date(expiredDate).toLocaleDateString().split("T")}
            </p>
            <p className="text-xs text-backgroundDecor500">Expiry date</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationCard;
