import { useConfig } from "@/hooks/use-config";
import { BASE_URL_OVERALL2 } from "@/lib/constants";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Manager } from "socket.io-client";

const SocketContext = createContext({
  socket: null,
  isConnected: false,
});
export const useLiveSocket = () => {
  return useContext(SocketContext);
};

export const LiveSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setisConnected] = useState(false);
  // Memoize the manager to prevent it from being recreated on each render
  const manager = useMemo(() => new Manager(BASE_URL_OVERALL2, {
    path: "/socket.io",
  }), []);
  useEffect(() => {
    // const manager = new Manager(BASE_URL_OVERALL2, {
    //   path: "/socket.io",
    //   // path: "/teststock/socket.io",
    // });
    console.log("Rerender")

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
  }, [manager]);      
     
  // console.log({ isConnected });
  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
       {children}
    </SocketContext.Provider>
  );
};
