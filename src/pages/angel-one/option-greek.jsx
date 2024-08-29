import React, { Fragment, useEffect, useMemo, useState } from "react";
import { ANGEL_BASE_URL, ANGEL_BASE_URL_LOCAL } from "@/lib/constants.js";
import axios from "axios";
import { combineRowsByStrikePrice } from "@/lib/utils";
import { useDataContext } from "@/providers/data-provider";
const OptionGreek = () => {
  const ANGEL_URI = `${ANGEL_BASE_URL_LOCAL}/api/v1/instrument/option-greek`;
  // const ANGEL_URI = `${ANGEL_BASE_URL}/rest/secure/angelbroking/marketData/v1/optionGreek`;
  const ANGEL_URI_LTP = `${ANGEL_BASE_URL}/rest/secure/angelbroking/order/v1/getLtpData`;
  const [tableData, setTableData] = useState({
    loading: true,
    data: [],
    error: "",
  });
  const [mainLTP, setMainLTP] = useState({});
  const { contextData } = useDataContext();
  console.log(contextData);
  const getOptionGreek = async () => {
    setTableData((p) => ({ ...p, loading: true }));
    try {
      const { data } = await axios.post(
        ANGEL_URI,
        {
          name: contextData.name, // Here Name represents the Underlying stock
          expirydate: contextData.expiry,
        }
        // { headers: headers }
      );
      if (!data.success) {
        setTableData((p) => ({
          ...p,
          error: data.message,
        }));
        return;
      }
      const newdata = combineRowsByStrikePrice(data.combinedData);
      console.log({ newdata });
      setTableData((p) => ({
        ...p,
        data: newdata?.reverse() || [],
        error: "",
      }));
    } catch (error) {
      setTableData((p) => ({
        ...p,
        error: error?.response.data.message || error.message,
        data: [],
      }));
    } finally {
      setTableData((p) => ({ ...p, loading: false }));
    }
  };
  const getLTP = async () => {
    const { data } = await axios.post(ANGEL_URI_LTP, {
      exchange: contextData.exchange,
      tradingsymbol: contextData.symbol,
      symboltoken: contextData.token,
    });
    setMainLTP(data.data);
  };
  // console.log(tableData);
  useEffect(() => {
    getLTP();
    if (!contextData.name || !contextData.expiry) return;
    let timeout = setTimeout(() => {
      getOptionGreek();
    }, 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, [contextData.name, contextData.expiry]);
  useEffect(() => {
    if (!contextData.exchange || !contextData.symbol || !contextData.token)
      return;
    getLTP();
  }, [contextData.exchange, contextData.symbol, contextData.token]);
  let findATM = useMemo(() => {
    if (!tableData.data || !mainLTP.ltp) return;
    let atm = "";
    for (const key in tableData.data) {
      if (tableData.data[key]?.strikePrice > mainLTP.ltp) {
        atm = tableData.data[key - 1]?.strikePrice;
        break;
      }
    }
    return atm;
  }, [tableData.data, mainLTP.ltp]);
  // console.log(findATM);
  return (
    <div>
      {tableData.loading ? (
        <div className="flex w-full h-40 justify-center items-center">
          <div>Loading...</div>
        </div>
      ) : tableData.error ? (
        <div>Error+{tableData.error}</div>
      ) : (
        <table className="mx-auto option-greek">
          <thead>
            <tr className="bg-red-700 text-gray-100">
              <th colSpan={6}>CE</th>
              <th colSpan={5}>
                <div className="flex flex-1 justify-center gap-x-5">
                  <p>Name: {tableData.data[0]?.name}</p>
                  <p>LTP:{mainLTP.ltp}</p>
                  <p>
                    Expiry:
                    {tableData.data[0]?.expiry}
                  </p>
                </div>
              </th>
              <th className="text-center" colSpan={6}>
                PE
              </th>
            </tr>
            <tr className="bg-blue-700 text-white">
              <th>Delta</th>
              <th>Gamma</th>
              <th>IV</th>
              <th>Theta</th>
              <th>Vega</th>
              <th>Trade Volume</th>
              <th>OI</th>
              <th>LTP</th>
              <th>Strike Price</th>
              <th>LTP</th>
              <th>OI</th>
              <th>Trade Volume</th>
              <th>Vega</th>
              <th>Theta</th>
              <th>IV</th>
              <th>Gamma</th>
              <th>Delta</th>
            </tr>
          </thead>
          <tbody>
            {tableData.data.map((row, ind) => {
              let inTheMoneyCE = mainLTP.ltp < row.strikePrice;
              let inTheMoneyPE = mainLTP.ltp > row.strikePrice;
              return (
                <Fragment key={ind}>
                  <tr>
                    <td className={`${inTheMoneyCE ? "bg-orange-200" : ""}`}>
                      {row?.CEdelta ?? "-"}
                    </td>
                    <td className={`${inTheMoneyCE ? "bg-orange-200" : ""}`}>
                      {row?.CEgamma ?? "-"}
                    </td>
                    <td className={`${inTheMoneyCE ? "bg-orange-200" : ""}`}>
                      {row?.CEimpliedVolatility ?? "-"}
                    </td>
                    <td className={`${inTheMoneyCE ? "bg-orange-200" : ""}`}>
                      {row?.CEtheta ?? "-"}
                    </td>
                    <td className={`${inTheMoneyCE ? "bg-orange-200" : ""}`}>
                      {row?.CEvega ?? "-"}
                    </td>
                    <td className={`${inTheMoneyCE ? "bg-orange-200" : ""}`}>
                      {row?.CEtradeVolume ?? "-"}
                    </td>
                    <td className={`${inTheMoneyCE ? "bg-orange-200" : ""}`}>
                      {row?.CEopenInterest ?? "-"}
                    </td>
                    <td className={`${inTheMoneyCE ? "bg-orange-200" : ""}`}>
                      {row?.CEltp ?? "-"}
                    </td>
                    <td className="bg-red-200">{row?.strikePrice ?? "-"}</td>
                    <td className={`${inTheMoneyPE ? "bg-orange-200" : ""}`}>
                      {row?.PEltp ?? "-"}
                    </td>
                    <td className={`${inTheMoneyPE ? "bg-orange-200" : ""}`}>
                      {row?.PEopenInterest ?? "-"}
                    </td>
                    <td className={`${inTheMoneyPE ? "bg-orange-200" : ""}`}>
                      {row?.PEtradeVolume ?? "-"}
                    </td>
                    <td className={`${inTheMoneyPE ? "bg-orange-200" : ""}`}>
                      {row?.PEvega ?? "-"}
                    </td>
                    <td className={`${inTheMoneyPE ? "bg-orange-200" : ""}`}>
                      {row?.PEtheta ?? "-"}
                    </td>
                    <td className={`${inTheMoneyPE ? "bg-orange-200" : ""}`}>
                      {row?.PEimpliedVolatility ?? "-"}
                    </td>
                    <td className={`${inTheMoneyPE ? "bg-orange-200" : ""}`}>
                      {row?.PEgamma ?? "-"}
                    </td>
                    <td className={`${inTheMoneyPE ? "bg-orange-200" : ""}`}>
                      {row?.PEdelta ?? "-"}
                    </td>
                  </tr>
                  {findATM === row.strikePrice && (
                    <tr>
                      <td className="h-10" colSpan={20}>
                        <div className="w-full flex justify-stretch items-center text-lg font-bold">
                          <div className="bg-gray-900 w-full h-1" />
                          <p className="px-3 text-red-700">{mainLTP.ltp}</p>
                          <div className="bg-gray-900 w-full h-1" />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OptionGreek;

// Tyasis sim
// BSNL ICCID
let arr = [
  "89913431101528925749",
  "89913431101528925756",
  "89913431101528925764",
  "89913431101528925772",
  "89913431101528925780",
  "89913431101528925798",
  "89913431101528925806",
  "89913431101528925814",
  "89913431101528925822",
  "89913431101528925830",
  "89913431101528925848",
  "89913431101528925855",
  "89913431101528925863",
  "89913431101528925871",
  "89913431101528925889",
  "89913431101528925897",
  "89913431101528925905",
  "89913431101528925913",
  "89913431101528925921",
  "89913431101528925939",
  "89913431101528925947",
  "89913431101528925954",
  "89913431101528925962",
  "89913431101528925970",
  "89913431101528925988",
  "89913431101528925996",
  "89913431101528926002",
  "89913431101528926010",
  "89913431101528926028",
  "89913431101528926036",
  "89913431101528926044",
  "89913431101528926051",
  "89913431101528926069",
  "89913431101528926077",
  "89913431101528926085",
  "89913431101528926093",
  "89913431101528926101",
  "89913431101528926119",
  "89913431101528926127",
  "89913431101528926135",
  "89913431101528926143",
  "89913431101528926150",
  "89913431101528926168",
  "89913431101528926176",
  "89913431101528926184",
  "89913431101528926192",
  "89913431101528926200",
  "89913431101528926218",
  "89913431101528926226",
  "89913431101528926234",
  "89913431101528926242",
  "89913431101528926259",
  "89913431101528926267",
  "89913431101528926275",
  "89913431101528926283",
  "89913431101528926291",
  "89913431101528926309",
  "89913431101528926317",
  "89913431101528926325",
  "89913431101528926333",
  "89913431101528926341",
  "89913431101528926358",
  "89913431101528926366",
  "89913431101528926374",
  "89913431101528926382",
  "89913431101528926390",
  "89913431101528926408",
  "89913431101528926416",
  "89913431101528926424",
  "89913431101528926432",
  "89913431101528926440",
  "89913431101528926457",
  "89913431101528926465",
  "89913431101528926473",
  "89913431101528926481",
  "89913431101528926499",
  "89913431101528926507",
  "89913431101528926515",
  "89913431101528926523",
  "89913431101528926531",
  "89913431101528926549",
  "89913431101528926556",
  "89913431101528926564",
  "89913431101528926572",
  "89913431101528926580",
  "89913431101528926598",
  "89913431101528926606",
  "89913431101528926614",
  "89913431101528926622",
  "89913431101528926630",
  "89913431101528926648",
  "89913431101528926655",
  "89913431101528926663",
  "89913431101528926671",
  "89913431101528926689",
  "89913431101528926697",
  "89913431101528926705",
  "89913431101528926713",
  "89913431101528926721",
  "89913431101528926739",
];
