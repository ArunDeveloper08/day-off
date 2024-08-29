import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Typography from "@mui/material/Typography";
import { debounce } from "@mui/material/utils";
import { useDataContext } from "@/providers/data-provider";
import axios from "axios";
import { ANGEL_BASE_URL_LOCAL } from "@/lib/constants";
export default function CustomAutocomplete() {
  const { contextData, setContextData } = useDataContext();
  const [value, setValue] = React.useState(contextData.symbolDetails || null);
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState([]);

  const fetch = React.useMemo(
    () =>
      debounce(async (request, callback) => {
        try {
          const response = await axios.post(
            `${ANGEL_BASE_URL_LOCAL}/api/v1/instrument/getOptionAndEquity`,
            {
              symbol: request.input,
            }
          );
          callback(response.data.data);
        } catch (error) {
          console.error("Error fetching data:", error);
          callback([]);
        }
      }, 400),
    []
  );

  React.useEffect(() => {
    let active = true;

    if (inputValue === "") {
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
      sx={{ width: 300 }}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.symbol
      }
      filterOptions={(x) => x}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={value}
      disableClearable
      noOptionsText="No trade Found"
      onChange={(event, newValue) => {
        console.log({ newValue });
        setOptions(newValue ? [newValue, ...options] : options);
        setValue(newValue);
        setContextData((p) => ({
          ...p,
          symbolDetails: newValue,
        }));
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label="Select a Trade" fullWidth />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.symbol}>
          <Typography
            variant="body2"
            sx={{ color: "text.primary", paddingY: "3px" }}>
            {option.symbol}
          </Typography>
        </li>
      )}
    />
  );
}
