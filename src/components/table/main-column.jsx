// import { format } from "date-fns";

export const mainColumns = [
  {
    // id: "id",
    accessorKey: "id",
    header: "Id",
    cell: ({ row, index }) => {
      console.log(row);
      return <p>{Number(row.id) + 1}</p>;
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "tradingsymbol",
    header: "Trading Symbol",
  },
  {
    // id: "exchange",
    accessorKey: "exchange",
    header: "Exchange",
  },
  {
    accessorKey: "lot_size",
    header: "Lot Size",
  },
  {
    accessorKey: "expiry",
    header: "Expiry Date",
  },
  {
    accessorKey: "exchange_token",
    header: "Exchange Token",
  },
  {
    accessorKey: "instrument_type",
    header: "Instrument Type",
  },
  {
    accessorKey: "instrument_token",
    header: "Instrument Token",
  },
  {
    accessorKey: "segment",
    header: "Segment",
  },
];

// {
//     "instrument_token": 259909382,
//     "exchange_token": 1015271,
//     "tradingsymbol": "EURINR24MAYFUT",
//     "name": "EURINR",
//     "last_price": 0,
//     "expiry": "2024-05-29",
//     "strike": 0,
//     "tick_size": 0.0025,
//     "lot_size": 1,
//     "instrument_type": "FUT",
//     "segment": "BCD-FUT",
//     "exchange": "BCD"
// },
