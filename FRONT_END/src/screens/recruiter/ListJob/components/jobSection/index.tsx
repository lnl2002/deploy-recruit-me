import { TJob } from "@/api/jobApi";
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
    label: "action",
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
};

type ListJobProps = {
  listJob: TJob[];
  totalPage: number;
  statusJobFilterIndex: number;
  handleChangePage: (page: number) => void;
};

const JobSection: React.FC<ListJobProps> = ({
  listJob,
  totalPage,
  statusJobFilterIndex,
  handleChangePage,
}): React.JSX.Element => {
  const columns = useMemo(() => {
    const updatedColumns = [...columnsRoot];

    let newColumn = null;

    if (statusJobFilterIndex === 3) {
      newColumn = {
        key: "applies",
        label: "Applicants",
      };
    } else if (statusJobFilterIndex === 4) {
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
  }, [statusJobFilterIndex]);

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
              <p className="text-bold text-small capitalize">
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
              <Chip
                startContent={<Dot />}
                classNames={{ content: "font-bold text-sm" }}
                variant="flat"
                color={chipColor}
              >
                {statusFormat(
                  cellValue == "approved" ? "published" : cellValue
                )}
              </Chip>
            </div>
          );
        case "applies":
          return (
            <div className="flex flex-col">
              {statusJobFilterIndex === 4 ? (
                <AvatarGroup isBordered>
                  {cellValue?.map((apply: any) => (
                    <Avatar
                      key={apply._id}
                      size="md"
                      src={apply.account?.image}
                    />
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
              href={`/recruiter/job-details?id=${item._id}`}
              className="relative flex justify-start items-center gap-2"
            >
              <ArrowRight size={16} />
            </Link>
          );
        default:
          return cellValue;
      }
    },
    [listJob, statusJobFilterIndex]
  );

  return (
    <Table
      aria-label="Example table with dynamic content"
      classNames={{ td: "text-themeDark" }}
      bottomContent={
        totalPage > 1 && (
          <div className="flex-1 flex flex-row justify-center mt-4">
            <Pagination
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
      <TableBody items={listJob} emptyContent={"No Jobs found"}>
        {(item) => (
          <TableRow key={item._id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default JobSection;
