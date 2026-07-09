import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import lazy from './utils/lazyWithRetry.js';
import PublicLayout from './components/layout/PublicLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Loader from './components/ui/Loader.jsx';

// Public pages
import Home from './pages/Home.jsx';
const Services = lazy(() => import('./pages/Services.jsx'));
const Offers = lazy(() => import('./pages/Offers.jsx'));
const Lectures = lazy(() => import('./pages/Lectures.jsx'));
const Judgments = lazy(() => import('./pages/Judgments.jsx'));
const Books = lazy(() => import('./pages/Books.jsx'));
const Contracts = lazy(() => import('./pages/Contracts.jsx'));
const GovernmentLinks = lazy(() => import('./pages/GovernmentLinks.jsx'));
const Activities = lazy(() => import('./pages/Activities.jsx'));
const Complaints = lazy(() => import('./pages/Complaints.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

// Admin
const Login = lazy(() => import('./pages/admin/Login.jsx'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard.jsx'));
const BoardMembersAdmin = lazy(() => import('./pages/admin/BoardMembersAdmin.jsx'));
const ServicesAdmin = lazy(() => import('./pages/admin/ServicesAdmin.jsx'));
const OffersAdmin = lazy(() => import('./pages/admin/OffersAdmin.jsx'));
const LecturesAdmin = lazy(() => import('./pages/admin/LecturesAdmin.jsx'));
const JudgmentsAdmin = lazy(() => import('./pages/admin/JudgmentsAdmin.jsx'));
const BooksAdmin = lazy(() => import('./pages/admin/BooksAdmin.jsx'));
const ContractsAdmin = lazy(() => import('./pages/admin/ContractsAdmin.jsx'));
const CourtsAdmin = lazy(() => import('./pages/admin/CourtsAdmin.jsx'));
const GovernmentLinksAdmin = lazy(() => import('./pages/admin/GovernmentLinksAdmin.jsx'));
const ActivitiesAdmin = lazy(() => import('./pages/admin/ActivitiesAdmin.jsx'));
const ComplaintsAdmin = lazy(() => import('./pages/admin/ComplaintsAdmin.jsx'));
const SettingsAdmin = lazy(() => import('./pages/admin/SettingsAdmin.jsx'));

export default function App() {
  return (
    <Suspense fallback={<Loader full />}>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="offers" element={<Offers />} />
          <Route path="lectures" element={<Lectures />} />
          <Route path="judgments" element={<Judgments />} />
          <Route path="books" element={<Books />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="government-links" element={<GovernmentLinks />} />
          <Route path="activities" element={<Activities />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Admin auth */}
        <Route path="/admin/login" element={<Login />} />

        {/* Admin protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="board-members" element={<BoardMembersAdmin />} />
          <Route path="services" element={<ServicesAdmin />} />
          <Route path="offers" element={<OffersAdmin />} />
          <Route path="lectures" element={<LecturesAdmin />} />
          <Route path="judgments" element={<JudgmentsAdmin />} />
          <Route path="books" element={<BooksAdmin />} />
          <Route path="contracts" element={<ContractsAdmin />} />
          <Route path="courts" element={<CourtsAdmin />} />
          <Route path="government-links" element={<GovernmentLinksAdmin />} />
          <Route path="activities" element={<ActivitiesAdmin />} />
          <Route path="complaints" element={<ComplaintsAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
