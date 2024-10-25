import { Textarea } from "@nextui-org/react";
import React, { ChangeEvent } from "react";

interface ITextareaComponentProps {
  isRequired?: boolean;
  label: string;
  name: string;
  labelPlacement?: "inside" | "outside";
  placeholder: string;
  maxRows?: number;
  value?: string;
  className?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void; // Adjusted type
  endContent?: React.ReactNode;
  isInvalid: boolean;
  errorMessage?: string;
}

const TextareaComponent: React.FC<ITextareaComponentProps> = ({
  isRequired = true,
  label,
  name,
  labelPlacement = "outside",
  placeholder,
  maxRows = 1,
  value = "",
  onChange,
  endContent,
  isInvalid,
  errorMessage,
  className,
}) => {
  return (
    <Textarea
      isRequired={isRequired}
      label={label}
      name={name}
      labelPlacement={labelPlacement}
      placeholder={placeholder}
      maxRows={maxRows}
      value={value}
      className={className}
      onChange={onChange} // Correct event type for textarea
      endContent={endContent}
      isInvalid={isInvalid}
      errorMessage={errorMessage}
    />
  );
};

export default TextareaComponent;
