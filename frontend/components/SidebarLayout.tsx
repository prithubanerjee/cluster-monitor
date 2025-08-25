"use client";

import { useState } from "react";
import TimeSeriesChart from "@/components/TimeSeriesChart";
import SnapshotPolicyForm from "@/components/SnapshotPolicyForm";

export default function SidebarLayout() {
  const [activeTab, setActiveTab] = useState<"metrics" | "snapshot">("metrics");

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 flex flex-col">
        <div className="px-6 py-4 text-xl font-bold border-b border-gray-700">
          [Cluster Name]
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => setActiveTab("metrics")}
            className={`block w-full text-left px-3 py-2 rounded-md ${
              activeTab === "metrics"
                ? "bg-gray-700 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            Performance Metrics
          </button>
          <button
            onClick={() => setActiveTab("snapshot")}
            className={`block w-full text-left px-3 py-2 rounded-md ${
              activeTab === "snapshot"
                ? "bg-gray-700 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            Edit Snapshot Policy
          </button>
        </nav>
        <div className="px-6 py-4 border-t border-gray-700 text-sm">
          AD\user
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-100 text-gray-900">
        {activeTab === "metrics" && <TimeSeriesChart />}
        {activeTab === "snapshot" && <SnapshotPolicyForm />}
      </div>
    </div>
  );
}
