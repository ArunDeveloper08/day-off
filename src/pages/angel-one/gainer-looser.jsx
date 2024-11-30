import { ANGEL_BASE_URL, ANGEL_BASE_URL_LOCAL } from "@/lib/constants";
import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
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

const GainerLosser = () => {
  const [value, setValue] = useState(false);
  const [error, setError] = useState("");
  const [prevDate, setPrevDate] = useState([]);
  const [logDate, setLogDate] = useState("");
  // console.log("loosergainer")

  const getPrevDate = async () => {
    try {
      const response = await axios.get(
        `${ANGEL_BASE_URL_LOCAL}/api/v1/logs/getPrevDate`
      );
      setPrevDate(response.data.data); // Assuming the response contains `prevDate`
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPrevDate();
  }, []);
  // console.log(prevDate)

  return (
    <div>
      <div>
        {error && (
          <p className="text-red-500 text-[23px] text-center">{error}</p>
        )}
        <div className="ml-3">
          {/* <select
            className="border-[1px] border-black w-[250px] m-3 p-1 rounded-sm"
            onChange={(e) => setLogDate(e.target.value)}
          >
            <option value="currentDate">Current Date</option>
            {prevDate?.map((item, index) => (
              <option key={index} value={item.date}>
                {item.date}
              </option>
            ))}
          </select> */}
          <Label>Log Date</Label>
          <Select
            // disabled={loading}
            value={logDate}
            onValueChange={(value) => setLogDate(value)}
          >
            <SelectTrigger className="w-[250px] mt-1 border-zinc-500">
              <SelectValue>{logDate}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Date</SelectLabel>
                <SelectItem value="currentDate">Current Date</SelectItem>
                {prevDate?.map((suggestion) => (
                  <SelectItem key={suggestion.date} value={suggestion.date}>
                    {suggestion.date}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {!logDate ? (
          <p className="text-xl font-bold text-center">
            Table for top Price Gainers:{" "}
            {moment().format("DD-MMM-yyyy hh:mm:ss")}
          </p>
        ) : (
          <p className="text-xl font-bold text-center">
            Table for top Price Gainers: {logDate}
          </p>
        )}

        <TableByPrice setValue={setValue} logDate={logDate} />
      </div>
      <div>
        {!logDate ? (
          <p className="text-xl font-bold text-center">
            Table for top OI Gainers: {moment().format("DD-MMM-yyyy hh:mm:ss")}
          </p>
        ) : (
          <p className="text-xl font-bold text-center">
            Table for top OI Gainers: {logDate}
          </p>
        )}
        {value && <TableByOI logDate={logDate} />}
      </div>
      <div>
        <PCRTable logDate={logDate} />
        {/* <BuilUpTable /> */}
      </div>
    </div>
  );
};
export default GainerLosser;

const TableByOI = ({ logDate }) => {
  const ANGEL_URI = `${ANGEL_BASE_URL_LOCAL}/api/v1/logs/get`;
  const [gainer, setGainer] = useState([]);
  const [looser, setLooser] = useState([]);
  const [error, setError] = useState("");
  const getGainerData = async () => {
    const { data } = await axios.post(
      ANGEL_URI,
      {
        datatype: { datatype: "PercOIGainers", expirytype: "NEAR" },
        date: logDate,
      }
      // { headers: headers }
    );
    if (data.status) {
      setGainer(data.data);
    } else {
      setError(data.message);
    }
    return "hello";
  };
  const getLooserData = async () => {
    const { data } = await axios.post(
      ANGEL_URI,
      {
        datatype: { datatype: "PercOILosers", expirytype: "NEAR" },
        date: logDate,
      }
      // { headers: headers }
    );
    if (data.status) {
      setLooser(data.data);
    } else {
      setError(data.message);
    }
    return data;
  };
  useEffect(() => {
    getGainerData().then(() => {
      setTimeout(() => {
        getLooserData();
      }, 1000);
    });
    let timeout = setInterval(() => {
      getGainerData().then(() => {
        setTimeout(() => {
          getLooserData();
        }, 1000);
      });
    }, 60 * 1000);
    return () => clearInterval(timeout);
  }, [logDate]);

  return (
    <div>
      <div className="flex justify-between mx-10">
        <div>
          <p className="text-center text-xl font-semibold text-green-500">
            Gainer
          </p>
          <table>
            <thead className="bg-gray-700 text-gray-200">
              <tr>
                <th>Trading Symbol</th>
                <th>Symbol Token</th>
                <th>OI</th>
                <th>COI</th>
                <th>Percent Change</th>
              </tr>
            </thead>
            <tbody>
              {gainer?.map((item, ind) => (
                <tr key={ind}>
                  <td>{item.tradingSymbol}</td>
                  <td>{item.symbolToken}</td>
                  <td>{item.opnInterest}</td>
                  <td>{item.netChangeOpnInterest}</td>
                  <td>{item.percentChange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Looser  */}
        <div>
          <p className="text-center text-xl font-semibold text-red-500">
            LOOSER
          </p>
          <table>
            <thead className="bg-gray-700 text-gray-200">
              <tr>
                <th>Trading Symbol</th>
                <th>Symbol Token</th>
                <th>OI</th>
                <th>COI</th>
                <th>Percent Change</th>
              </tr>
            </thead>
            <tbody>
              {looser?.map((item, ind) => (
                <tr key={ind}>
                  <td>{item.tradingSymbol}</td>
                  <td>{item.symbolToken}</td>
                  <td>{item.opnInterest}</td>
                  <td>{item.netChangeOpnInterest}</td>
                  <td>{item.percentChange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
const TableByPrice = ({ setValue, logDate }) => {
  const ANGEL_URI = `${ANGEL_BASE_URL_LOCAL}/api/v1/logs/get`;
  const [gainer, setGainer] = useState([]);
  const [looser, setLooser] = useState([]);
  const [error, setError] = useState("");
  const getGainerData = async () => {
    const { data } = await axios.post(
      ANGEL_URI,
      {
        datatype: { datatype: "PercPriceGainers", expirytype: "NEAR" },
        date: logDate,
      }
      // { headers: headers }
    );
    // if (data.status) {
    setGainer(data.data);
    // } else {
    //   setError(data.message);
    // }
    // return "hehe";
  };
  const getLooserData = async () => {
    const { data } = await axios.post(
      ANGEL_URI,
      // { datatype: "PercPriceLosers", expirytype: "NEAR" }
      // { headers: headers }
      {
        datatype: { datatype: "PercPriceLosers", expirytype: "NEAR" },
        date: logDate,
      }
    );
    // if (data.status) {
    setLooser(data.data);
    setTimeout(() => {
      setValue(true);
    }, 2000);
    // } else {
    //   setError(data.message);
    // }
    // return data;
  };
  useEffect(() => {
    getGainerData().then(() => {
      setTimeout(() => {
        getLooserData();
      }, 1000);
    });
    let timeout = setTimeout(() => {
      setValue(false);
      getGainerData().then(() => {
        setTimeout(() => {
          getLooserData();
        }, 1000);
      }, 60 * 1000);
    });
    return () => clearTimeout(timeout);
  }, [logDate]);
  return (
    <div>
      <div className="flex justify-between mx-10">
        {/* Gainer  */}
        <div>
          <p className="text-center text-xl font-semibold text-green-500">
            Gainer
          </p>
          <table>
            <thead className="bg-gray-700 text-gray-200">
              <tr>
                <th>Trading Symbol</th>
                <th>Symbol Token</th>
                <th>LTP</th>
                <th>NetChange</th>
                <th>Percent Change</th>
              </tr>
            </thead>
            <tbody>
              {gainer &&
                gainer?.map((item, ind) => (
                  <tr key={ind}>
                    <td>{item.tradingSymbol}</td>
                    <td>{item.symbolToken}</td>
                    <td>{item.ltp}</td>
                    <td>{item.netChange}</td>
                    <td>{item.percentChange}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {/* Looser  */}
        <div>
          <p className="text-center text-xl font-semibold text-red-500">
            LOOSER
          </p>
          <table>
            <thead className="bg-gray-700 text-gray-200">
              <tr>
                <th>Trading Symbol</th>
                <th>Symbol Token</th>
                <th>LTP</th>
                <th>Net Change</th>
                <th>Percent Change</th>
              </tr>
            </thead>
            <tbody>
              { looser && looser?.map((item, ind) => (
                <tr key={ind}>
                  <td>{item.tradingSymbol}</td>
                  <td>{item.symbolToken}</td>
                  <td>{item.ltp}</td>
                  <td>{item.netChange}</td>
                  <td>{item.percentChange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PCRTable = ({ logDate }) => {
  const [pcr, setPCR] = useState([]);
  const [error, setError] = useState("");
  const ANGEL_URI_PCR = `${ANGEL_BASE_URL_LOCAL}/api/v1/logs/get`;

  const getPCR = async () => {
    const { data } = await axios.post(
      ANGEL_URI_PCR,
      { datatype: { datatype: "putCallRatio", expirytype: "NEAR" } }
      //  { headers }
    );
    if (!data.status) {
      setError(data.message);
      return;
    }
    setPCR(data.data || []);
    console.log(data);
  };

  useEffect(() => {
    getPCR();
  }, []);

  return (
    <div className="flex gap-10 flex-wrap justify-around">
      <BuilUpTable logDate={logDate} />
      <div>
        {!logDate && (
          <p className="text-center font-bold text-xl">
            PCR Table Data:{moment().format("DD-MMM-yyyy hh:mm:ss")}
          </p>
        )}
        {logDate && (
          <p className="text-center font-bold text-xl">
            PCR Table Data:{logDate}
          </p>
        )}
        <table>
          <thead className="bg-gray-700 text-gray-200">
            <tr>
              <th>Trading Symbol</th>
              <th>PCR Ratio</th>
            </tr>
          </thead>
          <tbody>
            {pcr?.splice(0, 10)?.map((item, ind) => (
              <tr key={ind}>
                <td>{item.tradingSymbol}</td>
                <td>{item.pcr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


const buildUpKeys = [
  { keys: "Long Built Up", message: "Price May go Up" },
  { keys: "Short Built Up", message: "Price May Go Down" },
  { keys: "Short Covering", message: "Price may go up" },
  { keys: "Long Unwinding", message: "Price may go down" },
];

const BuilUpTable = ({ logDate }) => {
  const ANGEL_URI_BUILD_UP = `${ANGEL_BASE_URL_LOCAL}/api/v1/logs/get`;
  const [buildUpData, setbuildupData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setbuildupData([]);
      for (const { keys, message } of buildUpKeys) {
        const { data } = await axios.post(ANGEL_URI_BUILD_UP, {
          datatype: {
            expirytype: "NEAR",
            datatype: keys,
          },
          date: logDate,
        });
        setbuildupData((prev) => [
          ...prev,
          {
            key: keys,
            message,
            data: data.data,
          },
        ]);
        // Wait for 1 second before the next iteration
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    };
    fetchData();
  }, [logDate]);

  // Split the buildUpData into pairs of two to create a grid structure
  const chunkedData = [];
  for (let i = 0; i < buildUpData.length; i += 2) {
    chunkedData?.push(buildUpData?.slice(i, i + 2));
  }

  return (
    <div>
      {chunkedData?.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-2 gap-4 mb-4 mt-4">
          {row.map((item, ind) => (
            <div key={ind}>
              {!logDate && (
                <p className="text-center font-bold text-xl">
                  {item.key} - {item.message}:{" "}
                  {moment().format("DD-MMM-yyyy hh:mm:ss")}
                </p>
              )}
              {logDate && (
                <p className="text-center font-bold text-xl">
                  {item.key} - {item.message}: {logDate}
                </p>
              )}
              <table key={item.key}>
                <thead className="bg-gray-700 text-gray-200">
                  <tr>
                    <th>Trading Symbol</th>
                    <th>Symbol Token</th>
                    <th>LTP</th>
                    <th>Price Change</th>
                    <th>Percent Change</th>
                    <th>OI</th>
                    <th>Net Change OI</th>
                  </tr>
                </thead>
                <tbody>
                  { item?.data && item?.data?.map((childItem, index) => (
                    <tr key={index}>
                      <td>{childItem.tradingSymbol}</td>
                      <td>{childItem.symbolToken}</td>
                      <td>{childItem.ltp}</td>
                      <td>{childItem.netChange}</td>
                      <td>{childItem.percentChange}</td>
                      <td>{childItem.opnInterest}</td>
                      <td>{childItem.netChangeOpnInterest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}; 

































// const buildUpKeys = [
//   { keys: "Long Built Up", message: "Price May go Up" },
//   { keys: "Short Built Up", message: "Price May Go Down" },
//   { keys: "Short Covering", message: "Price may go up" },
//   { keys: "Long Unwinding", message: "Price may go down" },
// ];
// const BuilUpTable = ({ logDate }) => {
//   const ANGEL_URI_BUILD_UP = `${ANGEL_BASE_URL_LOCAL}/api/v1/logs/get`;
//   const [buildUpData, setbuildupData] = useState([]);
//   useEffect(() => {
//     const fetchData = async () => {
//       for (const { keys, message } of buildUpKeys) {
//         const { data } = await axios.post(ANGEL_URI_BUILD_UP, {
//           datatype: {
//             expirytype: "NEAR",
//             datatype: keys,
//           },
//           date: logDate,
//         });
//         setbuildupData((prev) => [
//           ...prev,
//           {
//             key: keys,
//             message,
//             data: data.data,
//           },
//         ]);
//         // Wait for 1 second before the next iteration
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//       }
//     };
//     fetchData();
//   }, [logDate]);

//   return buildUpData.map((item, ind) => {
//     return (
//       // <div>
//         <div key={ind} className="grid grid-cols-2">
//           <div>
//             {!logDate && (
//               <p className="text-center font-bold text-xl">
//                 {item.key} - {item.message}:{" "}
//                 {moment().format("DD-MMM-yyyy hh:mm:ss")}
//               </p>
//             )}
//             {logDate && (
//               <p className="text-center font-bold text-xl">
//                 {item.key} - {item.message}: {logDate}
//               </p>
//             )}
//             <div>
//               <table key={item.key}>
//                 <thead className="bg-gray-700 text-gray-200">
//                   <tr>
//                     <th>Trading Symbol</th>
//                     <th>Symbol Token</th>
//                     <th>LTP</th>
//                     <th>Price Change</th>
//                     <th>Percent Change</th>
//                     <th>OI</th>
//                     <th>Net Change OI</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {item?.data &&
//                     item?.data?.map((childItem, ind) => {
//                       return (
//                         <tr key={ind}>
//                           <td>{childItem.tradingSymbol}</td>
//                           <td>{childItem.symbolToken}</td>
//                           <td>{childItem.ltp}</td>
//                           <td>{childItem.netChange}</td>
//                           <td>{childItem.percentChange}</td>
//                           <td>{childItem.opnInterest}</td>
//                           <td>{childItem.netChangeOpnInterest}</td>
//                         </tr>
//                       );
//                     })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       // </div>
//     );
//   });
// };

// import { ANGEL_BASE_URL, ANGEL_BASE_URL_LOCAL } from "@/lib/constants";
// import axios from "axios";
// import moment from "moment";
// import React, { useEffect, useState } from "react";

// const GainerLosser = () => {
//   const [value, setValue] = useState(false);
//   const [error, setError] = useState("");
//   return (
//     <div>
//       <div>
//         {error && (
//           <p className="text-red-500 text-[23px] text-center">{error}</p>
//         )}
//         <p className="text-xl font-bold text-center">
//           Table for top Price Gainers: {moment().format("DD-MMM-yyyy hh:mm:ss")}
//         </p>
//         <TableByPrice setValue={setValue} />
//       </div>
//       <div>
//         <p className="text-xl font-bold text-center">
//           Table for top OI Gainers: {moment().format("DD-MMM-yyyy hh:mm:ss")}
//         </p>
//         {value && <TableByOI />}
//       </div>
//       <div>
//         <PCRTable />
//         {/* <BuilUpTable /> */}
//       </div>
//     </div>
//   );
// };
// export default GainerLosser;

// const TableByOI = () => {
//   const ANGEL_URI = `${ANGEL_BASE_URL}/rest/secure/angelbroking/marketData/v1/gainersLosers`;
//   const [gainer, setGainer] = useState([]);
//   const [looser, setLooser] = useState([]);
//   const [error, setError] = useState("");
//   const getGainerData = async () => {
//     const { data } = await axios.post(
//       ANGEL_URI,
//       { datatype: "PercOIGainers", expirytype: "NEAR" }
//       // { headers: headers }
//     );
//     if (data.status) {
//       setGainer(data.data);
//     } else {
//       setError(data.message);
//     }
//     return "hello";
//   };
//   const getLooserData = async () => {
//     const { data } = await axios.post(
//       ANGEL_URI,
//       { datatype: "PercOILosers", expirytype: "NEAR" }
//       // { headers: headers }
//     );
//     if (data.status) {
//       setLooser(data.data);
//     } else {
//       setError(data.message);
//     }
//     return data;
//   };
//   useEffect(() => {
//     getGainerData().then(() => {
//       setTimeout(() => {
//         getLooserData();
//       }, 1000);
//     });
//     let timeout = setInterval(() => {
//       getGainerData().then(() => {
//         setTimeout(() => {
//           getLooserData();
//         }, 1000);
//       });
//     }, 60 * 1000);
//     return () => clearInterval(timeout);
//   }, []);

//   return (
//     <div>
//       <div className="flex justify-between mx-10">
//         <div>
//           <p className="text-center text-xl font-semibold text-green-500">
//             Gainer
//           </p>
//           <table>
//             <thead className="bg-gray-700 text-gray-200">
//               <tr>
//                 <th>Trading Symbol</th>
//                 <th>Symbol Token</th>
//                 <th>OI</th>
//                 <th>COI</th>
//                 <th>Percent Change</th>
//               </tr>
//             </thead>
//             <tbody>
//               {gainer?.map((item, ind) => (
//                 <tr key={ind}>
//                   <td>{item.tradingSymbol}</td>
//                   <td>{item.symbolToken}</td>
//                   <td>{item.opnInterest}</td>
//                   <td>{item.netChangeOpnInterest}</td>
//                   <td>{item.percentChange}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         {/* Looser  */}
//         <div>
//           <p className="text-center text-xl font-semibold text-red-500">
//             LOOSER
//           </p>
//           <table>
//             <thead className="bg-gray-700 text-gray-200">
//               <tr>
//                 <th>Trading Symbol</th>
//                 <th>Symbol Token</th>
//                 <th>OI</th>
//                 <th>COI</th>
//                 <th>Percent Change</th>
//               </tr>
//             </thead>
//             <tbody>
//               {looser?.map((item, ind) => (
//                 <tr key={ind}>
//                   <td>{item.tradingSymbol}</td>
//                   <td>{item.symbolToken}</td>
//                   <td>{item.opnInterest}</td>
//                   <td>{item.netChangeOpnInterest}</td>
//                   <td>{item.percentChange}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };
// const TableByPrice = ({ setValue }) => {
//   const ANGEL_URI = `${ANGEL_BASE_URL}/rest/secure/angelbroking/marketData/v1/gainersLosers`;
//   const [gainer, setGainer] = useState([]);
//   const [looser, setLooser] = useState([]);
//   const [error, setError] = useState("");
//   const getGainerData = async () => {
//     const { data } = await axios.post(
//       ANGEL_URI,
//       { datatype: "PercPriceGainers", expirytype: "NEAR" }
//       // { headers: headers }
//     );
//     if (data.status) {
//       setGainer(data.data);
//     } else {
//       setError(data.message);
//     }
//     return "hehe";
//   };
//   const getLooserData = async () => {
//     const { data } = await axios.post(
//       ANGEL_URI,
//       { datatype: "PercPriceLosers", expirytype: "NEAR" }
//       // { headers: headers }
//     );
//     if (data.status) {
//       setLooser(data.data);
//       setTimeout(() => {
//         setValue(true);
//       }, 1000);
//     } else {
//       setError(data.message);
//     }
//     return data;
//   };
//   useEffect(() => {
//     getGainerData().then(() => {
//       setTimeout(() => {
//         getLooserData();
//       }, 1000);
//     });
//     let timeout = setTimeout(() => {
//       getGainerData().then(() => {
//         setTimeout(() => {
//           getLooserData();
//         }, 1000);
//       }, 5 * 1000);
//     });
//     return () => clearTimeout(timeout);
//   }, []);
//   return (
//     <div>
//       <div className="flex justify-between mx-10">
//         {/* Gainer  */}
//         <div>
//           <p className="text-center text-xl font-semibold text-green-500">
//             Gainer
//           </p>
//           <table>
//             <thead className="bg-gray-700 text-gray-200">
//               <tr>
//                 <th>Trading Symbol</th>
//                 <th>Symbol Token</th>
//                 <th>LTP</th>
//                 <th>NetChange</th>
//                 <th>Percent Change</th>
//               </tr>
//             </thead>
//             <tbody>
//               {gainer.map((item, ind) => (
//                 <tr key={ind}>
//                   <td>{item.tradingSymbol}</td>
//                   <td>{item.symbolToken}</td>
//                   <td>{item.ltp}</td>
//                   <td>{item.netChange}</td>
//                   <td>{item.percentChange}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         {/* Looser  */}
//         <div>
//           <p className="text-center text-xl font-semibold text-red-500">
//             LOOSER
//           </p>
//           <table>
//             <thead className="bg-gray-700 text-gray-200">
//               <tr>
//                 <th>Trading Symbol</th>
//                 <th>Symbol Token</th>
//                 <th>LTP</th>
//                 <th>Net Change</th>
//                 <th>Percent Change</th>
//               </tr>
//             </thead>
//             <tbody>
//               {looser?.map((item, ind) => (
//                 <tr key={ind}>
//                   <td>{item.tradingSymbol}</td>
//                   <td>{item.symbolToken}</td>
//                   <td>{item.ltp}</td>
//                   <td>{item.netChange}</td>
//                   <td>{item.percentChange}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };
// const PCRTable = () => {
//   const [pcr, setPCR] = useState([]);
//   const [error, setError] = useState("");
//   const ANGEL_URI_PCR = `${ANGEL_BASE_URL}/rest/secure/angelbroking/marketData/v1/putCallRatio`;

//   const getPCR = async () => {
//     const { data } = await axios.get(
//       ANGEL_URI_PCR
//       //  { headers }
//     );
//     if (!data.status) {
//       setError(data.message);
//       return;
//     }
//     setPCR(data.data || []);
//     console.log(data);
//   };

//   useEffect(() => {
//     getPCR();
//   }, []);

//   return (
//     <div className="flex gap-10 flex-wrap justify-around">
//       <div>
//         <p className="text-center font-bold text-xl">
//           PCR Table Data:{moment().format("DD-MMM-yyyy hh:mm:ss")}
//         </p>
//         <table>
//           <thead className="bg-gray-700 text-gray-200">
//             <tr>
//               <th>Trading Symbol</th>
//               <th>PCR Ratio</th>
//             </tr>
//           </thead>
//           <tbody>
//             {pcr?.splice(0, 10)?.map((item, ind) => (
//               <tr key={ind}>
//                 <td>{item.tradingSymbol}</td>
//                 <td>{item.pcr}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       <BuilUpTable />
//     </div>
//   );
// };

// const buildUpKeys = [
//   { keys: "Long Built Up", message: "Price May go Up" },
//   { keys: "Short Built Up", message: "Price May Go Down" },
//   { keys: "Short Covering", message: "Price may go up" },
//   { keys: "Long Unwinding", message: "Price may go down" },
// ];
// const BuilUpTable = () => {
//   const ANGEL_URI_BUILD_UP = `${ANGEL_BASE_URL}/rest/secure/angelbroking/marketData/v1/OIBuildup`;
//   const [buildUpData, setbuildupData] = useState([]);
//   useEffect(() => {
//     const fetchData = async () => {
//       for (const { keys, message } of buildUpKeys) {
//         const { data } = await axios.post(ANGEL_URI_BUILD_UP, {
//           expirytype: "NEAR",
//           datatype: keys,
//         });
//         setbuildupData((prev) => [
//           ...prev,
//           {
//             key: keys,
//             message,
//             data: data.data,
//           },
//         ]);
//         // Wait for 1 second before the next iteration
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//       }
//     };
//     fetchData();
//   }, []);
//   return buildUpData.map((item, ind) => {
//     return (
//       <div key={ind}>
//         <p className="text-center font-bold text-xl">
//           {item.key} - {item.message}: {moment().format("DD-MMM-yyyy hh:mm:ss")}
//         </p>
//         <table key={item.key}>
//           <thead className="bg-gray-700 text-gray-200">
//             <tr>
//               <th>Trading Symbol</th>
//               <th>Symbol Token</th>
//               <th>LTP</th>
//               <th>Price Change</th>
//               <th>Percent Change</th>
//               <th>Open Interest</th>
//               <th>Net Change Open Interest</th>
//             </tr>
//           </thead>
//           <tbody>
//             {item?.data &&
//               item?.data?.map((childItem, ind) => {
//                 return (
//                   <tr key={ind}>
//                     <td>{childItem.tradingSymbol}</td>
//                     <td>{childItem.symbolToken}</td>
//                     <td>{childItem.ltp}</td>
//                     <td>{childItem.netChange}</td>
//                     <td>{childItem.percentChange}</td>
//                     <td>{childItem.opnInterest}</td>
//                     <td>{childItem.netChangeOpnInterest}</td>
//                   </tr>
//                 );
//               })}
//           </tbody>
//         </table>
//       </div>
//     );
//   });
// };

