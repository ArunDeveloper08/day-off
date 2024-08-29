import { useConfig } from "@/hooks/use-config";
import { BASE_URL_OVERALL2 } from "@/lib/constants";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Manager } from "socket.io-client";

const SocketContext = createContext({
  socket: null,
  isConnected: false,
});
export const useBackTestSocket = () => {
  return useContext(SocketContext);
};

export const BackTestSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setisConnected] = useState(false);
  const { config , tradeConfig } = useConfig();

  useEffect(() => {
    // const manager = new Manager( "http://192.168.31.149:5001", {
    const manager = new Manager(`${BASE_URL_OVERALL2}`, {
      // path: "/socket.io",
      path: "/teststock/socket.io",
    });

    
    const socketInstance = manager.socket("/");
    socketInstance.on("connect", () => {
      setisConnected(true);
    });
    socketInstance.on("disconnect", () => {
      setisConnected(false);
    });
    setSocket(socketInstance);
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  console.log({ isConnected });

  return (
     <SocketContext.Provider  value={{ socket, isConnected }}>
       {children}
    </SocketContext.Provider>
  );
};
