"use client";
import accountApi, { IAccount } from "@/api/accountApi/accountApi";
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
  Button,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import { ArrowRight, Ban, CircleCheck, Dot } from "lucide-react";
import Link from "next/link";
import React, { useCallback, useMemo, useState } from "react";
import ConfirmModal from "../confirmModal";
import { toast } from "react-toastify";

const columnsRoot = [
  {
    key: "name",
    label: "Name",
  },
  {
    key: "createdAt",
    label: "Create Time",
  },
  {
    key: "email",
    label: "Email",
  },
  {
    key: "role",
    label: "Role",
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
  INACTIVE: "warning",
  SUSPENDED: "danger",
  ACTIVE: "success",
};

type ListJobProps = {
  listAccount: IAccount[];
  totalPage: number;
  filterValue: string;
  handleChangePage: (page: number) => void;
  isLoading: boolean;
  fetchJobs: any;
};

const JobSection: React.FC<ListJobProps> = ({
  listAccount,
  totalPage,
  filterValue,
  handleChangePage,
  isLoading,
  fetchJobs,
}): React.JSX.Element => {
  const disclosure = useDisclosure();
  const [updateData, setUpdateData] = useState({
    accountId: "",
    status: "",
    title: "",
    description: ""
  });
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
        const words = statusValue?.split("-");

        // Chuyển mỗi từ thành chữ cái đầu viết hoa
        const formattedString = words
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        return formattedString;
      };

      const chipColor = statusColorMap[cellValue] || "warning";

      switch (columnKey) {
        case "name":
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
        case "email":
          return (
            <div className="flex flex-col">
              <Chip
                classNames={{
                  content: "flex gap-1 items-center",
                  base: "py-5",
                }}
              >
                <Avatar src={item.image} alt={item.name} size="sm" />
                <div>{item.email}</div>
              </Chip>
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
        case "role":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">
                {cellValue?.roleName}
              </p>
            </div>
          );
        case "status":
          return (
            <div className="flex flex-col">
              <Chip startContent={<Dot />} variant="flat" color={chipColor}>
                {cellValue || "INACTIVE"}
              </Chip>
            </div>
          );
        case "action":
          return (
            <div className="relative group inline-block">
              {!item.status ||
              item.status === "INACTIVE" ||
              item.status === "ACTIVE" ? (
                <Tooltip
                  content="Suspend Account"
                  className="bg-[#333333] text-themeWhite"
                >
                  <button
                    className="p-2 rounded-full bg-[#FF5A5F] text-themeWhite hover:opacity-90 focus:outline-none"
                    onClick={() => clickSuspended(item._id, "SUSPENDED")}
                  >
                    <Ban className="w-5 h-5" />
                  </button>
                </Tooltip>
              ) : (
                <Tooltip
                  content="Active Account"
                  className="bg-[#333333] text-themeWhite"
                >
                  <button
                    className="p-2 rounded-full bg-[#28A745] text-themeWhite hover:opacity-90 focus:outline-none"
                    onClick={() => clickSuspended(item._id, "ACTIVE")}
                  >
                    <CircleCheck className="w-5 h-5"/>
                  </button>
                </Tooltip>
              )}
            </div>
          );
        default:
          return cellValue.toString();
      }
    },
    [listAccount, filterValue]
  );

  const handleUpdateStatus = async () => {
    const data = await accountApi.updateStatus({
      accountId: updateData.accountId,
      status: updateData.status,
    });

    if (!data) {
      toast.error("Something went wrong please try again");
      return;
    }

    toast.success("Updated successfully");
    fetchJobs();
    disclosure.onClose()
  };

  const clickSuspended = (accountId: string, status: string) => {
    let title = "";
    let description = "";
    switch (status) {
      case "SUSPENDED":
        title = "Confirm Suspension"
        description = "Are you sure you want to suspend this account? The user will lose access to their account and its features."
        break;
      case "ACTIVE":
        title = "Activate Account"
        description = "Are you sure you want to activate this account? The user will regain full access to their account and its features."
        break;
      default:
        break;
    }
    setUpdateData({
      accountId,
      status,
      title,
      description
    });
    disclosure.onOpen();
  };

  return (
    <>
      <Table
        aria-label="Example table with dynamic content"
        classNames={{ td: "text-themeDark" }}
        bottomContent={
          totalPage > 1 && (
            <div className="flex-1 flex flex-row justify-center mt-4">
              <Pagination
                radius={"full"}
                color="warning"
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
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={listAccount}
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
      <ConfirmModal
        isOpen={disclosure.isOpen}
        onOpenChange={disclosure.onOpenChange}
        onConfirm={handleUpdateStatus}
        title={updateData.title || ''}
        description={updateData.description || ''}
      />
    </>
  );
};

export default JobSection;
