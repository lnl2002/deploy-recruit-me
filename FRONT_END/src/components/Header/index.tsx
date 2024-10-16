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
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";

const navLinks = [
  { id: 1, name: "Home", path: "/", expandable: false },
  { id: 2, name: "My Application", path: "/contact-us", expandable: false },
  { id: 3, name: "About Us", path: "/about-us", expandable: false },
];

export const Header = (): React.JSX.Element => {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (path: string) => path === pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative z-10 justify-center grid grid-cols-2 h-16 bg-themeWhite items-center sm:flex sm:justify-between">
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
          {navLinks.map((item, index: number) => (
            <HeaderLink
              key={index}
              title={item.name}
              isCurrent={isActive(item.path)}
              href={item.path}
              expandable={item.expandable}
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
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="secondary"
                name="Jason Hughes"
                size="sm"
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
              />
            </DropdownTrigger>
            <DropdownMenu
              className="text-themeDark"
              aria-label="Profile Actions"
              variant="flat"
            >
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">zoey@example.com</p>
              </DropdownItem>
              <DropdownItem key="settings">My Settings</DropdownItem>
              <DropdownItem key="team_settings">Team Settings</DropdownItem>
              <DropdownItem key="analytics">Analytics</DropdownItem>
              <DropdownItem key="system">System</DropdownItem>
              <DropdownItem key="configurations">Configurations</DropdownItem>
              <DropdownItem key="help_and_feedback">
                Help & Feedback
              </DropdownItem>
              <DropdownItem key="logout" color="danger">
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
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
}: {
  href: string;
  title: string;
  isCurrent?: boolean;
  expandable?: boolean;
  isMobileMenuOpen?: boolean;
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return (
    <div className="relative flex items-center">
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
    </div>
  );
};
