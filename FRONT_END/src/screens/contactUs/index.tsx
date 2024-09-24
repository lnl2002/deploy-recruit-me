"use client";
import React, { useEffect, useState } from "react";
import { ButtonApp } from "@/components";
import { TopBanner } from "@/components/TopBanner";
import { Icons } from "@/icons";
import { Input, Textarea } from "@nextui-org/react";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { Button } from "@nextui-org/button";
import { toast } from "react-toastify";
import { montserratRegular } from "@/app/fonts";
import { Images } from "@/images";

interface IForm {
  message: string;
  email: string;
  name: string;
}

const contactInfo = {
  phone: "0904431642",
  email: "fptCPG35@fpt.cr.vn",
  address:
    "Đại học FPT ở Hà Nội, Khu Công nghệ cao Hòa Lạc, Km29 Đại lộ Thăng Long, huyện Thạch Thất, Hà Nội",
};

export const ContactUs = (): React.JSX.Element => {
  const EMAIL = "laingoclamdev@gmail.com";

  const [form, setForm] = useState<IForm>({ name: "", email: "", message: "" });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div>
      <TopBanner
        src={Images.Banner1}
        h1="FPT education recruit"
        h2="Connecting Talent, Creating Futures"
        description="Our mission is to bridge the gap between opportunity and talent, fostering an environment where both employers and job seekers can thrive. We are committed to creating meaningful connections that empower individuals to achieve their career aspirations and help businesses grow with the right talent."
      />
      <div className="flex justify-center py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 bg-themeWhite rounded-3xl overflow-hidden shadow-lg w-full max-w-6xl">
          <div className="col-span-1 md:col-span-2 bg-[url('/images/card_thumb.jpg')] bg-cover bg-center">
            <div className="pt-16 px-6 pb-8 md:pt-32 md:px-10 md:pb-11 bg-blurEffect">
              <div className="flex flex-col items-center">
                <Image
                  src={"/images/logo.png"}
                  width={200}
                  height={200}
                  alt="logo"
                />
                <p
                  className={twMerge(
                    montserratRegular.className,
                    "text-themeWhite mt-6 text-sm text-center"
                  )}
                >
                  Empowering careers, connecting talent with opportunity, and
                  building futures together.
                </p>
              </div>
              <div className="flex flex-col gap-5 mt-10">
                {contactInfo && (
                  <>
                    <div className="flex items-center gap-3">
                      <Image src={Icons.Phone} alt="phone icon" />
                      <p
                        className={twMerge(
                          montserratRegular.className,
                          "text-themeWhite text-sm"
                        )}
                      >
                        {contactInfo.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Image src={Icons.Mail1} alt="mail icon" />
                      <p
                        className={twMerge(
                          montserratRegular.className,
                          "text-themeWhite text-sm"
                        )}
                      >
                        {contactInfo.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Image src={Icons.MarkerPin} alt="location icon" />
                      <p
                        className={twMerge(
                          montserratRegular.className,
                          "text-themeWhite text-sm"
                        )}
                      >
                        {contactInfo.address}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="text-themeWhite flex flex-row items-center mt-10">
                <div className="bg-themeWhite w-10 h-px mr-1"></div>
                <p
                  className={twMerge(montserratRegular.className, "text-base")}
                >
                  CONTACT NOW
                </p>
              </div>
            </div>
          </div>
          <div className="col-span-1 md:col-span-3 bg-themeWhite">
            <div className="m-6 md:m-11">
              <h1
                className={twMerge(
                  montserratRegular.className,
                  "text-textPrimary text-3xl md:text-5xl my-3"
                )}
              >
                Contact us
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputItem
                  label="Name"
                  placeHolder="Enter your name"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                />
                <InputItem
                  label="Email"
                  placeHolder="Enter your email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                />
                <AreaInputItem
                  label="Message"
                  placeHolder="Enter your message"
                  name="message"
                  value={form.message}
                  onChange={handleFormChange}
                />
              </div>
              <Button
                className="bg-themeOrange rounded-lg text-themeWhite font-light mt-12 text-[15px] w-full"
                onClick={() => {}}
                isLoading={isLoading}
                spinner={
                  <svg
                    className="animate-spin h-5 w-5 text-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      fill="currentColor"
                    />
                  </svg>
                }
              >
                {isLoading ? "LOADING" : "SEND MESSAGE"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputItem = ({
  label,
  placeHolder,
  onChange,
  name,
  value,
}: {
  label: string;
  placeHolder: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <Input
      classNames={{
        label: "text-textSecondary mb-5",
        base: "bg-black",
        input: "placeholder:text-textTertiary",
        description: "text-textTertiary",
      }}
      className={twMerge("w-full", montserratRegular.className)}
      type="text"
      variant={"underlined"}
      label={label}
      placeholder={placeHolder}
      onChange={onChange}
      name={name}
      value={value}
    />
  );
};

const AreaInputItem = ({
  label,
  placeHolder,
  onChange,
  name,
  value,
}: {
  label: string;
  placeHolder: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <Textarea
      classNames={{
        label: "text-textSecondary mb-5",
        base: "bg-black flex gap-5",
        input: "placeholder:text-textTertiary",
        description: "text-textTertiary",
      }}
      className={twMerge("col-span-2", montserratRegular.className)}
      type="text"
      variant={"underlined"}
      label={label}
      placeholder={placeHolder}
      onChange={onChange}
      name={name}
      value={value}
    />
  );
};
