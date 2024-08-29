import axios from "axios";
import React, { useEffect, useState } from "react";
const ANGEL_URI =
  "https://apiconnect.angelbroking.com/rest/secure/angelbroking/marketData/v1/gainersLosers";
const GainerLosser = () => {
  const [gainer, setGainer] = useState([]);
  const [looser, setLooser] = useState([]);
  const getGainerData = async () => {
    const { data } = await axios.post(
      ANGEL_URI,
      { datatype: "PercPriceGainers", expirytype: "NEAR" },
      { headers: headers }
    );
    if (data.status) {
      setGainer(data.data);
    } else {
      alert(data.message);
    }
    return "hello";
  };
  const getLooserData = async () => {
    const { data } = await axios.post(
      ANGEL_URI,
      { datatype: "PercPriceLosers", expirytype: "NEAR" },
      { headers: headers }
    );
    if (data.status) {
      setLooser(data.data);
    } else {
      alert(data.message);
    }
    return data;
  };
  useEffect(() => {
    getGainerData().then(() => {
      setTimeout(() => {
        getLooserData();
      }, 1000);
    });
    let timeout = setTimeout(() => {
      getGainerData().then(() => {
        setTimeout(() => {
          getLooserData();
        }, 1000);
      }, 5 * 1000);
    });
    return () => clearTimeout(timeout);
  }, []);
  return (
    <div className="flex justify-between mx-10">
      {/* Gainer  */}
      <div>
        <p className="text-center text-xl font-semibold text-green-500">
          Gainer
        </p>
        <table>
          <tr>
            <th>Trading Symbol</th>
            <th>LTP</th>
            <th>Percent Change</th>
            <th>Symbol Token</th>
            <th>NetChange</th>
          </tr>
          {gainer.map((item) => (
            <tr>
              <td>{item.tradingSymbol}</td>
              <td>{item.ltp}</td>
              <td>{item.percentChange}</td>
              <td>{item.symbolToken}</td>
              <td>{item.netChange}</td>
            </tr>
          ))}
        </table>
      </div>
      {/* Looser  */}
      <div>
        <p className="text-center text-xl font-semibold text-red-500">LOOSER</p>
        <table>
          <tr>
            <th>Trading Symbol</th>
            <th>LTP</th>
            <th>Percent Change</th>
            <th>Symbol Token</th>
            <th>Net Change</th>
          </tr>
          {looser.map((item) => (
            <tr>
              <td>{item.tradingSymbol}</td>
              <td>{item.ltp}</td>
              <td>{item.percentChange}</td>
              <td>{item.symbolToken}</td>
              <td>{item.netChange}</td>
            </tr>
          ))}
        </table>
      </div>
    </div>
  );
};
export default GainerLosser;

const headers = {
  "X-PrivateKey": "1S8SSONG",
  Accept: "application/json, application/json",
  "X-SourceID": "WEB",
  "X-ClientLocalIP": "192.168.31.149",
  "X-ClientPublicIP": "152.58.117.211",
  "X-MACAddress": "74-56-3C-65-97-50",
  "X-UserType": "USER",
  Authorization:
    "Bearer eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6IkM1OTg5MTQzNiIsInJvbGVzIjowLCJ1c2VydHlwZSI6IlVTRVIiLCJ0b2tlbiI6ImV5SmhiR2NpT2lKU1V6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUoxYzJWeVgzUjVjR1VpT2lKamJHbGxiblFpTENKMGIydGxibDkwZVhCbElqb2lkSEpoWkdWZllXTmpaWE56WDNSdmEyVnVJaXdpWjIxZmFXUWlPamtzSW5OdmRYSmpaU0k2SWpNaUxDSmtaWFpwWTJWZmFXUWlPaUl6TnprNE1USXdaUzFqWTJWaExUTTVPV1V0WVdZME1TMDVZMlpsTXpVMFltSXpaakVpTENKcmFXUWlPaUowY21Ga1pWOXJaWGxmZGpFaUxDSnZiVzVsYldGdVlXZGxjbWxrSWpvNUxDSndjbTlrZFdOMGN5STZleUprWlcxaGRDSTZleUp6ZEdGMGRYTWlPaUpoWTNScGRtVWlmWDBzSW1semN5STZJblJ5WVdSbFgyeHZaMmx1WDNObGNuWnBZMlVpTENKemRXSWlPaUpETlRrNE9URTBNellpTENKbGVIQWlPakUzTVRrM05qRTBNVEFzSW01aVppSTZNVGN4T1RZMk5UVXdPU3dpYVdGMElqb3hOekU1TmpZMU5UQTVMQ0pxZEdraU9pSmxOemhrTW1NeU5pMWlaVE0zTFRSaE1tVXRPV1UwTkMweFpUY3dZVEJoWVdFeE5qWWlmUS5tSGRrb0Z5M2E2bk5WWmtlTHl6TV9NblpXcWxUVWgtb3JLM3ZrUFRGVFVZMi1qWDNYazBSUHRfZnVEYllKSnFUOUliWEpRLUVCOFMwaUxJWGk2R0V3bGl2ZE11ZDV1ME16ZWY5MnhZMVMtR0sydndsUnZNdTF2azBuOXhFUUZfNW52UklKeVJJR3MzQzVDdjZ5dTFBaWFmam91YUFkekdMOGdUNWZPUVY2REUiLCJBUEktS0VZIjoiMVM4U1NPTkciLCJpYXQiOjE3MTk2NjU1NjksImV4cCI6MTcxOTc2MTQxMH0.ny-hC_0UpHu0Ei68Sv_C8SHpywf36fV78vNEV0Za_Z8yeDGgMD3wIlD8rS_EqfRsM_xU2dXnTHkrx_i2wDg1GA",
  "Content-Type": "application/json",
};

