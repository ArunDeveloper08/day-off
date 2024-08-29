import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useModal } from "@/hooks/use-modal";
import { useConfig } from "@/hooks/use-config";
import ConfigForm from "@/components/config-form";
import AddFutureForm from "@/components/add-future-form";
import axios from "axios";

const ConfigModal = () => {
  const { isOpen, onClose, type } = useModal();
  const { tradeConfig } = useConfig();
  const [futureList, setFutureList] = useState([]);
  const isModalOpen = isOpen && type === "config";
  const getFutureList = async () => {
    const { data } = await axios.get(`${tradeConfig?.url}/setting/getFutOpt`);
    setFutureList(data.data);
  };
  useEffect(() => {
    if (!tradeConfig.url) return;
    getFutureList();
  }, [tradeConfig]);

  if (!isModalOpen) return;

  return (
    <Dialog width={1200} onOpenChange={onClose} open={isModalOpen}>
      <DialogContent className="max-w-4xl px-2">
        <DialogHeader>
          <DialogTitle>Change Future Configuration</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] rounded-md border px-3">
          <ConfigForm futureList={futureList} />
          <Separator />
          <AddFutureForm
            getFutureList={getFutureList}
            futureList={futureList}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ConfigModal;

const suggestions = [
  "NIFTY2020",
  "NIFTY2021",
  "NIFTY2022",
  "SP500",
  "DOWJONES",
  // Add more suggestions as needed
];
