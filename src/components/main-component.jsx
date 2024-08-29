import { useConfig } from "@/hooks/use-config";
import React from "react";
import LiveLayout from "./live-layout";
import BackTestingLayout from "./back-testing-layout";
import { LiveSocketProvider } from "@/providers/live-socket-provider";
import { BackTestSocketProvider } from "@/providers/back-socket-provider";

const MainComponent = () => {
  const { tradeConfig } = useConfig();
  if (tradeConfig.isLive) {
    return (
      <LiveSocketProvider>
        <LiveLayout />
      </LiveSocketProvider>
    );
  } else {
    return (
      <BackTestSocketProvider>
        <BackTestingLayout />
      </BackTestSocketProvider>
    );
  }
};

export default MainComponent;
