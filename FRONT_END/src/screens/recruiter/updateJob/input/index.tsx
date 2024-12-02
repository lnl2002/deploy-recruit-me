import { Input } from "@nextui-org/react";
import React from "react"; // Assuming you're using react-feather or similar icons

interface IInputComponentProps {
  type: string;
  isRequired?: boolean;
  min?: number;
  label?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isInvalid?: boolean;
  errorMessage?: string;
  labelPlacement?: "inside" | "outside";
  disabled?: boolean;
  endContent?: React.ReactNode;
  className?: string;
}

function InputComponent({
  type,
  isRequired = false,
  min = 0,
  label,
  name,
  placeholder,
  value = "",
  onChange,
  isInvalid,
  errorMessage,
  labelPlacement = "outside",
  disabled = false,
  endContent,
  className = "",
}: IInputComponentProps) {
  return (
    <Input
      type={type}
      isRequired={isRequired}
      min={min}
      label={label}
      name={name}
      labelPlacement={labelPlacement}
      placeholder={placeholder}
      value={value.toString()}
      onChange={onChange}
      isInvalid={isInvalid}
      errorMessage={errorMessage}
      disabled={disabled}
      endContent={endContent}
      className={className}
    />
  );
}

export default InputComponent;
