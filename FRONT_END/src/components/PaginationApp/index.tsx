"use client";
import React, { useState } from "react";
import { cn, Pagination, PaginationItemType } from "@nextui-org/react";
import { Icons } from "@/icons";
import Image from "next/image";

type PaginationAppProps = {
  key?: string,
  value?: PaginationItemType,
  onNext?: () => void,
  onPrevious?: () => void,
  setPage?: (value: number) => void,
  className?: string,
  total?: number,
};

export default function PaginationApp({
  onNext,
  onPrevious,
  setPage,
  total = 1,
}: PaginationAppProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Update to handle next and previous button clicks
  const handleNext = () => {
    if (currentPage < total) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      if (setPage) {
        setPage(newPage);
      }
      if (onNext) {
        onNext();
      }
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      if (setPage) {
        setPage(newPage);
      }
      if (onPrevious) {
        onPrevious();
      }
    }
  };

  const renderItem = ({
    key,
    value,
    className,
  }: PaginationAppProps) => {
    if (value === PaginationItemType.NEXT) {
      return (
        <button
          key={key}
          className={cn(className, "bg-default-200/50 min-w-8 w-8 h-8")}
          onClick={handleNext}
        >
          <Image
            alt="chevrondown"
            className="-rotate-90"
            src={Icons.ChevronDown}
          />
        </button>
      );
    }

    if (value === PaginationItemType.PREV) {
      return (
        <button
          key={key}
          className={cn(className, "bg-default-200/50 min-w-8 w-8 h-8")}
          onClick={handlePrevious}
        >
          <Image
            alt="chevrondown"
            className="rotate-90"
            src={Icons.ChevronDown}
          />
        </button>
      );
    }

    if (value === PaginationItemType.DOTS) {
      return (
        <button key={key} className={className}>
          ...
        </button>
      );
    }

    // Handle page number clicks
    return (
      <button
        key={key}
        className={cn(className, currentPage == value && "text-white bg-textPrimary")}
        onClick={() => {
          setCurrentPage(value ?? 1);
          if (setPage) {
            setPage(value ?? 1);
          }
        }}
      >
        {value}
      </button>
    );
  };

  return (
    <Pagination
      classNames={{
        base: "flex justify-center",
      }}
      disableCursorAnimation
      showControls
      total={total}
      initialPage={1}
      className="gap-2"
      radius="full"
      renderItem={renderItem}
      variant="light"
    />
  );
}
