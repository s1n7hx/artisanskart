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
            <Route path="admin" element={<AdminPortalPage />} />
            <Route path="admin/cms" element={<AdminPortalPage />} />
            <Route path="contact" element={<ContactPage />} />
            {/* Fallback to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
