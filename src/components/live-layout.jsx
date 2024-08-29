import { useConfig } from "@/hooks/use-config";
import React from "react";
import {LiveGraph} from "./LiveGraph";
import LiveTable from "./LiveTable";

const LiveLayout = () => {
  const { tradeConfig } = useConfig();
  return (
    <div>
      {/* <p>Live </p> */}
      <LiveGraph/>
      {/* {tradeConfig.label} */}
      <LiveTable />
    </div>
  );
};

export default LiveLayout;

