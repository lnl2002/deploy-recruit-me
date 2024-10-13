import { Chip } from "@nextui-org/react";

const HeaderListJob = ({
  jobQuantity,
}: {
  jobQuantity: number;
}): React.JSX.Element => {
  return (
    <div className="flex justify-center items-center">
      <div className="w-1/3 flex flex-col gap-4 justify-center items-center">
        <Chip variant="bordered">{jobQuantity} Job Listing</Chip>
        <h1 className="font-bold text-3xl text-themeDark">
          Finding your dream jobs
        </h1>
        <span className="text-sm text-textSecondary">
          Find the job that's perfect for you, about 500+ new jobs everyday
        </span>
      </div>
    </div>
  );
};

export default HeaderListJob;
