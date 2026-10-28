import { useEffect, useState, type ReactNode } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { WardrobePage } from './pages/WardrobePage';
import { DiscoverOutfitsPage } from './pages/DiscoverOutfitsPage';
import { SavedOutfitsPage } from './pages/SavedOutfitsPage';
import { OutfitBuilderPage } from './pages/OutfitBuilderPage';
import { OutfitPlannerPage } from './pages/OutfitPlannerPage';
import { PreferencesPage } from './pages/PreferencesPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AuthPage, LandingPage, checkSession } from './auth/AuthPages';
import { WeatherSuggestionsPage } from './pages/WeatherSuggestionsPage';
import { LookbookPage } from './pages/LookbookPage';
import { useTheme } from './hooks/useTheme';
import { ForgotPasswordPage } from './auth/ForgotPasswordPage';
import { ResetPasswordPage } from './auth/ResetPasswordPage';
import UploadClothing from './components/UploadClothing';
import { DashboardOverview } from "./pages/DashboardOverview";

function ProtectedArea({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'checking' | 'authenticated' | 'guest'>('checking');
  const location = useLocation();
  useEffect(() => {
    let active = true;
    checkSession().then(user => {
      if (active) setStatus(user ? 'authenticated' : 'guest');
    });
    return () => { active = false; };
  }, [location.pathname]);

  if (status === 'checking') return <div className="auth-loading"><span className="brand-icon">✳</span><p>Opening your wardrobe…</p></div>;
  if (status === 'guest') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

export function App() {
  useTheme();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />

      {/* Updated these two routes to use the new DashboardOverview component */}
      <Route path="/overview" element={<ProtectedArea><AppLayout><DashboardOverview /></AppLayout></ProtectedArea>} />

      <Route path="/wardrobe" element={<ProtectedArea><AppLayout><WardrobePage /></AppLayout></ProtectedArea>} />
      <Route path="/discover" element={<ProtectedArea><AppLayout><DiscoverOutfitsPage /></AppLayout></ProtectedArea>} />
      <Route path="/saved" element={<ProtectedArea><AppLayout><SavedOutfitsPage /></AppLayout></ProtectedArea>} />
      <Route path="/builder" element={<ProtectedArea><AppLayout><OutfitBuilderPage /></AppLayout></ProtectedArea>} />
      <Route path="/planner" element={<ProtectedArea><AppLayout><OutfitPlannerPage /></AppLayout></ProtectedArea>} />
      <Route path="/preferences" element={<ProtectedArea><AppLayout><PreferencesPage /></AppLayout></ProtectedArea>} />
      <Route path="/settings" element={<ProtectedArea><AppLayout><SettingsPage /></AppLayout></ProtectedArea>} />
      <Route path="/weather" element={<ProtectedArea><AppLayout><WeatherSuggestionsPage /></AppLayout></ProtectedArea>} />
      <Route path="/lookbook" element={<ProtectedArea><AppLayout><LookbookPage /></AppLayout></ProtectedArea>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/upload" element={<ProtectedArea><AppLayout><UploadClothing /></AppLayout></ProtectedArea>} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}