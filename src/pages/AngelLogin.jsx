import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BASE_URL_OVERALL } from "@/lib/constants";
const AngelLogin = () => {
  const [url, setUrl] = useState("");
  const handleLogin = async () => {
    try {
      if (!url) {
        alert("No Url is Present");
        return;
      }
      const search = new URLSearchParams(url);
      // console.log(search.getAll("auth_token"));
      let arr = [];
      search?.forEach((value) => arr.push(value));
      //console.log("hello",arr)
      // const { data } = await axios.post(
      //   "https://apiconnect.angelbroking.com/rest/auth/angelbroking/jwt/v1/generateTokens",
      //   {
      //     refreshToken: arr[2],
      //   },
      //   {
      //     headers: {
      //       "X-PrivateKey": "RuarMoF2",
      //       Accept: "application/json, application/json",
      //       "X-SourceID": "WEB",
      //       "X-ClientLocalIP": "192.168.31.149",
      //       "X-ClientPublicIP": "152.58.117.211",
      //       "X-MACAddress": "74-56-3C-65-97-50",
      //       "X-UserType": "USER",
      //       Authorization: `Bearer ${arr[0]}`,
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );
      const { data: response } = await axios.post(`${BASE_URL_OVERALL}/auth/updateAuth `, {
        loginToken: {
          auth_token: arr[0],
          feed_token: arr[1],
          refresh_token: arr[2],
        },
        sessionToken :{
          auth_token: arr[0],
          feed_token: arr[1],
          refresh_token: arr[2],
        },
        //seesionToken: data.data,
        api_key: "RuarMoF2",
      });
           
      //console.log({ response });
      // console.log(
      //   JSON.stringify({
      //     loginToken: {
      //       auth_token: arr[0],
      //       feed_token: arr[1],
      //       refresh_token: arr[2],
      //     },
      //     seesionToken: data.data,
      //   })
      // );
      alert("Logged in Successfully");
    } catch (error) {
      console.log("Retry Login, something Went wrong!!");
    }
  };

  return (
    <div className="w-1/2 p-10 flex flex-col justify-center items-center mx-auto gap-y-10">
      <p className="text-2xl font-bold">Login to take Trade</p>
      <p className="text-2xl font-bold">API KEY : RuarMoF2</p>
      <Button>
        <a
          target="_blank"
          href="https://smartapi.angelbroking.com/publisher-login?api_key=RuarMoF2">
          Go To Angel One Login
        </a>
      </Button>
      <div className="w-full">
        <Label>Enter the Angel One Url</Label>
        <Input type="text" onChange={(e) => setUrl(e.target.value)} />
      </div>
      <Button onClick={handleLogin}>Update On Server</Button>
    </div>
  );
};

export default AngelLogin;

