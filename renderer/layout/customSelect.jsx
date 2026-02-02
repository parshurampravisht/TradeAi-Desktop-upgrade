import React, { useEffect, useState } from "react";
import Select from "react-select";
import CustomMenuList from "../component/dashboard/watchlist/order/orderComponents/helpers/CustomMenuListSelect";
import CustomOption from "../component/dashboard/watchlist/order/orderComponents/helpers/customOptionReactSelect";
import useFetchOptions from "../component/hooks/useFetchOption";
import { useDebounce } from "../component/hooks/useDebounce";

const commonCustomStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "#fff",
    borderColor: "black",
  }),
  option: (provided) => ({
    ...provided,
    backgroundColor: "#fff",
    color: "black",
    fontSize: "14px",
  }),
};

export default function CustomSelect({
  value,
  onChange,
  placeholder = "Select Symbol",
  customStyles,
  exchangeType,
  components = {},
  isMulti = false,
  groupBySymbolName = false,
  maxMenuHeight = 250,
}) {
  const [searchValue, setSearchValue] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (!isClient) setIsClient(true);
  }, []);

  const debouncedSearchTerm = useDebounce(searchValue, 800);
  const { optionData, setOptionData, loading, fetchOptions } = useFetchOptions(
    exchangeType,
    groupBySymbolName
  );

  const handleInputChange = (inputValue) => {
    setSearchValue(inputValue);
  };

  useEffect(() => {
    if (debouncedSearchTerm?.trim()) {
      fetchOptions(debouncedSearchTerm);
    } else {
      // setOptionData([]);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    return () => {
      setOptionData([]);
    };
  }, []);

  return (
    <Select
      isMulti={isMulti}
      value={value}
      onChange={onChange}
      options={optionData}
      components={{
        ...{
          Option: CustomOption,
          MenuList: CustomMenuList,
        },
        ...components,
      }}
      styles={{ ...customStyles, ...commonCustomStyles }}
      isSearchable={true}
      maxMenuHeight={maxMenuHeight}
      placeholder={placeholder}
      onInputChange={handleInputChange}
      isLoading={loading}
      noOptionsMessage={() => "No Options"}
      menuPortalTarget={isClient ? document.body : null}
    />
  );
}
