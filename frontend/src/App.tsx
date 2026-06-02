import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './layouts/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ChildrenList } from './pages/children/ChildrenList';
import { RegisterChild } from './pages/children/RegisterChild';
import { ChildDetail } from './pages/children/ChildDetail';
import { ChildPassport } from './pages/children/ChildPassport';
import { ReferralList } from './pages/referrals/ReferralList';
import { NewReferral } from './pages/referrals/NewReferral';
import { RiskDashboard } from './pages/risk/RiskDashboard';
import { LearningPage } from './pages/learning/LearningPage';
import { AttendancePage } from './pages/attendance/AttendancePage';
import { GrowthPage } from './pages/growth/GrowthPage';
import { DevelopmentPage } from './pages/development/DevelopmentPage';
import { SupervisorDashboard } from './pages/analytics/SupervisorDashboard';
import { VoicePage } from './pages/voice/VoicePage';
import { EngagementPage } from './pages/engagement/EngagementPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 2 },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />

            {/* Children */}
            <Route path="/children" element={<ChildrenList />} />
            <Route path="/children/register" element={<RegisterChild />} />
            <Route path="/children/:id" element={<ChildDetail />} />
            <Route path="/children/:id/passport" element={<ChildPassport />} />

            {/* Daily workflows */}
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/growth" element={<GrowthPage />} />
            <Route path="/development" element={<DevelopmentPage />} />

            {/* Decision support */}
            <Route path="/referrals" element={<ReferralList />} />
            <Route path="/children/:id/referrals/new" element={<NewReferral />} />
            <Route path="/risk" element={<RiskDashboard />} />
            <Route path="/learning" element={<LearningPage />} />

            {/* Voice */}
            <Route path="/voice" element={<VoicePage />} />

            {/* Parent Engagement */}
            <Route path="/engagement" element={<EngagementPage />} />

            {/* Supervisor / Analytics */}
            <Route path="/supervisor" element={<SupervisorDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
