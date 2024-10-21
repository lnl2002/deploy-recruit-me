import { Button } from "@nextui-org/react";
import { twMerge } from "tailwind-merge";

export const ButtonApp = ({
  title,
  className,
  type,
  onClick,
}: {
  title: string;
  className?: string;
  type?: "button" | "submit" | "reset" | undefined;
  onClick?: () => void;
}) => {
  return (
    <Button
      type={type}
      className={twMerge("bg-surfaceBrand rounded-full", className)}
      onClick={onClick}
    >
      <p className={twMerge("text-sm mx-5 my-3")}>{title}</p>
    </Button>
  );
};
