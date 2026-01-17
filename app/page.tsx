"use client";

import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    const token = localStorage.getItem("admin_token");

    if (token) {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/login";
    }
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-amazon-lightGray">
      <p className="text-amazon-orange text-xl font-semibold">
        Redirecting...
      </p>
    </div>
  );
}
