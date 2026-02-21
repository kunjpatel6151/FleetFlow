import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import '../styles/dashboard.css'

export default function MainLayout() {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-area">
                <Topbar />
                <Outlet />
            </div>
        </div>
    )
}
