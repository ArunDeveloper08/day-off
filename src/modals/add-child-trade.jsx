import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { BASE_URL_OVERALL } from "../lib/constants";
import { useEffect, useRef, useState } from "react";
import { formatDate } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const AddChildTrade = () => {
  const { isOpen, type, onClose, data } = useModal();
  const [values, setValues] = useState({
    childTrade: "",
    indexValue: "7",

  });

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [apiData, setApiData] = useState([]);
  const id = searchParams.get("id");
  const intervalRef = useRef(null);
  const isModalOpen = isOpen && type === "child-modal";

  const getIdentifier = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL_OVERALL}/child?id=${id}&callType=${data.symbol}`
      );
      //   console.log("response", response.data.data);
      setApiData(response.data.data);
    } catch (Error) {
      console.log("error", Error);
    }
  };

  useEffect(() => {
    if (!data || !id) {
      return;
    }
    getIdentifier();
  }, [data]);

  const handleSelect = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };
  if (!isModalOpen) return null;
  const handleSubmit = async () => {
    if (!values.childTrade) {
      return alert("Please Enter Child Indentifier");
    }
    try {
      const response = await axios.post(
        `${BASE_URL_OVERALL}/child/createChild`,
        { ...values , id , tradingOptions:data?.symbol}
      );
      alert(response.data.message);
    } catch (error) {
      console.log(error);
      alert(error.response.data.message);
    }
  };

  return (
    <Dialog width={1200} onOpenChange={onClose} open={isModalOpen} height={500}>
      <DialogContent className="max-w-4xl px-2">
        <DialogHeader className="flex justify-center font-bold">
          ADD CHILD TRADE
        </DialogHeader>

        <div className="px-1">
          <Label>ADD NEW {data.symbol} CHILD</Label>
          <Select
            value={values.childTrade?.tradingsymbol || ""}
            name="childTrade"
            onValueChange={(value) => handleSelect("childTrade", value)}
          >
            <SelectTrigger className="w-full mt-1 border-zinc-500">
              <SelectValue>
                {values.childTrade?.tradingsymbol || "Select a trading symbol"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Add Child</SelectLabel>
                {apiData &&
                  apiData.map((suggestion) => (
                    <SelectItem
                      key={suggestion.tradingsymbol}
                      value={suggestion}
                    >
                      {suggestion.tradingsymbol}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="px-1">
          <Label>Index Value (Please fill this first )</Label>
          <Select
            disabled={values.isMaster}
            value={values.indexValue}
            name="indexValue"
            onValueChange={(value) => handleSelect("indexValue", value)}
          >
            <SelectTrigger className="w-full mt-1 border-zinc-500">
              <SelectValue>{values.indexValue}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Trade Index</SelectLabel>
                {[
                  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
                  19, 20,
                ]?.map((suggestion) => (
                  <SelectItem key={suggestion} value={suggestion}>
                    {suggestion}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default AddChildTrade;
