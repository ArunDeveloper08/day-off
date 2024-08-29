import React, { useEffect, useState } from "react";
import { mainColumns } from "./main-column.jsx";
import { useReactTable } from "@tanstack/react-table";
import { useLocation, useNavigate } from "react-router-dom";
import { getCoreRowModel } from "@tanstack/react-table";
import qs from "query-string";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
// import { useDispatch } from "react-redux";

// import { getAllInventory } from "../../redux/thunk/inventoryThunk.ts";
// import { useAppSelector } from "../../redux/store.ts";


import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
// import { Button } from "../ui/button.tsx";
// import {
//   ChevronLeft,
//   ChevronRight,
//   ChevronsLeft,
//   ChevronsRight,
//   RefreshCcw,
// } from "lucide-react";
// @enable-css-reset: false;

// import { cn } from "@/lib/utils.tsx";
import { DataTable } from "../data-table.jsx";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileDown,
  RefreshCcw,
} from "lucide-react";
import { Button } from "../ui/button.jsx";
import { cn } from "@/lib/utils.js";
import DebouncedInput from "../ui/debounced-input.jsx";
import { useConfig } from "@/hooks/use-config.js";
import { BASE_URL_OVERALL } from "@/lib/constants.js";

const pageSize = [5, 10, 20, 50, 100, 250, 500, 1000];
const emptyArray = { data: [] };
const initialState = {
  pageSize: pageSize[1],
  pageNumber: 1,
  name: "",
  tradingsymbol: "",
  exchange: "",
  lot_size: "",
  sortBy: "",
  sortDir: "",
  instrument_type: "",
};
const MainTable = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialQuery = () => {
    const params = new URLSearchParams(location.search);
    console.log(params.get("name"));
    return {
      pageSize: params.get("pageSize") || initialState.pageSize,
      pageNumber: params.get("pageNumber") || initialState.pageNumber,
      name: params.get("name") || initialState.name,
      tradingsymbol: params.get("tradingsymbol") || initialState.tradingsymbol,
      exchange: params.get("exchange") || initialState.exchange,
      instrument_type:
        params.get("instrument_type") || initialState.instrument_type,
      lot_size: params.get("lot_size") || initialState.lot_size,
      sortBy: params.get("sortBy") || initialState.sortBy,
      sortDir: Number(params.get("sortDir")) || initialState.sortDir,
    };
  };
  const [tableData, setTableData] = useState(emptyArray);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(getInitialQuery);
  const { config, tradeConfig } = useConfig();
  const updateURL = () => {
    const params = new URLSearchParams(query).toString();
    // console.log(query, params);
    navigate(`?${params}`, { replace: true });
  };
  const table = useReactTable({
    data: tableData.data,
    columns: mainColumns,
    getCoreRowModel: getCoreRowModel(),
    // onRowSelectionChange: setRowSelection,
  });
  // const dispatch = useDispatch();
  const getData = async () => {
    setLoading(true);
    try {
      const url = qs.stringifyUrl(
        {
          url: `${BASE_URL_OVERALL}/instrument/get`,
          query,
        },
        { skipNull: true, skipEmptyString: true }
      );
      const { data } = await axios.get(url);
      setTableData(data);
      // console.log(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getData();
    updateURL();
  }, [query]);
  // useEffect(() => {
  //   setQuery((prev) => ({
  //     ...initialState,
  //     category: prev.category,
  //   }));
  // }, [query.category]);
  const handleChangeQuery = (name, value) => {
    setQuery({ ...query, [name]: value, pageNumber: 1 });
  };
  const handlePageChange = (type) => {
    if (type === "prev") {
      if (query.pageNumber <= 1) return;
      setQuery((p) => ({ ...p, pageNumber: Number(p.pageNumber) - 1 }));
    } else if (type === "next") {
      setQuery((p) => ({ ...p, pageNumber: Number(p.pageNumber) + 1 }));
    } else if (type === "first") {
      setQuery((p) => ({ ...p, pageNumber: 1 }));
    } else if (type === "last") {
      setQuery((p) => ({
        ...p,
        pageNumber: Math.ceil(tableData.totalItems / p.pageSize),
      }));
    }
    // if (type === "first") {
    //   setQuery({ ...query, pageNumber: 1 });
    // } else if (type === "prev") {
    //   setQuery((prev) => ({ ...query, pageNumber: prev.pageNumber - 1 }));
    // } else if (type === "next") {
    //   setQuery((prev) => ({ ...query, pageNumber: prev.pageNumber + 1 }));
    // } else if (type === "last") {
    //   setQuery({ ...query, pageNumber: details.lastPage });
    // }
  };
  // console.log(rowSelection);
  // console.log("Hello");
  // for handling the submit button
  const handleResetDataOnServer = async () => {
    const isConfirm = confirm(
      "Are you sure You want to update data on Server ?"
    );
    if (!isConfirm) return;
    setLoading(true);
    try {
      await axios.get(
        `${BASE_URL_OVERALL}/api/v1/instrument/update`
      );
      // update the latest data
      setQuery(initialState);
      alert("Updated Succesfully Data on Server !");
    } catch (error) {
      alert("Error " + error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = () => {
    // const newObj = { ...rowSelection };
    // const resultArray = Object.keys(newObj).map((key) => {
    //   const [serialNo, productType] = key.split(" ");
    //   return {
    //     productType,
    //     productSrNo: parseInt(serialNo),
    //   };
    // });
    // dispatch(
    //   openModal({
    //     data: {
    //       resultArray,
    //       setRowSelection,
    //       getNewData: () => dispatch(getAllInventory(query)),
    //     },
    //     type: "inventoryModal",
    //   })
    // );
    // console.log(resultArray);
  };
  return (
    <div className="mx-2">
      {/* Filters  */}
      <div className="flex py-3 items-center gap-x-2">
        <DebouncedInput
          value={query.name}
          disabled={loading}
          onChange={(value) => handleChangeQuery("name", value)}
          debounce={1000}
          placeholder="Search By Name"
          className="w-[300px]"
        />
        <DebouncedInput
          value={query.lot_size}
          disabled={loading}
          onChange={(value) => handleChangeQuery("lot_size", value)}
          debounce={1000}
          placeholder="Lot Size"
          className="w-[150px]"
        />
        <DebouncedInput
          value={query.tradingsymbol}
          disabled={loading}
          onChange={(value) => handleChangeQuery("tradingsymbol", value)}
          debounce={1000}
          placeholder="Trading Symbol"
          className="w-[250px]"
        />
        <DebouncedInput
          disabled={loading}
          value={query.exchange}
          onChange={(value) => handleChangeQuery("exchange", value)}
          debounce={1000}
          placeholder="Exchange"
          className="w-[250px]"
        />
        <DebouncedInput
          value={query.instrument_type}
          disabled={loading}
          onChange={(value) => handleChangeQuery("instrument_type", value)}
          debounce={1000}
          placeholder="Instrument Type"
          className="w-[150px]"
        />
        <Button
          disabled={loading}
          onClick={() => setQuery(initialState)}
          className="gap-x-2 "
        >
          <p> Reset</p>
          <RefreshCcw className={cn("w-4 h-4 ", loading && "animate-spin")} />
        </Button>
        <Select
          disabled={loading}
          value={parseInt(query.pageSize)}
          onValueChange={(e) => handleChangeQuery("pageSize", e)}
        >
          <SelectTrigger className="w-[80px] col-span-2">
            <SelectValue placeholder="Rows" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Rows</SelectLabel>
              {pageSize.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          disabled={loading}
          onClick={() => convertJsonToExcel(tableData.data)}
          className="gap-x-2 "
        >
          <FileDown className={cn("w-4 h-4")} />
        </Button>
        <Button
          size="sm"
          disabled={loading}
          onClick={handleResetDataOnServer}
          className="gap-x-2 "
        >
          Reset Data on Server
        </Button>
        {/*
            <Select
            value={query.category}
            onValueChange={(e) => handleChangeQuery("category", e)}>
            <SelectTrigger className="text-black ring-2 ring-gray-700 focus:ring-black col-span-2">
              <SelectValue placeholder="Product Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Products</SelectLabel>
                {ProductList.map(([view, value]) => (
                  <SelectItem className="text-black" key={value} value={value}>
                    {view}
                    {` (${inventoryCount?.ProductTypeArray?.[value] ?? ""})`}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <DebouncedInput
            placeholder={`Serial No.`}
            value={query.Meter_Serial_No}
            onChange={(e) => handleChangeQuery("Meter_Serial_No", e)}
            className="col-span-2 text-black ring-2 ring-gray-700  focus:!outline-black "
          />
          <Select onValueChange={(e) => handleChangeQuery("sortBy", e)}>
            <SelectTrigger className="text-black ring-2 ring-gray-700 focus:ring-black col-span-2">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort By</SelectLabel>
                {Object.entries(sort).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {key}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <DatePickerWithRange
            onChange={(data) => handleChangeQuery("date", data)}
            className="border-2 col-span-3 rounded-md border-black"
          />
          <div className="text-sm col-span-2 font-semibold">
            Total Rows: {details?.totalCount}
          </div>
          <Button onClick={() => dispatch(getAllInventory(query))} size="icon">
            <RefreshCcw className={cn("w-4 h-4 ", loading && "animate-spin")} />
          </Button>
        */}
      </div>
      {/* Table  */}
      <div>
        <DataTable key="main-table" table={table} columns={mainColumns} />
      </div>
      {/* Pagination  */}
      <section className="flex justify-between pt-2 relative">
        <p></p>
        {/* <div>
          {!!Object.keys(rowSelection).length && (
            <Badge
              badgeContent={Object.keys(rowSelection).length}
              color="error">
              <Button onClick={handleSubmit}>Submit</Button>
            </Badge>
          )}
        </div> */}
        <div className="flex gap-x-3">
          <Button
            onClick={() => handlePageChange("first")}
            // disabled={!details.hasPreviousPage}
            variant="outline"
            className="py-0 px-4 disabled:border-0 border-2 border-black"
          >
            <ChevronsLeft className="w-4 h-4 p-0 m-0" />
          </Button>
          <Button
            onClick={() => handlePageChange("prev")}
            // disabled={!details.hasPreviousPage}
            variant="outline"
            className="py-0 px-4 disabled:border-0 border-2 border-black"
          >
            <ChevronLeft className="w-4 h-4 p-0 m-0" />
          </Button>
          <Button
            onClick={() => handlePageChange("next")}
            // disabled={!details.hasNextPage}
            variant="outline"
            className="py-0 px-4 disabled:border-0 border-2 border-black"
          >
            <ChevronRight className="w-4 h-4 p-0 m-0" />
          </Button>
          <Button
            onClick={() => handlePageChange("last")}
            // disabled={!details.hasNextPage}
            variant="outline"
            className="py-0 px-4 disabled:border-0 border-2 border-black"
          >
            <ChevronsRight className="w-4 h-4 p-0 m-0" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default MainTable;

const convertJsonToExcel = (jsonData) => {
  // Create a new workbook
  const isConfirm = confirm(
    "An excel file will be start to download on Confirm!"
  );
  if (!isConfirm) return;
  const wb = XLSX.utils.book_new();

  // Convert JSON data to worksheet
  const ws = XLSX.utils.json_to_sheet(jsonData);

  // Append worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // Generate buffer
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  // Save file
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), "data.xlsx");
};
