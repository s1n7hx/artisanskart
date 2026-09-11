import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { MakerPortalPage } from './pages/MakerPortalPage';
import { AdminPortalPage } from './pages/AdminPortalPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { PendingApprovalPage } from './pages/PendingApprovalPage';
import { BecomeAMakerPage } from './pages/BecomeAMakerPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="how-it-works" element={<HowItWorksPage />} />
            <Route path="collections" element={<CollectionsPage />} />
            <Route path="marketplace" element={<MarketplacePage />} />
            <Route path="maker" element={<MakerPortalPage />} />
            <Route path="become-a-maker" element={<BecomeAMakerPage />} />
            <Route path="admin" element={<AdminPortalPage />} />
            <Route path="admin/cms" element={<AdminPortalPage />} />
            <Route path="admin/users" element={<AdminPortalPage />} />
            <Route path="admin/applications" element={<AdminPortalPage />} />
            <Route path="pending-approval" element={<PendingApprovalPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signin" element={<LoginPage />} />
            <Route path="auth" element={<LoginPage />} />
            <Route path="auth/callback" element={<AuthCallbackPage />} />
            <Route path="contact" element={<ContactPage />} />
            {/* Fallback to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
