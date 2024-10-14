import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// const Dialog = ({ showModal, text, chartId, onClose, onSave }) => {
const DialogModal = () => {
  const {
    isOpen,
    onClose,
    type,
    data: { text, chartId, onSave },
  } = useModal();
  const [localText, setLocalText] = useState(text?.text);
  const isModalOpen = isOpen && type === "dialog-modal";

  const handleChange = (e) => {
    setLocalText(e.target.value);
  };

  const handleSave = () => {
    const updatedText = {
      ...text, // Keep all other properties like bgFill, bgOpacity, etc.
      text: localText, // Update only the 'text' property
    };

    console.log("Save triggered, text:", updatedText, "chartId:", chartId);
    onSave(updatedText, chartId);
    onClose();
  };

  if (!isModalOpen) return null;

  return (
    <Dialog width={1200} onOpenChange={onClose} open={isModalOpen}>
      <DialogContent className="max-w-4xl px-2">
        <DialogHeader>
          <DialogTitle>Edit text</DialogTitle>
        </DialogHeader>
        <form>
          <div className="space-y-2">
            <Label htmlFor="text">Text</Label>
            <Input
              id="text"
              type="text"
              value={localText}
              onChange={handleChange}
            />
          </div>
        </form>
        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogModal;
