import React, { Fragment, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { ANGEL_BASE_URL_LOCAL, BASE_URL_OVERALL } from "@/lib/constants";
import { TextField, Autocomplete, Grid, Typography } from "@mui/material";
import { debounce } from "lodash";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const IdentifierLooserGainer = () => {
  const [prevDate, setPrevDate] = useState([]);
  const [logDate, setLogDate] = useState("");
  const [values, setValues] = useState({
    tradingsymbol: "",
  });
  const [data, setData] = useState([]);
  // const getPrevDate = async () => {
  //   try {
  //     const response = await axios.get(
  //       `${ANGEL_BASE_URL_LOCAL}/api/v1/logs/getPrevDate`
  //     );
  //     setPrevDate(response.data.data); // Assuming the response contains `prevDate`
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // useEffect(() => {
  //   getPrevDate();
  // }, []);

  const handleChangeSymbol = (value) => {
    if (value === null) {
      setValues((prev) => ({
        ...prev,
        tradingsymbol: null,
      }));
      return;
    }
    setValues((prev) => ({
      ...prev,
      tradingsymbol: value.tradingsymbol,
    }));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    axios
      .post(`${BASE_URL_OVERALL}/log`, {
        tradingSymbol: values.tradingsymbol,
      })
      .then((res) => {
        setData(res?.data?.data);
      })
      .catch((err) => {
        console.log(err);
        alert(err.response.data.message);
      });
  };
  // console.log("data",data)

  return (
    <Fragment>
      <div className="flex justify-around m-3 items-center">
        <div className="ml-3 w-[300px]">
          {/* <Label>Trading  Symbol</Label> */}

          {/* <Input
            name="symbolToken"
            onChange={handleChange}
            value={values?.symbolToken}
            className="mt-1"
            type="text"
          /> */}
          <CustomAutocomplete
            value={values?.tradingsymbol}
            onChangeFunction={handleChangeSymbol}
          />
        </div>
        <div className="flex items-center">
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </div>
      <table className="w-fit mx-auto mb-20">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-1 border border-gray-300 ">Sr No.</th>
            <th className="p-1 border border-gray-300">Date</th>
            <th className="p-1 border border-gray-300">symbol</th>
            <th className="p-1 border border-gray-300">Price Gainer</th>
            <th className="p-1 border border-gray-300">Long Built Up</th>
            <th className="p-1 border border-gray-300">OI Gainer</th>
            <th className="p-1 border border-gray-300">Short Covering</th>
            <th className="p-1 border border-gray-300">Price Looser</th>
            <th className="p-1 border border-gray-300">OI Looser</th>
            <th className="p-1 border border-gray-300">Short Built Up</th>
            <th className="p-1 border border-gray-300">Long Unwinding</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item, index) => {
            return (
              <tr>
                <td className="p-1 border border-gray-300 ">{index + 1}</td>
                <td className="p-1 border border-gray-300 ">{item.date}</td>
                <td className="p-1 border border-gray-300 ">
                  {item.tradingSymbol}
                </td>
                <td
                  className={`${
                    item.TopPriceGainers_percentChange
                      ? "text-green-500 font-bold p-1 border border-gray-300"
                      : " p-1 border border-gray-300"
                  }`}
                >
                  {item.TopPriceGainers_percentChange ?? "NULL"}
                </td>
                <td
                  className={`${
                    item.LongBuildUps_percentChange
                      ? "text-green-500 font-bold p-1 border border-gray-300"
                      : " p-1 border border-gray-300"
                  }`}
                >
                  {item.LongBuildUps_percentChange ?? "NULL"}
                </td>
                <td
                  className={`${
                    item.TopOiGainers_percentChange
                      ? "text-green-500 font-bold p-1 border border-gray-300"
                      : " p-1 border border-gray-300"
                  }`}
                >
                  {item.TopOiGainers_percentChange ?? "NULL"}
                </td>
                <td
                  className={`${
                    item.ShortCoverings_percentChange
                      ? "text-green-500 font-bold p-1 border border-gray-300"
                      : " p-1 border border-gray-300"
                  }`}
                >
                  {item.ShortCoverings_percentChange ?? "NULL"}
                </td>
                <td
                  className={`${
                    item.TopPriceLoosers_percentChange
                      ? "text-green-500 font-bold p-1 border border-gray-300"
                      : " p-1 border border-gray-300"
                  }`}
                >
                  {item.TopPriceLoosers_percentChange ?? "NULL"}
                </td>
                <td
                  className={`${
                    item.TopOiLoosers_percentChange
                      ? "text-green-500 font-bold p-1 border border-gray-300"
                      : " p-1 border border-gray-300"
                  }`}
                >
                  {item.TopOiLoosers_percentChange ?? "NULL"}
                </td>
                <td
                  className={`${
                    item.ShortBuildUps_percentChange
                      ? "text-green-500 font-bold p-1 border border-gray-300"
                      : " p-1 border border-gray-300"
                  }`}
                >
                  {item.ShortBuildUps_percentChange ?? "NULL"}
                </td>
                <td
                  className={`${
                    item.LongUnwindings_percentChange
                      ? "text-green-500 font-bold p-1 border border-gray-300"
                      : " p-1 border border-gray-300"
                  }`}
                >
                  {item.LongUnwindings_percentChange ?? "NULL"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Fragment>
  );
};

export default IdentifierLooserGainer;

async function fetchMyAPI(input) {
  try {
    const response = await axios.get(
      `${BASE_URL_OVERALL}/api/v1/instrument/getInstrument`,
      {
        params: {
          tradingsymbol: input.toUpperCase(),
          pageNumber: 1,
          pageSize: 100,
        },
      }
    );
    return response.data.data; // Adjust this to match the format of your API response
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

function CustomAutocomplete({ value: defaultValue, onChangeFunction }) {
  const [value, setValue] = React.useState(defaultValue);
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const fetch = React.useMemo(
    () =>
      debounce(async (request, callback) => {
        setLoading(true);
        const results = await fetchMyAPI(request.input);
        callback(results);
        setLoading(false);
      }, 400),
    []
  );

  React.useEffect(() => {
    let active = true;
    if (inputValue === " ") {
      setOptions(value ? [value] : []);
      return undefined;
    }

    fetch({ input: inputValue }, (results) => {
      if (active) {
        let newOptions = [];

        if (value) {
          newOptions = [value];
        }

        if (results) {
          newOptions = [...newOptions, ...results];
        }

        setOptions(newOptions);
      }
    });

    return () => {
      active = false;
    };
  }, [value, inputValue, fetch]);

  return (
    <Autocomplete
      id="custom-autocomplete"
      className="col-span-3 w-[100%] "
      options={options}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.tradingsymbol
      }
      autoComplete
      includeInputInList
      filterSelectedOptions
      disableClearable
      disablePortal // Forces the dropdown to be rendered within the DOM hierarchy, ensuring correct event handling
      value={value}
      noOptionsText={loading ? "Loading..." : "No Trade Options"}
      onChange={(event, newValue) => {
        setValue(newValue);
        onChangeFunction(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label="Select New Trade Index" fullWidth />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.tradingsymbol}>
          <Typography variant="body2" sx={{ paddingY: "3px" }}>
            {option.tradingsymbol}
          </Typography>
        </li>
      )}
    />
  );
}
