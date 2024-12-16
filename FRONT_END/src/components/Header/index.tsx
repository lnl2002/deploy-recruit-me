"use client";
import { Icons } from "@/icons";
import Image from "next/image";
import Link from "next/link";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { Bell, ChevronDown, Dot, LogOut, Menu, MenuIcon } from "lucide-react";
import { Images } from "@/images";
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { logout } from "@/store/userState";

import { setStatusJobFilterIndex } from "@/store/jobState";
import {
  adminNavLink,
  hrNavLinks,
  interviewerNavLink,
  interviewManagerNavLink,
  navLinks,
  Role,
} from "@/utils/constants";
import systemApi, { INoti } from "@/api/systemApi";
import { format } from "date-fns";

const getNavLink = (role: string) => {
  switch (role) {
    case Role.common:
      return navLinks;
    case Role.candidate:
      return navLinks;
    case Role.interviewer:
      return interviewerNavLink;
    case Role.interviewManager:
      return interviewManagerNavLink;
    case Role.recruiter:
      return hrNavLinks;
    case Role.admin:
      return adminNavLink;
    default:
      return navLinks;
  }
};

export const Header = ({ role }: { role?: string }): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path: string) => path === pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notis, setNotis] = useState<INoti[]>([]);

  const { userInfo, isLoggedIn } = useAppSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logout()); // Dispatch để đăng xuất người dùng
    window.location.href = "/login";
  };

  //fetch noti each 30s
  useEffect(() => {
    fetchNoti();
    const intervalId = setInterval(() => {
      fetchNoti();
    }, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchNoti = async () => {
    const data = (await systemApi.getUserNotifications("all", 1, 5)) as any;
    setNotis(data.notifications);
  };

  const handleNotiClick = async (noti: INoti) => {
    await systemApi.markAsSeen(noti._id);
    router.push(noti.url);
    fetchNoti();
  };

  const renderNotis = () => {
    return (
      notis &&
      notis.length > 0 &&
      notis.map((n, index) => (
        <DropdownItem
          key={index}
          onClick={() => handleNotiClick(n)}
          className={twMerge(
            "gap-2 py-3 my-1",
            n.seen ? "bg-surfaceTertiary" : "bg-themeWhite"
          )}
        >
          <div>
            <div className="flex gap-2 items-center">
              <Image src={Images.Logo} alt="RecruitMe Logo" className="h-10" />
              <div className="flex flex-col">
                <p
                  className={twMerge(
                    "text-md",
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
        </DropdownItem>
      ))
    );
  };

  return (
    <div className="relative z-10 justify-center grid grid-cols-2 h-16 bg-[transparent] items-center sm:flex sm:justify-between">
      <div className="flex flex-1 items-center sm:justify-around bg-[#0000]">
        <Link href={"/"} className="flex gap-3">
          <button
            className="sm:hidden ml-3 text-themeDark"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <MenuIcon />
          </button>
          <div className="w-full flex flex-row gap-3 items-center">
            <Image src={Images.Logo} className="rounded-xl" alt="logo" />
            <span className="text-2xl text-themeOrange font-bold">
              RecruitMe
            </span>
          </div>
        </Link>
        <div className="hidden sm:flex items-center">
          {getNavLink(role ?? Role.common)?.map((item, index: number) =>
            !item.expandable && item?.expand.length === 0 ? (
              <HeaderLink
                key={index + item.id}
                title={item.name}
                isCurrent={isActive(item.path)}
                href={item.path}
                // expandable={item.expandable}
                isLoggedIn={isLoggedIn || false}
                loginRequired={item.loginRequired}
              />
            ) : (
              <HeaderDropDown
                key={index + item.id}
                title={item.name}
                isCurrent={isActive(item.path)}
                expand={item?.expand}
                handleSelected={(value) =>
                  dispatch(setStatusJobFilterIndex(value))
                }
              />
            )
          )}
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex flex-row items-center gap-5">
              <Dropdown placement="bottom-end">
                <DropdownTrigger className="border-none">
                  <button className="flex flex-row items-center gap-5 rounded-full border-none py-5 px-1">
                    <Badge
                      color="danger"
                      content={
                        notis && notis.length > 0
                          ? notis.filter((n) => !n.seen).length
                          : 0
                      }
                      shape="circle"
                    >
                      <Bell
                        className="fill-current text-textPrimary"
                        size={20}
                      />
                    </Badge>
                  </button>
                </DropdownTrigger>
                <DropdownMenu
                  className="text-themeDark"
                  aria-label="Profile Actions"
                  variant="flat"
                >
                  {renderNotis()}
                  <DropdownItem onClick={() => router.push("/notifications")}>
                    <p className="text-textIconBrand">{">> See all"}</p>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Button
                    variant="bordered"
                    className="flex flex-row items-center gap-5 rounded-full py-5 px-1"
                  >
                    <Avatar
                      isBordered
                      as="button"
                      className="transition-transform"
                      color="secondary"
                      name={userInfo?.displayName || ""}
                      size="sm"
                      src={userInfo?.image || ""}
                    />
                    <p className="text-textPrimary font-semibold max-w-36 overflow-clip whitespace-nowrap text-ellipsis">
                      {userInfo?.displayName}
                    </p>
                    <ChevronDown color="black" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  className="text-themeDark"
                  aria-label="Profile Actions"
                  variant="flat"
                >
                  <DropdownItem key="profile" className="h-10 gap-2">
                    <p className="font-semibold">
                      {userInfo?.displayName || ""}
                    </p>
                  </DropdownItem>
                  <DropdownItem>
                    <div>
                      <p className="text-textPrimary italic">
                        {userInfo?.email}
                      </p>
                      <p className="text-textPrimary">Account role: </p>
                      <p className="text-themeOrange">{userInfo?.role}</p>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    color="danger"
                    onClick={() => handleLogout()}
                  >
                    <div className="flex flex-row items-center gap-2">
                      <p className="text-themeOrange">Log Out</p>
                      <LogOut size={20} className="text-themeOrange" />
                    </div>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                className="border-1 border-themeOrange bg-opacity-0 text-themeOrange"
                onClick={() => router.push("/login")}
              >
                Login
              </Button>
              <Button
                className="bg-themeOrange text-[#fff]"
                onClick={() => router.push("/login")}
              >
                Register
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* <div className="flex items-center">
        <SearchBox
          className="w-96"
          onSubmit={(keys) => router.push(`/products?name=${keys}`)}
        />
     
      </div>  */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg z-50 sm:hidden bg-anitiqueWhite text-textPrimary ">
          <div className="flex flex-col items-center">
            {navLinks.map((item, index: number) => (
              <HeaderLink
                key={index}
                title={item.name}
                isCurrent={isActive(item.path)}
                href={item.path}
                expandable={item.expandable}
                isMobileMenuOpen={isMobileMenuOpen}
                loginRequired={item.loginRequired}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const HeaderLink = ({
  href,
  title,
  isCurrent,
  expandable = false,
  isMobileMenuOpen = false,
  isLoggedIn = false,
  loginRequired = false,
}: {
  href: string;
  title: string;
  isCurrent?: boolean;
  expandable?: boolean;
  isMobileMenuOpen?: boolean;
  isLoggedIn: boolean;
  loginRequired: boolean;
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return (
    <div className="relative flex items-center">
      {loginRequired && !isLoggedIn ? (
        <></>
      ) : (
        <Link
          className={twMerge(
            "m-5 text-textSecondary flex gap-3 items-center text-sm",
            isCurrent
              ? "border px-3 py-1 rounded-full border-themeOrange text-themeOrange"
              : "text-blurEffect"
          )}
          href={href}
        >
          <p className="font-bold">{title}</p>
          {expandable && !isMobileMenuOpen && (
            <Image alt="chevron down" src={Icons.ChevronDown} />
          )}
        </Link>
      )}
    </div>
  );
};

const HeaderDropDown = ({
  title,
  isCurrent,
  expandable = false,
  isMobileMenuOpen = false,
  isLoggedIn = false,
  loginRequired = false,
  expand = [],
  handleSelected,
}: {
  title?: string;
  isCurrent?: boolean;
  expandable?: boolean;
  isMobileMenuOpen?: boolean;
  isLoggedIn?: boolean;
  loginRequired?: boolean;
  expand?: Array<any>;
  handleSelected?: (value: number) => void;
}) => {
  const [selectedKeys, setSelectedKeys] = useState<Set<number>>(new Set([0]));
  const handleSelectionChange = (keys: any) => {
    handleSelected?.(Number(Object.values(keys)[0]) ?? 0);
    setSelectedKeys(keys as Set<number>);
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          size="sm"
          variant="bordered"
          className={twMerge(
            "m-5 text-textSecondary flex gap-3 items-center text-sm font-bold ",
            isCurrent
              ? "border px-3 py-1 rounded-full border-themeOrange text-themeOrange"
              : "text-blurEffect border-none"
          )}
        >
          {title}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Multiple selection example"
        variant="flat"
        disallowEmptySelection
        selectionMode="single"
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
      >
        {expand.map((item) => (
          <DropdownItem key={item.id}>
            <Link className={twMerge("text-blurEffect")} href={item?.path}>
              {item.name}
            </Link>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};
