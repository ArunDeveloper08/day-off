import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ThemeProvider } from "./providers/theme-provider.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import {
  LiveSocketProvider,
  useLiveSocket,
} from "@/providers/live-socket-provider";
import { Toaster } from "@/components/ui/toaster";
import { useDataContext, DataProvider } from "@/providers/data-provider";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <Router>
    <ThemeProvider defaultTheme="light" storageKey="intrument-theme">
      <LiveSocketProvider>
      <DataProvider>
        <App />
        <Toaster />
        </DataProvider>
      </LiveSocketProvider>
    </ThemeProvider>
  </Router>
  // {/* </React.StrictMode> */}
);
