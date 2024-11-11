"use client";
import { montserratRegular } from "@/app/fonts";
import { Icons } from "@/icons";
import { Images } from "@/images";
import { useAppSelector } from "@/store/store";
import { Facebook, Instagram, Linkedin, Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

type FooterProp = {};

const contactInfo = {
  phone: "0904431642",
  email: "fptCPG35@fpt.cr.vn",
  address:
    "Đại học FPT ở Hà Nội, Khu Công nghệ cao Hòa Lạc, Km29 Đại lộ Thăng Long, huyện Thạch Thất, Hà Nội",
};

export const Footer: React.FC<FooterProp> = ({}): React.JSX.Element => {
  return (
    <div className="flex p-8 flex-row justify-center gap-10 border-t border-backgroundDecor200 mt-10">
      <div className="w-3/4 grid grid-flow-col md:grid-cols-3 sm:grid-cols-1 border-b p-3 gap-5">
        <div className="col-span-1 flex flex-col gap-4">
          <div className="w-1/2 flex flex-row gap-4 items-center">
            <Image src={Images.Logo} objectFit="cover" alt="" />
            <span className="text-themeOrange text-3xl font-bold">
              RecruitMe
            </span>
          </div>
          <div>
            <span className="text-sm text-themeDark">
              FPT Corporation - A Premier Workplace<br/> with Comprehensive Benefits
            </span>
          </div>
        </div>
        <div className="col-span-1 flex flex-col gap-4">
          <h4 className="text-themeDark text-sm font-bold">Contact Us</h4>
          <div className="flex gap-2">
            <Phone size={20} color="#999" />
            <span className="text-sm text-themeDark">1-791-463-5020 x9458</span>
          </div>
          <div className="flex gap-2">
            <Mail size={20} color="#999" />
            <span className="text-sm text-themeDark">
              Myron_Senger53@hotmail.com
            </span>
          </div>
          <div className="flex gap-2">
            <Facebook size={20} color="#999" />
            <span className="text-sm text-themeDark">
              https://impure-immigration.com
            </span>
          </div>
        </div>
        <div className="col-span-1 flex flex-col gap-4">
          <h4 className="text-themeDark text-sm font-bold">Follow Us</h4>
          <span className="text-sm text-themeDark">
            Follow us on our social media platforms to stay connected and
            discover the latest in our job listings!
          </span>
          <div className="flex flex-row gap-2">
            <Linkedin size={20} color="#999" />
            <Facebook size={20} color="#999" />
            <Instagram size={20} color="#999" />
          </div>
        </div>
      </div>
    </div>
  );
};

const HeaderLink = ({
  href,
  title,
  isCurrent,
}: {
  href: string;
  title: string;
  isCurrent?: boolean;
}) => {
  return (
    <Link
      className={"m-5 text-textPrimary" + (isCurrent ? " border-b" : "")}
      href={href}
    >
      <p className={montserratRegular.className}>{title}</p>
    </Link>
  );
};
