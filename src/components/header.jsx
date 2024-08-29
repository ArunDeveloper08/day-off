import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Cog } from "lucide-react";
import { useModal } from "@/hooks/use-modal";
import { useConfig } from "@/hooks/use-config";
import { camelCaseToSpaces } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { Trade_type_Options } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Header = () => {
  const { onOpen } = useModal();
  const { config, setTradeConfig, fetchConfig } = useConfig();
  const cachedTradeType =
    Trade_type_Options[localStorage.getItem("cachedTradeType")]?.name ??
    Trade_type_Options["Future Main"].name;
  const [query, setQuery] = useState(cachedTradeType);
  const navigate = useNavigate();

  useEffect(() => {
    let result;
    Object.entries(Trade_type_Options).map(([key, value]) => {
      if (value.name === query) {
        result = key;
        setTradeConfig(Trade_type_Options[key]);
        localStorage.setItem("cachedTradeType", result);
        fetchConfig(Trade_type_Options[key]);
        navigate(`/future?tradeType=${query}`, {
          replace: true,
        });
      }
    });
  }, [query]);
  return (
    <div className="p-3 w-full border-2 border-gray-500 flex justify-between items-center gap-x-16">
      <div className="grid grid-cols-5 flex-1 justify-center items-center gap-3">
        <Select value={query} onValueChange={(value) => setQuery(value)}>
          <SelectTrigger className="w-full mt-1 border-zinc-500">
            <SelectValue placeholder="Select an Option to Trade" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Options</SelectLabel>
              {Object.entries(Trade_type_Options).map(([_, value]) => (
                <SelectItem key={value.name} value={value.name}>
                  {value.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {Object.entries(config).map(([key, value]) => (
          <div
            className="p-2 dark:bg-zinc-800 bg-zinc-900/30 text-sm rounded-lg"
            key={key}
          >
            <strong>{camelCaseToSpaces(key)} :</strong> {value?.toString()}
          </div>
        ))}
      </div>
      <Button size="icon" onClick={() => onOpen("config")}>
        <Cog />
      </Button>

      <Link to="/future/home">
        <Button>Table</Button>
      </Link>
    </div>
  );
};

export default Header;
