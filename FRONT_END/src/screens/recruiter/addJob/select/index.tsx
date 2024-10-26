import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import React, { Key } from "react";

interface IAutocompleteComponentProps<T extends object> {
  items: T[];
  label?: string;
  placeholder?: string;
  selectedKey?: string | null;
  onSelectionChange: (key: Key | null) => void;
  isInvalid?: boolean;
  errorMessage?: string;
  itemToKey: (item: T) => string;
  itemToLabel: (item: T) => string;
  inputWrapperClass?: string;
  className?: string;
}

function AutocompleteComponent<T extends object>({
  items,
  label,
  placeholder,
  selectedKey,
  onSelectionChange,
  isInvalid,
  errorMessage,
  itemToKey,
  itemToLabel,
  inputWrapperClass = "",
  className = "",
}: IAutocompleteComponentProps<T>) {
  return (
    <Autocomplete
      isRequired
      defaultItems={items}
      label={label}
      placeholder={placeholder}
      labelPlacement="outside"
      variant="faded"
      inputProps={{
        classNames: {
          inputWrapper: isInvalid ? "border-0 bg-[#fee7ef]" : inputWrapperClass,
        },
      }}
      className={className}
      selectedKey={selectedKey}
      onSelectionChange={onSelectionChange}
      isInvalid={isInvalid}
      errorMessage={errorMessage}
    >
      {items.map((item) => (
        <AutocompleteItem className="text-themeDark" key={itemToKey(item)}>
          {itemToLabel(item)}
        </AutocompleteItem>
      ))}
    </Autocomplete>
  );
}

export default AutocompleteComponent;
