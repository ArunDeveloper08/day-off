import { Navigate, Route, Routes, redirect } from "react-router-dom";
import "./App.css";
// import FuturePage from "./pages/future";
import HomePage from "./pages/home";
// import useAuth from "./hooks/useAuth";
import { DashboardPage } from "./pages/dashboard";
import { LivePageLayout } from "./pages/live-page";
import { BackTestingPageLayout } from "./pages/back-testing-page";
import LoginPage from "./pages/LoginPage";
import { ThemeProvider } from "./components/theme-provider";
import AngelOneLayout from "./pages/angel-one/layout";
import GainerLosser from "./pages/angel-one/gainer-looser";
import OtherPage from "./pages/angel-one/other-page";
import OptionGreek from "./pages/angel-one/option-greek";
import Dashboard from "./components/TradingViewGraph";
import { HelpingPageLayout } from "./pages/HelpingChart";
import CustomTab from "./pages/CustomTab";
import AngelLogin from "./pages/AngelLogin";
import secureLocalStorage from "react-secure-storage";
import ModalProvider from "./providers/modal-provider";
import IdentifierLooserGainer from "./pages/IdentifierLooserGainer";
import PcrChart from "./pages/PcrChart";

export default function Home() {
  // useAuth();
  const RedirectIfAuthenticated = ({ children }) => {
    const isAuthenticated =
      secureLocalStorage.getItem("Authenticate") === "aAg@16&5jNs$%d0*";
    return isAuthenticated ? <Navigate to={`/future/dashboard`} /> : children;
  };

  // ProtectedRoute component
  const ProtectedRoute = ({ children }) => {
    const isAuthenticated =
      secureLocalStorage.getItem("Authenticate") === "aAg@16&5jNs$%d0*";
    return isAuthenticated ? children : <Navigate to={"/future"} />;
   };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ModalProvider />
      <Routes>
        <Route
          path="/future"
          element={
            <RedirectIfAuthenticated>
              <LoginPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/future/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/future/pcrchart"
          element={
            <ProtectedRoute>
              <PcrChart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/future/particular-identifier-losser-gainer"
          element={
            <ProtectedRoute>
              <IdentifierLooserGainer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/future/angel-login"
          element={
            <ProtectedRoute>
              <AngelLogin />
            </ProtectedRoute>
          }
        />
        <Route path="/future/trade" element={<Dashboard />} />
        <Route
          path="/future/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/future/live" element={<LivePageLayout />} />
        <Route
          path="/future/sop"
          element={
            <ProtectedRoute>
              <CustomTab />
            </ProtectedRoute>
          }
        />
        <Route
          path="/future/helping"
          element={
            <ProtectedRoute>
              <HelpingPageLayout />
            </ProtectedRoute>
          }
        />
        
        <Route path="/future/back" element={<BackTestingPageLayout />} />
        <Route path="/future/angel-one" element={<AngelOneLayout />}>
          <Route
            index
            element={<Navigate to="gainer-looser" replace={true} />}
          />
          <Route path="gainer-looser" element={<GainerLosser />} />
          <Route path="option-greek" element={<OptionGreek />} />
          <Route path="other" element={<OtherPage />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

// url for gainer looser log
// /api/v1/logs/getPrevDate  ==> GET METHOD    PORT 4001

// /api/v1/logs/getdata===>POST METHOD     send datatype={expirytype: "NEAR", datatype: "Long Built Up"}   and date
