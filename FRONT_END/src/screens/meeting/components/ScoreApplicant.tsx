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
      {Array.from({ length: 11 }).map((_, index) => (
        <SelectItem
          textValue={`${index} - point`}
          className="text-themeDark"
          key={index}
        >
          {index} - point
        </SelectItem>
      ))}
    </Select>
  );
};

export default ScoreApplicant;
