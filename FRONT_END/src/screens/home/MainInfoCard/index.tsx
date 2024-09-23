"use client";
import { montserratRegular } from "@/app/fonts";
import { Images } from "@/images";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

export const MainInfoCard = (): React.JSX.Element => {
  return (
    <AnimatePresence>
      <div className="grid sm:w-2/3 p-5 sm:p-0 sm:grid-cols-5 bg-themeWhite rounded-3xl overflow-hidden shadow-lg">
        <div className="col-span-2 relative">
          <Image
            alt="about-us"
            objectFit="cover"
            fill
            src={Images.CardThumb}
          ></Image>
        </div>
        <div className="sm:col-span-3 bg-themeWhite">
          <div className="sm:m-11">
            <motion.h1
              initial={{ y: 25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.15 }}
              className={twMerge(
                montserratRegular.className,
                "text-textPrimary text-2xl sm:text-4xl"
              )}
            >
              Connecting <span className="text-themeOrange">Talent</span>
            </motion.h1>
            <motion.h2
              initial={{ y: 25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={twMerge(
                montserratRegular.className,
                "text-textPrimary text-2xl sm:text-4xl"
              )}
            >
              Creating <span className="text-themeOrange">Futures</span>
            </motion.h2>
            <motion.p
              initial={{ y: 25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              className={twMerge(
                montserratRegular.className,
                "text-textPrimary mt-6 text-wrap"
              )}
            >
              We believe that every individual has unique talents and potential
              waiting to be unlocked. Our mission is to bridge the gap between
              exceptional talent and outstanding opportunities, fostering a
              community where both employers and job seekers thrive.
            </motion.p>
            <motion.div
              initial={{ y: 25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="w-full flex flex-row justify-between mt-10"
            >
              <NumberItem keyw="jobs posted" value="3.5k+" />
              <NumberItem keyw="CV processed per day" value="250" />
              <NumberItem keyw="Users satisfy" value="97%" />
            </motion.div>
            <Link
              className="text-textSecondary flex flex-row items-center mt-10"
              href={"#"}
              title="Readmore"
            >
              <div
                style={{ height: 1 }}
                className="bg-textSecondary w-10 mr-1"
              ></div>
              <p className={twMerge(montserratRegular.className, "text-base")}>
                READ MORE
              </p>
            </Link>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};

const NumberItem = ({ keyw, value }: { keyw: string; value: string }) => {
  return (
    <div>
      <p
        className={twMerge(
          montserratRegular.className,
          "text-textPrimary text-3xl sm:text-4xl"
        )}
      >
        {value}
      </p>
      <p
        className={twMerge(
          montserratRegular.className,
          "text-textSecondary text-base mt-2"
        )}
      >
        {keyw}
      </p>
    </div>
  );
};
