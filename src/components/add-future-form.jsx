import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash } from "lucide-react";
import axios from "axios";
import { useConfig } from "@/hooks/use-config";
const initialState = {
  symbol: "",
  instrument_token: "",
  priName: "",
  secName: "",
};
const AddFutureForm = ({ getFutureList, futureList }) => {
  const { config, tradeConfig } = useConfig();
  const [values, setValues] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };
  // console.log(tradeConfig)
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${tradeConfig.url}/setting/addFutOpt`,
        {
          ...values,
        }
      );
      console.log(data);
    } catch (error) {
      console.log("Error", error);
    } finally {
      getFutureList();
      setLoading(false);
      setValues(initialState);
    }
  };
  const deleteFuture = async (id) => {
    let isConfirm = confirm("This future will be deleted permanently !" + id);
    if (isConfirm) {
      setLoading(true);
      try {
        const { data } = await axios.delete(
          `${tradeConfig.url}/setting/delFutOpt?id=${id}`
        );
        alert(data.message);
      } catch (error) {
        alert("Some Error Occured" + error.message);
      } finally {
        getFutureList();
        setLoading(false);
      }
    }
  };
  return (
    <>
      <section className="flex justify-between items-end gap-x-2 p-1">
        <div className="flex-1">
          <Label>Primary Future</Label>
          <Input
            onChange={onChange}
            disabled={loading}
            name="priName"
            value={values.priName}
            placeholder="Primary Name"
            className="mt-1"
            type="text"
          />
        </div>
        <div className="flex-1">
          <Label>Secondary Future</Label>
          <Input
            onChange={onChange}
            disabled={loading}
            value={values.secName}
            name="secName"
            placeholder="Secondary Name"
            className="mt-1"
            type="text"
          />
        </div>
        <div className="w-[150px]">
          <Label>Symbol</Label>
          <Input
            onChange={onChange}
            value={values.symbol}
            name="symbol"
            placeholder="Symbol"
            disabled={loading}
            className="mt-1"
            type="text"
          />
        </div>
        <div className="w-[150px]">
          <Label>Token</Label>
          <Input
            onChange={onChange}
            value={values.instrument_token}
            placeholder="token"
            disabled={loading}
            name="instrument_token"
            className="mt-1"
            type="text"
          />
        </div>
        <div>
          <Button disabled={loading} onClick={handleSubmit} className="px-5">
            Add
          </Button>
        </div>
      </section>
      <table border="1" className="w-full my-5 border-collapse">
        <thead>
          <tr>
            <th>Sr No.</th>
            <th>Primary</th>
            <th>Secondary</th>
            <th>Symbol</th>
            <th>Instrument Token</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {futureList?.map((future, i) => (
            <tr key={i}>
              <td className="text-center">{i + 1}</td>
              <td>{future.priName}</td>
              <td>{future.secName}</td>
              <td>{future.symbol}</td>
              <td>{future.instrument_token}</td>
              <td>
                <Button
                  disabled={loading}
                  onClick={() => deleteFuture(future.id)}
                  className="py-[5px] h-fit text-xs"
                  size="sm">
                  Delete &nbsp;
                  <Trash className="w-3 h-3" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default AddFutureForm;
