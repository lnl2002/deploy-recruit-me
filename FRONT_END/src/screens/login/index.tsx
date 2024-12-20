"use client";
import React from "react";
import { Button } from "@nextui-org/react";
import {
  BACKEND_URL,
  FRONTEND_URL_ADMIN_HOME,
  FRONTEND_URL_CANDIDATE_HOME,
  FRONTEND_URL_INTERVIEW_MANAGER_HOME,
  FRONTEND_URL_RECRUITER_HOME,
  FRONTEND_URL_INTERVIEWER_HOME,
} from "@/utils/env";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/store/store";
import { login } from "@/store/userState";
import { toast } from "react-toastify";

export enum IAccoutStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED"
}

const Login: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  
  // Lấy giá trị của query parameter "path"
  const path = searchParams.get('path');

  const handleGoogleLogin = () => {
    const popup = window.open(
      `${BACKEND_URL}/api/v1/auth/google`,
      "googleLoginPopup",
      "width=500,height=600"
    );

    // Lắng nghe sự kiện postMessage từ popup sau khi login thành công
    window.addEventListener("message", (event) => {
      if (event.origin !== BACKEND_URL) {
        return;
      }

      const { accessToken, refreshToken, user} = event.data;
      const userInfo = JSON.parse(user);
      
      if(userInfo?.status === IAccoutStatus.SUSPENDED){
        toast.error('Your account has been suspended');
        return;
      }
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      // localStorage.setItem('user', user);
      dispatch(login(JSON.parse(user)));

      

      popup?.close();

      switch (userInfo.role) {
        case "CANDIDATE":
          console.log("CANDIDATE");
          router.push(`${FRONTEND_URL_CANDIDATE_HOME}${path || ''}`);
          break;
        case "RECRUITER":
          console.log("RECRUITER");
          router.push(FRONTEND_URL_RECRUITER_HOME);
          break;
        case "INTERVIEW_MANAGER":
          console.log("INTERVIEW_MANAGER");
          router.push(FRONTEND_URL_INTERVIEW_MANAGER_HOME);
          break;
        case "INTERVIEWER":
          console.log("INTERVIEWER");
          router.push(FRONTEND_URL_INTERVIEWER_HOME);
          break;
        case "ADMIN":
          console.log("ADMIN");
          router.push(FRONTEND_URL_ADMIN_HOME);
          break;

        default:
          router.push("/");
          break;
      }
    });
  };
  return (
    <div className="flex items-center justify-center min-h-screen z-10 text-themeDark">
      <div className="flex flex-col items-center">
        <div className="mb-6">
          <img src="./logo.svg" alt="RecruitMe Logo" className="h-10" />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-gray-800">WELCOME BACK</h1>
        <p className="mb-8 text-center text-gray-600">
          Please login your account. We happy to see you again.
        </p>
        <Button
          className="w-full max-w-xs bg-orange-500 border-1 rounded-[20px] hover:bg-orange-600 border-[#F36523] font-bold text-[16px]"
          startContent={
            <img
              src="./images/google-icon.png"
              alt="Google Icon"
              className="h-5 mr-2"
            />
          }
          onClick={() => handleGoogleLogin()}
        >
          Log In with Google
        </Button>
      </div>
    </div>
  );
};

export default Login;
