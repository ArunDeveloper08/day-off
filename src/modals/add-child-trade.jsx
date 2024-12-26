import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { BASE_URL_OVERALL } from "../lib/constants";
import { useEffect, useRef, useState } from "react";

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
  const [searchTerm, setSearchTerm] = useState("");

  const isModalOpen = isOpen && type === "child-modal";
  // State for input text

  // Filter options based on searchTerm
  const filteredOptions = apiData?.filter((option) =>
    option.tradingsymbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        { ...values, id, tradingOptions: data?.symbol }
      );
      alert(response.data.message);
    } catch (error) {
      console.log(error);
      alert(error.response.data.message);
    }
  };

  return (
    <Dialog width={1200} onOpenChange={onClose} open={isModalOpen} height={800}>
      <DialogContent className="max-w-4xl px-2">
        <DialogHeader className="flex justify-center font-bold">
          ADD CHILD TRADE {data.symbol}
        </DialogHeader>

        <div className="px-1">
          <Label>ADD NEW {data.symbol} CHILD</Label>
          <div className="relative">
            {/* Input field acting as a searchable dropdown */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search or select a trading symbol..."
              className="w-full mt-1 px-2 py-1 border border-zinc-500 rounded"
            />

            {/* Options dropdown */}
            {filteredOptions && filteredOptions.length > 0 && (
              <ul className=" left-0 right-0 max-h-40 mt-1 overflow-y-auto bg-white border border-zinc-500 rounded shadow-lg z-10">
                {filteredOptions?.map((option) => (
                  <li
                    key={option.tradingsymbol}
                    onClick={() => {
                      setSearchTerm(option.tradingsymbol); // Set selected option in input
                      handleSelect("childTrade", option); // Trigger selection handler
                    }}
                    className="px-2 py-1 cursor-pointer hover:bg-gray-200"
                  >
                    {option.tradingsymbol}
                  </li>
                ))}
              </ul>
            )}

            {/* No options found */}
            {filteredOptions && filteredOptions.length === 0 && (
              <p className="mt-1 text-sm text-gray-500">
                No matching results found
              </p>
            )}
          </div>
        </div>
        <div className="px-1">
          <Label>Index Value (Please fill this first )</Label>
          <Select
            // disabled={values.isMaster}
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
                {[2, 7, 8, 12, 13, 17, 18]?.map((suggestion) => (
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
