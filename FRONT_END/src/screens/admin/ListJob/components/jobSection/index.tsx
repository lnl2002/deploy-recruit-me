import { TJob } from "@/api/jobApi";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  User,
  AvatarGroup,
  Avatar,
  Pagination,
} from "@nextui-org/react";
import { ArrowRight, Dot } from "lucide-react";
import Link from "next/link";
import React, { useCallback, useMemo } from "react";

const columnsRoot = [
  {
    key: "title",
    label: "Job Name",
  },
  {
    key: "createdAt",
    label: "Post Time",
  },
  {
    key: "startDate",
    label: "Start Date",
  },
  {
    key: "expiredDate",
    label: "Expired Date",
  },
  {
    key: "unit",
    label: "Unit",
  },
  {
    key: "status",
    label: "State",
  },
  {
    key: "action",
    label: "Action",
  },
];

const statusColorMap: {
  [key: string]:
    | "success"
    | "danger"
    | "warning"
    | "secondary"
    | "default"
    | "primary"
    | undefined;
} = {
  reopened: "secondary",
  published: "primary",
  rejected: "warning",
  expired: "danger",
  pending: "default",
  approved: "success",
  completed: "success",
};

type ListJobProps = {
  listJob: TJob[];
  totalPage: number;
  filterValue: string;
  handleChangePage: (page: number) => void;
  isLoading: boolean;
};

const JobSection: React.FC<ListJobProps> = ({
  listJob,
  totalPage,
  filterValue,
  handleChangePage,
  isLoading,
}): React.JSX.Element => {
  const columns = useMemo(() => {
    const updatedColumns = [...columnsRoot];

    let newColumn = null;

    if (filterValue === "reopened,approved,published") {
      newColumn = {
        key: "applies",
        label: "Applicants",
      };
    } else if (filterValue === "expired") {
      newColumn = {
        key: "applies",
        label: "Candidates",
      };
    }

    if (newColumn) {
      const actionIndex = updatedColumns.findIndex(
        (col) => col.key === "action"
      );

      if (actionIndex !== -1) {
        updatedColumns.splice(actionIndex, 0, newColumn);
      }
    }

    return updatedColumns;
  }, [filterValue]);

  const renderCell = useCallback(
    (item: any, columnKey: any) => {
      const cellValue = item[columnKey];

      const dateFormat = (dateValue: string): string => {
        const date = new Date(dateValue);

        const formattedDate = date.toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        return formattedDate;
      };

      const statusFormat = (statusValue: string): string => {
        const words = statusValue.split("-");

        // Chuyển mỗi từ thành chữ cái đầu viết hoa
        const formattedString = words
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        return formattedString;
      };

      const chipColor = statusColorMap[cellValue] || "default";

      switch (columnKey) {
        case "title":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">{cellValue}</p>
            </div>
          );
        case "createdAt":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitaliz">
                {dateFormat(cellValue)}
              </p>
            </div>
          );
        case "startDate":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">
                {dateFormat(cellValue)}
              </p>
            </div>
          );
        case "expiredDate":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">
                {dateFormat(cellValue)}
              </p>
            </div>
          );
        case "unit":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">
                {cellValue?.name}
              </p>
            </div>
          );
        case "status":
          return (
            <div className="flex flex-col">
              <Chip startContent={<Dot />} variant="flat" color={chipColor}>
                {statusFormat(cellValue)}
              </Chip>
            </div>
          );
        case "applies":
          return (
            <div className="flex flex-col">
              {filterValue === "expired" ? (
                <AvatarGroup isBordered>
                  {cellValue?.map((apply: any) => (
                    <Avatar size="md" src={apply.account?.image} />
                  ))}
                </AvatarGroup>
              ) : (
                <p
                  className={`text-bold text-small capitalize ${
                    cellValue?.length === 0 ? "text-backgroundDecor500" : ""
                  }`}
                >
                  {cellValue?.length}
                </p>
              )}
            </div>
          );
        case "action":
          return (
            <Link
              href={`/admin/job-details?id=${item._id}`}
              className="relative flex justify-start items-center gap-2"
            >
              <ArrowRight size={16} />
            </Link>
          );
        default:
          return cellValue;
      }
    },
    [listJob, filterValue]
  );

  return (
    <Table
      aria-label="Example table with dynamic content"
      classNames={{ td: "text-themeDark" }}
      bottomContent={
        totalPage > 1 && (
          <div className="flex-1 flex flex-row justify-center mt-4">
            <Pagination
              color="warning"
              radius={"full"}
              onChange={handleChangePage}
              loop
              showControls
              total={totalPage}
              initialPage={1}
            />
          </div>
        )
      }
    >
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody
        items={listJob}
        emptyContent={"No Jobs found"}
        isLoading={isLoading}
        loadingContent={
          <div className="text-themeOrange flex gap-3">
            <LoadingSpinner />
            Loading...
          </div>
        }
      >
        {(item) => (
          <TableRow key={item._id}>
            {(columnKey) => (
              <TableCell key={item._id}>
                {renderCell(item, columnKey)}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default JobSection;