const auth_token =
  "eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6IkM1OTg5MTQzNiIsInJvbGVzIjowLCJ1c2VydHlwZSI6IlVTRVIiLCJ0b2tlbiI6ImV5SmhiR2NpT2lKU1V6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUoxYzJWeVgzUjVjR1VpT2lKamJHbGxiblFpTENKMGIydGxibDkwZVhCbElqb2lkSEpoWkdWZllXTmpaWE56WDNSdmEyVnVJaXdpWjIxZmFXUWlPamtzSW5OdmRYSmpaU0k2SWpNaUxDSmtaWFpwWTJWZmFXUWlPaUl6TnprNE1USXdaUzFqWTJWaExUTTVPV1V0WVdZME1TMDVZMlpsTXpVMFltSXpaakVpTENKcmFXUWlPaUowY21Ga1pWOXJaWGxmZGpFaUxDSnZiVzVsYldGdVlXZGxjbWxrSWpvNUxDSndjbTlrZFdOMGN5STZleUprWlcxaGRDSTZleUp6ZEdGMGRYTWlPaUpoWTNScGRtVWlmWDBzSW1semN5STZJblJ5WVdSbFgyeHZaMmx1WDNObGNuWnBZMlVpTENKemRXSWlPaUpETlRrNE9URTBNellpTENKbGVIQWlPakUzTVRrM05qRTBNVEFzSW01aVppSTZNVGN4T1RZMk5UVXdPU3dpYVdGMElqb3hOekU1TmpZMU5UQTVMQ0pxZEdraU9pSmxOemhrTW1NeU5pMWlaVE0zTFRSaE1tVXRPV1UwTkMweFpUY3dZVEJoWVdFeE5qWWlmUS5tSGRrb0Z5M2E2bk5WWmtlTHl6TV9NblpXcWxUVWgtb3JLM3ZrUFRGVFVZMi1qWDNYazBSUHRfZnVEYllKSnFUOUliWEpRLUVCOFMwaUxJWGk2R0V3bGl2ZE11ZDV1ME16ZWY5MnhZMVMtR0sydndsUnZNdTF2azBuOXhFUUZfNW52UklKeVJJR3MzQzVDdjZ5dTFBaWFmam91YUFkekdMOGdUNWZPUVY2REUiLCJBUEktS0VZIjoiMVM4U1NPTkciLCJpYXQiOjE3MTk2NjU1NjksImV4cCI6MTcxOTc2MTQxMH0.ny-hC_0UpHu0Ei68Sv_C8SHpywf36fV78vNEV0Za_Z8yeDGgMD3wIlD8rS_EqfRsM_xU2dXnTHkrx_i2wDg1GA";
const feed_token =
  "eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6IkM1OTg5MTQzNiIsImlhdCI6MTcxOTY2NTU2OSwiZXhwIjoxNzE5NzUxOTY5fQ.QNBvs9P8Kn9qPLEKjbbxiWWBJf2srHPGuk4I1066A9NIkl0scOkWKp_8UG2QkjAegeJwG-SsdCpF63b9dfMXAA";
const refresh_token =
  "eyJhbGciOiJIUzUxMiJ9.eyJ0b2tlbiI6IlJFRlJFU0gtVE9LRU4iLCJSRUZSRVNILVRPS0VOIjoiZXlKaGJHY2lPaUpTVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SjFjMlZ5WDNSNWNHVWlPaUpqYkdsbGJuUWlMQ0owYjJ0bGJsOTBlWEJsSWpvaWRISmhaR1ZmY21WbWNtVnphRjkwYjJ0bGJpSXNJbWR0WDJsa0lqb3dMQ0prWlhacFkyVmZhV1FpT2lJek56azRNVEl3WlMxalkyVmhMVE01T1dVdFlXWTBNUzA1WTJabE16VTBZbUl6WmpFaUxDSnJhV1FpT2lKMGNtRmtaVjlyWlhsZmRqRWlMQ0p2Ylc1bGJXRnVZV2RsY21sa0lqb3dMQ0pwYzNNaU9pSnNiMmRwYmw5elpYSjJhV05sSWl3aWMzVmlJam9pUXpVNU9Ea3hORE0ySWl3aVpYaHdJam94TnpFNU9ETTRNelk1TENKdVltWWlPakUzTVRrMk5qVTFNRGtzSW1saGRDSTZNVGN4T1RZMk5UVXdPU3dpYW5ScElqb2laVE01WTJZM01Ea3RaREk1TlMwME16WXdMV0U1TWpJdE1HWXlNekJqTlRrMU1EZGtJbjAuS0lKbmR1Q0hNX2dtRndfU1ZXeGxOYk1DWko2dGtsa1dxTW5CQVBBdlFWNlBVeU8xWDdSZ0xrb3prTlExRkxyNUNxd1F1T3dvNE9GQTZGNl80RzBRZVRjVmZYZDJFUHZPYXVObWl1dW9pTkZkNFZyZWNNRUtMTUJaZDVaSE5IT1hfN3FyTGZwa3R5TVB0MTktclZyeUt5YlZFOEpacFRwSXVoWkF5X0NoT0VBIiwiaWF0IjoxNzE5NjY1NTY5fQ.uAbOCwBcA-253G71fnEDSq6o8638zjX-DXBv28JrMqoVA-8fVg02ebX58DURu1Gls7Kf2izeLK3TiW-qQxPeSA";
