import React, { memo } from "react";
import { Input } from "./input";
import { cn } from "../../lib/utils";

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  className,
  ...props
}) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <Input
      {...props}
      value={value}
      className={cn("", className)}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
export default memo(DebouncedInput);
