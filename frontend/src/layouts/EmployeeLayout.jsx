import React from 'react';
import { Outlet } from 'react-router-dom';
import EmployeeSidebar from '../components/EmployeeSidebar';
import Header from '../components/Header';

const EmployeeLayout = () => {
  return (
    <div className="layout-wrapper">
      <EmployeeSidebar />
      <div className="main-content">
        <Header />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EmployeeLayout;
