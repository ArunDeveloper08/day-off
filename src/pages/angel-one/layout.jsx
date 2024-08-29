import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomAutocomplete from "./custom-autocomplete";
import { useDataContext } from "@/providers/data-provider";
import axios from "axios";
import { ANGEL_BASE_URL_LOCAL } from "@/lib/constants.js";
import { InputLabel, MenuItem, Select } from "@mui/material";
const AngelOneLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  let currRoute = location.pathname.split("/")[3];
  console.log(currRoute);
  useEffect(() => {
    currRoute = location.pathname.split("/")[3];
  }, [location.pathname]);
  return (
    <div>
      <HeaderComponent />
      <Tabs
        // onValueChange={(value) => navigate(`/future/angel-one/${value}`)}
        onValueChange={(value) => navigate(`/future/angel-one/${value}`, {
          replace:true
        })}
        value={currRoute}
        defaultValue={currRoute}
        className="w-full h-screen"
      >
        <TabsList className="w-full border-b-2 border-gray-500">
          <TabsTrigger
            className="w-full data-[state=active]:bg-green-300 py-2"
            value="gainer-looser"
          >
            Gainer/Looser
          </TabsTrigger>
          <TabsTrigger
            className="w-full data-[state=active]:bg-green-300 py-2"
            value="option-greek"
          >
            Option Greek
          </TabsTrigger>
          <TabsTrigger
            className="w-full data-[state=active]:bg-green-300 py-2"
            value="other"
          >
            Other Page
          </TabsTrigger>
        </TabsList>
        <Outlet />
      </Tabs>
    </div>
  );
};

export default AngelOneLayout;

const HeaderComponent = () => {
  return (
    <div className="flex gap-x-5 pt-3">
      <CustomAutocomplete />
      <SelectComponent />
    </div>
  );
};

const SelectComponent = () => {
  const { contextData, setContextData } = useDataContext();
  const [expiries, setExpiries] = useState([]);
  const [value, setValue] = useState(contextData.expiry || "");
  console.log(contextData);
  const getOptionExpiry = async () => {
    const { data } = await axios.post(
      `${ANGEL_BASE_URL_LOCAL}/api/v1/instrument/getOptionExpiry`,
      {
        symbol: contextData.symbol,
      }
    );
    console.log(data.data);
    setExpiries(data.data || []);
    setValue(data.data[0]);
    setContextData((p) => ({ ...p, expiry: data.data[0] }));
  };
  useEffect(() => {
    if (contextData.symbol) {
      getOptionExpiry();
    }
  }, [contextData.symbol]);
  return (
    <>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={value}
        label="Expiry"
        onChange={(e) => {
          setValue(e.target.value);
          setContextData((p) => ({ ...p, expiry: e.target.value }));
        }}
      >
        {expiries.map((item) => {
          return (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          );
        })}
      </Select>
    </>
  );
};
