 
"use client";

import { useState, useEffect } from 'react';
import StatCard from "./components/StatCard";
 

export default function Dashboard() {
  const [status, setStatus] = useState("Checking...");
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Check API Status
        // Note: Ensure you've added the /api/status route to your Express app
        const statusRes = await fetch('http://localhost:5000/api/status');
        if (statusRes.ok) {
          setStatus("Online");
        } else {
          setStatus("Error");
        }

        // 2. Get User Count
        const usersRes = await fetch('http://localhost:5000/api/users');
        const usersData = await usersRes.json();
        setUserCount(usersData.length);

      } catch (error) {
        console.error("Dashboard fetch error:", error);
        setStatus("Offline");
      }
    };

    fetchDashboardData();
    
    // Refresh data every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Users" value={userCount.toString()} />
        <StatCard title="Active Sessions" value="1" /> 
        <StatCard 
          title="API Status" 
          value={status}
        />
      </div>
    </>
  );
}
 
