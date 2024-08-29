import { useConfig } from "@/hooks/use-config";
import React from "react";
import BackTestingGraph from "./BackTestingGraph";

const BackTestingLayout = () => {
  const { tradeConfig } = useConfig();
  return (
    <div>
     <BackTestingGraph/>
     
    </div>
  );
};

export default BackTestingLayout;
