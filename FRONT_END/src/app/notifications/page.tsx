"use client";

import React from "react";
import { MainLayout } from "@/components";
import { NotificationPage } from "@/screens/notificationPage";

function Noti() {
  return (
    <div
      style={{
        background: `url("/background-login.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <MainLayout>
        <div className="flex-1">
          <NotificationPage />
        </div>
      </MainLayout>
    </div>
  );
}

export default Noti
