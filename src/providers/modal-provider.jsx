import { AddNewtrade } from "@/modals/add-new-trade";
import ConfigModal from "@/modals/config-modal";
import { EditTrade } from "@/modals/edit-trade";
import ConditionModal from "@/modals/condition-modal";
import React from "react";

const ModalProvider = () => {
  return (
    <>
      <ConfigModal />
      <AddNewtrade />
      <EditTrade />
      <ConditionModal />
    </>
  );
};

export default ModalProvider;
