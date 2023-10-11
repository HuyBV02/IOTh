import SideBar from '../components/SideBar';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Inbox from '../pages/Inbox';
import Navbar from '../components/Navbar';

const Layout = ({ setToken }) => {
    return (
        <div className="flex flex-col">
            <div>
                <Navbar setToken={setToken}/>
            </div>
            <div className="flex">
                <div className="w-[15%]">
                    <SideBar />
                </div>
                <div className="w-[85%]">
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/inbox" element={<Inbox />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default Layout;
