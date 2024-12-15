"use client";
import { QApply } from "@/api/applyApi";
import {
  Button,
  Pagination,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { Dot } from "lucide-react";
import React, { useEffect, useState } from "react";
import Empty from "../recruiter/jobDetails/components/ApplicationList/components/empty";
import { useRouter } from "next/navigation";
import systemApi, { INoti } from "@/api/systemApi";
import Image from "next/image";
import { Images } from "@/images";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export const NotificationPage = (): React.JSX.Element => {
  const route = useRouter();
  const [notis, setNotis] = useState<INoti[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState<number>();
  const [query, setQuery] = useState({
    seen: "all",
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    fetchNoti(); // Call the function to load the applies
  }, []);

  const fetchNoti = async () => {
    const data = (await systemApi.getUserNotifications(query.seen, query.page, query.limit)) as any;
    setNotis(data.notifications);
    setTotalPages(data.totalPages);
  };

  useEffect(() => {
    fetchNoti();
  }, [query]);

  const handleNotiClick = async (noti: INoti) => {
    await systemApi.markAsSeen(noti._id);
    route.push(noti.url);
    fetchNoti();
  };

  return (
    <div className="flex flex-col justify-center items-center  mt-10">
      <div className="w-9/12 flex flex-col items-center mb-4">
        <div className="flex flex-row w-full justify-between mb-5">
          <div>
            <p className="text-themeDark font-bold text-4xl">
              My Notifications
            </p>
          </div>
          <div className="flex gap-2 text-themeDark">
            <Select
              isRequired
              defaultSelectedKeys={["all"]}
              className="min-w-[150px]"
              onChange={(e) => {
                setQuery({
                  ...query,
                  seen: e.target.value != "all" ? e.target.value : "all",
                });
              }}
            >
              <SelectItem key={"all"} className="text-themeDark">
                All
              </SelectItem>
              <SelectItem key={"false"} className="text-themeDark">
                Un seen
              </SelectItem>
              <SelectItem key={"true"} className="text-themeDark">
                Seen
              </SelectItem>
            </Select>
          </div>
        </div>

        {notis && notis.length > 0 ? (
          notis.map((n, index) => (
            <button
              key={index}
              onClick={() => handleNotiClick(n)}
              className={twMerge(
                "gap-2 p-3 my-1 rounded-lg border-1 w-full",
                n.seen ? "bg-blurEffectGold" : "bg-tableBorder500"
              )}
            >
              <div>
                <div className="flex gap-2 items-center">
                  <Image
                    src={Images.Logo}
                    alt="RecruitMe Logo"
                    className="h-10"
                  />
                  <div className="flex flex-col items-start">
                    <p
                      className={twMerge(
                        "text-md text-themeWhite",
                        n.seen ? "font-medium" : "font-semibold"
                      )}
                    >
                      {n.content}
                    </p>
                    <p className="text-textSecondary italic">
                      {format(new Date(n.createdAt), "dd MMMM yyyy HH:mm")}
                    </p>
                  </div>
                  {!n.seen && <Dot className="text-textIconBrand" size={20} />}
                </div>
              </div>
            </button>
          ))
        ) : (
          <></>
        )}
        <Pagination
          isCompact
          showControls
          showShadow
          color="warning"
          page={query.page}
          total={totalPages ?? 1}
          onChange={(page) =>
            setQuery({
              ...query,
              page,
            })
          }
        />
      </div>
    </div>
  );
};
