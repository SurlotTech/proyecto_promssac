import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh max-h-dvh min-h-0 w-full overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;