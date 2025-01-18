// import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {format } from "date-fns";
import {  clsx } from "clsx";
//import { twMerge } from "tailwind-merge";


export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const camelCaseToSpaces = (str) => {
  return str.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, function (str) {
    return str.toUpperCase();
  });
};


export const formatDate = (date, type) => {
  if (!date) return "Null";
  try {
    const originalDate = new Date(date);
    let formattedDate;
    if (type === "date") {
      formattedDate = format(originalDate, "MMM dd,yyyy");
    } else if (type === "time") {
      formattedDate = format(originalDate, "HH:mm");
    } else {
      formattedDate = format(originalDate, "MMM dd, yyyy HH:mm:ss");
    }
    return formattedDate;
  } catch (error) {
    return date;
  }
};
export const formatPrice = (price) => {
  try {
    const fromattedNumber = new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "INR",
    }).format(price);
    return fromattedNumber;
  } catch (error) {
    return price;
  }
};


export const combineRowsByStrikePrice = (data) => {
  const groupedData = data.reduce((acc, row) => {
    if (!acc[row.strikePrice]) {
      acc[row.strikePrice] = [];
    }
    acc[row.strikePrice].push(row);
    return acc;
  }, {});
  let resData = Object.values(groupedData).map((group) => {
    if (group.length === 1) {
      if (group[0].optionType === "CE") {
        return {
          name: group[0].name,
          optionType: group[0].optionType,
          strikePrice: Number(group[0].strikePrice).toFixed(0),
          expiry: group[0].expiry,
          CEtheta: Number(group[0].theta).toFixed(2),
          CEtradeVolume: Number(group[0].tradeVolume).toFixed(0),
          CEvega: Number(group[0].vega).toFixed(2),
          CEdelta: Number(group[0].delta).toFixed(2),
          CEgamma: group[0].gamma,
          CEimpliedVolatility: Number(group[0].impliedVolatility).toFixed(2),
          CEopenInterest: group[0].openInterest,
          CEltp: group[0].ltp,
        };
      } else {
        return {
          name: group[0].name,
          optionType: group[0].optionType,
          strikePrice: Number(group[0].strikePrice).toFixed(0),
          expiry: group[0].expiry,
          PEtheta: Number(group[0].theta).toFixed(2),
          PEtradeVolume: Number(group[0].tradeVolume).toFixed(0),
          PEvega: Number(group[0].vega).toFixed(2),
          PEdelta: Number(group[0].delta).toFixed(2),
          PEgamma: group[0].gamma,
          PEimpliedVolatility: Number(group[0].impliedVolatility).toFixed(2),
          PEopenInterest: group[0].openInterest,
          PEltp: group[0].ltp,
        };
      }
      // return group[0];
    } else {
      if (group[0].optionType === "CE") {
        return {
          name: group[0].name,
          optionType: group[0].optionType,
          strikePrice: Number(group[0].strikePrice).toFixed(0),
          CEtheta: Number(group[0].theta).toFixed(2),
          CEtradeVolume: Number(group[0].tradeVolume).toFixed(0),
          CEvega: Number(group[0].vega).toFixed(2),
          CEdelta: Number(group[0].delta).toFixed(2),
          expiry: group[0].expiry,
          CEgamma: group[0].gamma,
          CEimpliedVolatility: Number(group[0].impliedVolatility).toFixed(2),
          CEopenInterest: group[0].openInterest,
          CEltp: group[0].ltp,
          PEtheta: Number(group[1].theta).toFixed(2),
          PEtradeVolume: Number(group[1].tradeVolume).toFixed(0),
          PEvega: Number(group[1].vega).toFixed(2),
          PEdelta: Number(group[1].delta).toFixed(2),
          expiry: group[1].expiry,
          PEgamma: group[1].gamma,
          PEimpliedVolatility: Number(group[1].impliedVolatility).toFixed(2),
          PEopenInterest: group[1].openInterest,
          PEltp: group[1].ltp,
        };
      } else {
        return {
          name: group[1].name,
          optionType: group[1].optionType,
          strikePrice: Number(group[1].strikePrice).toFixed(0),
          CEtheta: Number(group[1].theta).toFixed(2),
          CEtradeVolume: Number(group[1].tradeVolume).toFixed(0),
          CEvega: Number(group[1].vega).toFixed(2),
          CEdelta: Number(group[1].delta).toFixed(2),
          expiry: group[1].expiry,
          CEgamma: group[1].gamma,
          CEimpliedVolatility: Number(group[1].impliedVolatility).toFixed(2),
          CEopenInterest: group[1].openInterest,
          CEltp: group[1].ltp,
          PEtheta: Number(group[0].theta).toFixed(2),
          PEtradeVolume: Number(group[0].tradeVolume).toFixed(0),
          PEvega: Number(group[0].vega).toFixed(2),
          PEdelta: Number(group[0].delta).toFixed(2),
          expiry: group[0].expiry,
          PEgamma: group[0].gamma,
          PEimpliedVolatility: Number(group[0].impliedVolatility).toFixed(2),
          PEopenInterest: group[0].openInterest,
          PEltp: group[0].ltp,
        };
      }
    }
  });
  resData = resData.sort((a, b) => b.strikePrice - a.strikePrice);
  return resData;
};


// export function cn(...inputs) {
//   return twMerge(clsx(inputs));
// }