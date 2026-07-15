import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import NavSidebar from './NavSidebar';
import RightSidebar from './RightSidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import CreatePostModal from '../feed/CreatePostModal';

const MainLayout = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="h-screen bg-dark flex flex-col overflow-hidden">
      <TopBar
        onMenuToggle={() => setMobileDrawerOpen(!mobileDrawerOpen)}
        onCreateClick={() => setCreateModalOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden pt-14 md:pt-16">
        {/* Mobile Drawer Overlay */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileDrawerOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Column 1: Nav Sidebar */}
        <NavSidebar
          mobileOpen={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
        />

        {/* Column 2: Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto sidebar-scroll">
          <div className="max-w-[760px] mx-auto px-4 py-4">
            <Outlet />
          </div>
        </main>

        {/* Column 3: Right Sidebar (hidden on tablet/mobile) */}
        <div className="hidden lg:block">
          <RightSidebar />
        </div>
      </div>

      {/* Floating Bottom Nav (mobile) */}
      <BottomNav onCreateClick={() => setCreateModalOpen(true)} />

      {/* Create Post Modal */}
      <AnimatePresence>
        {createModalOpen && (
          <CreatePostModal
            onClose={() => setCreateModalOpen(false)}
            onPostCreated={() => setCreateModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout;
