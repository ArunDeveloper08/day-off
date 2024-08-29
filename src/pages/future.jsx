import Header from "@/components/header";
import MainComponent from "@/components/main-component";
import { useConfig } from "@/hooks/use-config";
import ModalProvider from "@/providers/modal-provider";
// import React, { useEffect } from "react";

const FuturePage = () => {
  const { tradeConfig } = useConfig();
  console.log(tradeConfig);
  return (
    <>
      <div>
        <Header />
        {tradeConfig.name && <MainComponent key={tradeConfig?.name} />}
      </div>
      <ModalProvider />
    </>
  );
};

export default FuturePage;
