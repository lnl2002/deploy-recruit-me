import Login from "@/screens/login";
import React from "react";

const LoginPage: React.FC = () => {
  return (
    <div
      className="w-screen h-screen"
      style={{
        background: `url("./background-login.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <Login />
    </div>
  );
};

export default LoginPage;
