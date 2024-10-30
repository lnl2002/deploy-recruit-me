"use client";
import { Icons } from "@/icons";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { Menu, MenuIcon } from "lucide-react";
import { SearchBox } from "../SearchBox";
import { Images } from "@/images";
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { logout } from "@/store/userState";
import { hrNavLinks, navLinks, Role } from "@/utils/constants";

const getNavLink = (role: Role) => {
  switch (role) {
    case Role.Common:
      return navLinks;
    case Role.Recruiter:
      return hrNavLinks;
  }
};

export const Header = ({ role }: { role?: Role }): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path: string) => path === pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { userInfo, isLoggedIn } = useAppSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logout()); // Dispatch để đăng xuất người dùng
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
        <div className="hidden sm:flex">
          {getNavLink(role ?? Role.Common).map((item, index: number) => (
            <HeaderLink
              key={index}
              title={item.name}
              isCurrent={isActive(item.path)}
              href={item.path}
              expandable={item.expandable}
              isLoggedIn={isLoggedIn || false}
              loginRequired={item.loginRequired}
            />
          ))}
        </div>
        {/*<div>
          <HeaderLink
            title={"Login"}
            isCurrent={false}
            href={"/login"}
            expandable={false}
          /> 
        </div>*/}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  color="secondary"
                  name={userInfo?.displayName || ""}
                  size="sm"
                  src={userInfo?.image || ""}
                />
              </DropdownTrigger>
              <DropdownMenu
                className="text-themeDark"
                aria-label="Profile Actions"
                variant="flat"
              >
                <DropdownItem key="profile" className="h-10 gap-2">
                  <p className="font-semibold">{userInfo?.displayName || ""}</p>
                </DropdownItem>
                <DropdownItem key="settings">My Settings</DropdownItem>
                <DropdownItem key="team_settings">Team Settings</DropdownItem>
                <DropdownItem key="analytics">Analytics</DropdownItem>
                <DropdownItem key="system">System</DropdownItem>
                <DropdownItem key="configurations">Configurations</DropdownItem>
                <DropdownItem key="help_and_feedback">
                  Help & Feedback
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  onClick={() => handleLogout()}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
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
                onClick={() => router.push("/register")}
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
            "m-5 text-textSecondary flex items-center text-sm",
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
