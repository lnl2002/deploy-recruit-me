import { Select, SelectItem } from "@nextui-org/react";
import React from "react";

type ScoreApplicantProps = {
  setScoreSelected: (value: number) => void;
  scoreSelected: number;
};
const ScoreApplicant: React.FC<ScoreApplicantProps> = ({
  scoreSelected,
  setScoreSelected,
}) => {
  console.log(typeof scoreSelected);

  return (
    <Select
      label="Select score for candidate"
      className="w-full"
      size="sm"
      selectedKeys={[String(scoreSelected)]}
      onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
        setScoreSelected(Number(event.target.value));
      }}
    >
      {Array.from({ length: 10 }).map((_, index) => (
        <SelectItem
          textValue={`Score - ${index + 1}`}
          className="text-themeDark"
          key={index + 1}
        >
          Score - {index + 1}
        </SelectItem>
      ))}
    </Select>
  );
};

export default ScoreApplicant;
