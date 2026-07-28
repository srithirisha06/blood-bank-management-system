import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  return (
    <div className="d-flex">
      <Sidebar showMobile={showMobileSidebar} />
      <div className="flex-grow-1 app-content">
        <Navbar onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)} />
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
