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

const ConditionModal = () => {
  const { isOpen, type, onClose } = useModal();
  const [data, setData] = useState([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const intervalRef = useRef(null)
  const isModalOpen = isOpen && type === "condition-modal";

  const getData = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL_OVERALL}/config/getnotification?id=${id}`
      );
      setData(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getData();
    const interval = setInterval(getData, 15 * 1000);
    intervalRef.current = interval;
    return () => clearInterval(interval);
  }, []);


  return (
    <Dialog width={1200} onOpenChange={onClose} open={isModalOpen}>
      <DialogContent className="max-w-4xl px-2">
        <DialogHeader>
          {/* <DialogTitle>Entry Exit Condition</DialogTitle> */}
          <div className="flex justify-around mt-2">
            <DialogTitle>Terminal : {data?.terminal}</DialogTitle>
            <DialogTitle>Time : {data?.timestamp}</DialogTitle>
            <DialogTitle>Trade Index : {data?.tradeIndex}</DialogTitle>
          </div>

          <div className="flex justify-around">
            <div className="mt-5">
              {data?.EntryCASE1 && (
                <>
                  <DialogTitle> Initial Entry  Condition </DialogTitle>
                  <div>
                    <p
                      className={`${
                        data.EntryCASE1.EntryIsCurrCandleGreen === true
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      Entry is Current Candle is Green
                    </p>
                    <p
                      className={`${
                        data.EntryCASE1.EntryIsLTPBwCloseAndEntryPoint === true
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      Entry is LTP B/w Close and Entry Point
                    </p>
                    <p
                      className={`${
                        data.EntryCASE1.EntryIsLtpGreaterThenClose === true
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      Entry is LTP Greater then Close
                    </p>
                    <p
                      className={`${
                        data.EntryCASE1.EntryIsMA1GreaterThenMA2 === true
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      Entry is MA1 Greater MA2
                    </p>
                    <p
                      className={`${
                        data.EntryCASE1.EntryIsPrevCandleGreen === true
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      Entry is Prev Candle Green
                    </p>
                    <p
                      className={`${
                        data.EntryCASE1.EntryMasterTrend === true
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      Entry Master Trend
                    </p>
                    <p
                      className={`${
                        data.EntryCASE1.EntryOwnTrend === true
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      Entry Own Trend
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-8">
              {data.EntryCASE2 && (
                <>
                  <DialogTitle>Re-Entry  Condition </DialogTitle>
                  <div>
                    <p
                      className={`${
                        data.EntryCASE1.EntryIsCurrCandleGreen === true
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      Entry is Current Candle is Green
                    </p>
                    <p
                      className={`${
                        data.EntryCASE1.EntryIsLTPBwCloseAndEntryPoint === true
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      Entry is LTP B/w Close and Entry Point
                    </p>
                    <p
                      className={`${
                        data.EntryCASE1.EntryIsLtpGreaterThenClose === true
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      Entry is LTP Greater then Close
                    </p>
                    <p
                      className={`${
                        data.EntryCASE1.EntryIsMA1GreaterThenMA2 === true
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      Entry is MA1 Greater MA2
                    </p>
                    <p
                      className={`${
                        data.EntryCASE1.EntryIsPrevCandleGreen === true
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      Entry is Prev Candle Green
                    </p>
                    <p
                      className={`${
                        data.EntryCASE1.EntryMasterTrend === true
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      Entry Master Trend
                    </p>
                    <p
                      className={`${
                        data.EntryCASE1.EntryOwnTrend === true
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      Entry Own Trend
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-around mt-3">
            <div>
              {data?.ExitCASE1 && (
                <>
                  <DialogTitle>Exit Case Condition 1</DialogTitle>
                  <div>
                    <p
                      className={`${
                        data.ExitCASE1.IsLTPmoreThenCloseAndMinProfitExit ===
                        true
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      Is LTP more than close and Min Profit Exit
                    </p>
                  </div>
                </>
              )}
            </div>

            <div>
              {data.ExitCASE1 && (
                <>
                  <DialogTitle>Exit Case Condition 2</DialogTitle>
                  <div>
                    <p
                      className={`${
                        data.ExitCASE1.MA1LessThenMA2Exit === true
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      MA1 less then MA2 Exit
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
export default ConditionModal;
