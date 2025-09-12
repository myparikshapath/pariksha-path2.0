"use client";

import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 lg:px-10 pt-28">
      <div className="w-full mx-auto bg-white shadow-xl 
      rounded-2xl p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2E4A3C] text-center">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base text-center">
            Welcome to the admin panel.
          </p>
        </header>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 cursor-pointer">
          {/* <div className="bg-[#2E4A3C] text-white p-6 rounded-xl shadow-md hover:scale-105 transition-transform h-32 flex flex-col justify-between"> */}
          <Link
            href="/admin/users"
            className="bg-[#2E4A3C] text-white p-6 rounded-xl shadow-md hover:scale-105 transition-transform h-32 flex flex-col justify-between"

          >
            <h2 className="text-lg font-semibold">Users</h2>
            <p className="text-sm">Manage registered users</p>
          </Link>
          {/* </div> */}
          {/* <div className="bg-[#1d3328] text-white p-6 rounded-xl shadow-md hover:scale-105 transition-transform h-32 flex flex-col justify-between">
            <h2 className="text-lg font-semibold">Reports</h2>
            <p className="text-sm">View system activity reports</p>
          </div> */}
          {/* <div className="bg-green-600 text-white p-6 rounded-xl shadow-md hover:scale-105 transition-transform h-32 flex flex-col justify-between">
            <h2 className="text-lg font-semibold">Settings</h2>
            <p className="text-sm">Configure application settings</p>
          </div> */}
          {/* <div className="bg-green-700 text-white p-6 rounded-xl shadow-md hover:scale-105 transition-transform h-32 flex flex-col justify-between">
            <h2 className="text-lg font-semibold">Logs</h2>
            <p className="text-sm">Check audit logs</p>
          </div> */}
          {/* <div className="bg-emerald-500 text-white p-6 
          rounded-xl shadow-md hover:scale-105 transition-transform h-32 flex flex-col justify-between">
            <h2 className="text-lg font-semibold">Analytics</h2>
            <p className="text-sm">Track usage & performance</p>
          </div> */}
          <Link href = "/admin/add-exam"
            className="bg-emerald-700 text-white p-6
           rounded-xl shadow-md hover:scale-105 transition-transform h-32 flex flex-col justify-between"
          >
            <h2 className="text-lg font-semibold">Add Exam</h2>
            <p className="text-sm">Add new exam</p>
          </Link>
          <Link
            href="/admin/upload-questions"
            className="bg-emerald-900 text-white p-6 rounded-xl shadow-md hover:scale-105 transition-transform h-32 flex flex-col justify-between"
          >
            <h2 className="text-lg font-semibold">Upload Questions</h2>
            <p className="text-sm">Upload new questions</p>
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center text-gray-500 text-xs sm:text-sm">
          © {new Date().getFullYear()} Admin Panel. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
