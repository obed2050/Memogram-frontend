import { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HiOutlineHome, HiOutlineUserGroup, HiOutlineDocumentText,
  HiOutlineChatBubbleLeftRight, HiOutlineCalendarDays,
  HiOutlineBuildingLibrary, HiOutlineFlag, HiOutlineChartBar,
  HiOutlineArrowLeftOnRectangle, HiOutlineBars3, HiOutlineXMark,
  HiOutlineShieldCheck,
} from 'react-icons/hi2';

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: HiOutlineHome, end: true },
  { path: '/admin/users', label: 'Users', icon: HiOutlineUserGroup },
  { path: '/admin/posts', label: 'Posts', icon: HiOutlineDocumentText },
  { path: '/admin/comments', label: 'Comments', icon: HiOutlineChatBubbleLeftRight },
  { path: '/admin/events', label: 'Events', icon: HiOutlineCalendarDays },
  { path: '/admin/communities', label: 'Communities', icon: HiOutlineBuildingLibrary },
  { path: '/admin/reports', label: 'Reports', icon: HiOutlineFlag },
  { path: '/admin/moderation', label: 'Moderation Log', icon: HiOutlineShieldCheck },
  { path: '/admin/analytics', label: 'Analytics', icon: HiOutlineChartBar },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-dark">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-[68px]' : 'w-60'} flex flex-col bg-dark-card border-r border-dark-border transition-all duration-200`}>
        <div className="flex items-center justify-between h-14 px-3 border-b border-dark-border">
          {!collapsed && (
            <span className="text-sm font-bold text-white tracking-wide">Admin Panel</span>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-dark-surface text-gray-400">
            {collapsed ? <HiOutlineBars3 className="w-4 h-4" /> : <HiOutlineXMark className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = item.end ? location.pathname === item.path : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? 'bg-primary/10 text-primary-light font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-dark-surface'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-dark-border space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-dark-surface transition-all"
          >
            <HiOutlineArrowLeftOnRectangle className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Back to App</span>}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center justify-between px-6 border-b border-dark-border bg-dark-card/50 backdrop-blur-sm">
          <div />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-medium text-white">{user?.fullName}</p>
              <p className="text-[10px] text-gray-500">Administrator</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
              {user?.fullName?.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
