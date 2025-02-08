import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import secureLocalStorage from "react-secure-storage";
import axios from "axios";

import { BASE_URL_OVERALL } from "@/lib/constants";

function Input({
  type,
  name,
  label,
  placeholder,
  autofocus,
  handleChange,
}) {
  return (
    <label className="text-gray-500 block mt-3 font-serif">
      {label}
      <input
        autoFocus={autofocus}
        type={type}   
        name={name}
        placeholder={placeholder}
        onChange={handleChange}
        className="rounded px-4 py-3 w-full mt-1 bg-white text-gray-900 border border-gray-200 focus:border-indigo-400 focus:outline-none focus:ring focus:ring-indigo-100 font-serif"
      />
    </label>
  );
}

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!loginData?.email && !loginData?.password) {
      toast.error("Please fill Email Id & Password");
      return;
    }
    if (!loginData.email) {
      toast.error("Please fill the Email ID");
      return;
    }
    if (!loginData.password) {
      toast.error("Please fill the Password");
      return;
    }
    
    // if (loginData.password === "cpyadav" && loginData.email === "cpyadav") {
    //   navigate(`${mainRoute}/home`);
    //   secureLocalStorage.setItem("Authenticate", "aAg@16&5jNs$%d0*");
    // } else {
    //   toast.error("Invalid Email Id or Password");
    // }

    axios
      .post(`${BASE_URL_OVERALL}/auth/login`, { ...loginData })
      .then((res) => {
        secureLocalStorage.setItem("Authenticate", "aAg@16&5jNs$%d0*");
      
        navigate(`/future/dashboard`);
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response.data.message)
      });
  };
  useEffect(() => {
    localStorage.clear();
    secureLocalStorage.clear();
  }, []);

  return (
    <>
      <ToastContainer />
      <div className="bg-[#dde1f7] flex justify-center items-center h-screen w-screen">
    
        <div className=" border-t-8 rounded-sm border-indigo-600 bg-white p-5 shadow-2xl w-96">
        <div className="text-3xl  font-bold font-serif flex justify-center p-2 text-black  rounded-sm">
          PES CAPITAL
        </div>
          <img
            src="https://wallpaperaccess.com/full/1393720.jpg"
            alt="stock image"
            className="w-[100%] h-[130px] object-cover rounded-md"
          />
      

          <div>
            <Input
              type="email"
              name="email"
              label="Email Address"
              placeholder="me@gmail.com"
              autofocus={true}
              handleChange={handleChange}
            />
            <Input
              type="password"      
              name="password"
              label="Password"
              placeholder="••••••••••"
              handleChange={handleChange}
            />
            <button
              onClick={handleSubmit}
              className="mt-6  transition-all block py-3 px-4 w-full text-white font-bold rounded cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-400 hover:from-indigo-700 hover:to-purple-500 focus:bg-indigo-900 transform hover:-translate-y-1 hover:shadow-lg"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
