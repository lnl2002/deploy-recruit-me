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
  isInvalid?: boolean;
  errorMessage?: string;
  isDisabled?: boolean;
  classNames?: any;
}

const TextareaComponent: React.FC<ITextareaComponentProps> = ({
  isRequired = true,
  label,
  name,
  labelPlacement = "outside",
  placeholder,
  maxRows,
  value = "",
  onChange,
  endContent,
  isInvalid,
  errorMessage,
  className,
  isDisabled,
  classNames,
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
      disabled={isDisabled}
      classNames={classNames}
    />
  );
};

export default TextareaComponent;
