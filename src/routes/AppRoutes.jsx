import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import AdminLayout from '../components/admin/AdminLayout';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import HomePage from '../pages/HomePage';
import ProfilePage from '../pages/ProfilePage';
import MemoriesPage from '../pages/MemoriesPage';
import ReelsPage from '../pages/ReelsPage';
import MessagesPage from '../pages/MessagesPage';
import SearchPage from '../pages/SearchPage';
import PostDetailPage from '../pages/PostDetailPage';
import NotificationsPage from '../pages/NotificationsPage';
import CommunitiesPage from '../pages/CommunitiesPage';
import CommunityDetailPage from '../pages/CommunityDetailPage';
import GenerationCommunityPage from '../pages/GenerationCommunityPage';
import EventDetailPage from '../pages/EventDetailPage';
import ClubsPage from '../pages/ClubsPage';
import ClubDetailPage from '../pages/ClubDetailPage';
import BeforeNowPage from '../pages/BeforeNowPage';
import BeforeNowDetailPage from '../pages/BeforeNowDetailPage';
import GuessWhoPage from '../pages/GuessWhoPage';
import GuessWhoDetailPage from '../pages/GuessWhoDetailPage';
import OnThisDayPage from '../pages/OnThisDayPage';
import AlbumsPage from '../pages/AlbumsPage';
import AlbumDetailPage from '../pages/AlbumDetailPage';
import ExplorePage from '../pages/ExplorePage';
import SavedPage from '../pages/SavedPage';
import DraftsPage from '../pages/DraftsPage';
import CallHistoryPage from '../pages/CallHistoryPage';
import DashboardPage from '../pages/admin/DashboardPage';
import UsersPage from '../pages/admin/UsersPage';
import PostsPage from '../pages/admin/PostsPage';
import CommentsPage from '../pages/admin/CommentsPage';
import EventsPage from '../pages/admin/EventsPage';
import CommunitiesAdminPage from '../pages/admin/CommunitiesPage';
import ReportsPage from '../pages/admin/ReportsPage';
import ModerationLogPage from '../pages/admin/ModerationLogPage';
import AnalyticsPage from '../pages/admin/AnalyticsPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return user ? <Navigate to="/" replace /> : children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<HomePage />} />
          <Route path="/memories" element={<MemoriesPage />} />
          <Route path="/reels" element={<ReelsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/calls" element={<CallHistoryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/drafts" element={<DraftsPage />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/communities/:schoolId" element={<CommunityDetailPage />} />
          <Route path="/communities/:schoolId/generation/:generation" element={<GenerationCommunityPage />} />
          <Route path="/events/:eventId" element={<EventDetailPage />} />
          <Route path="/clubs" element={<ClubsPage />} />
          <Route path="/clubs/:clubId" element={<ClubDetailPage />} />
          <Route path="/before-now" element={<BeforeNowPage />} />
          <Route path="/before-now/:id" element={<BeforeNowDetailPage />} />
          <Route path="/guess-who" element={<GuessWhoPage />} />
          <Route path="/guess-who/:id" element={<GuessWhoDetailPage />} />
          <Route path="/on-this-day" element={<OnThisDayPage />} />
          <Route path="/albums" element={<AlbumsPage />} />
          <Route path="/albums/:id" element={<AlbumDetailPage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/posts" element={<PostsPage />} />
          <Route path="/admin/comments" element={<CommentsPage />} />
          <Route path="/admin/events" element={<EventsPage />} />
          <Route path="/admin/communities" element={<CommunitiesAdminPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
          <Route path="/admin/moderation" element={<ModerationLogPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
