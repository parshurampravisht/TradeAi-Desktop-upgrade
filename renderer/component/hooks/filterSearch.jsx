import React, { useState } from "react";
import { Input } from "@nextui-org/react";
import { IconSearch } from "@tabler/icons-react";

const FilterSearch = ({ data, fieldToFilter, onFilterChange }) => {
  const [filterValue, setFilterValue] = useState("");

  const handleFilterChange = (event) => {
    
    const inputValue = event.target.value;
    setFilterValue(inputValue);

    let filteredData = null;
    if (data instanceof Array) {
      // If data is an array,
      

      filteredData = data.filter((item) =>{
        // ]),
        // item[fieldToFilter.toLowerCase()].includes(inputValue.toLowerCase())
        const fieldData = item[fieldToFilter].toString().toLowerCase();
        
        return fieldData && fieldData.includes(inputValue.toLowerCase());
    });

      // filteredData = data.filter((item) => {
      //   const fieldData = item[fieldToFilter.toLowerCase()]; // Get the field data
      //   return (
      //     fieldData &&
      //     fieldData.toLowerCase().includes(inputValue.toLowerCase())
      //   );
      // });
    } else if (typeof data === "object") {
      // If data is an object, filter the object keys based on the filter condition
      
      const filteredKeys = Object.keys(data).filter((key) =>
        key.toLowerCase().includes(inputValue.toLowerCase())
      );
      filteredData = {};
      filteredKeys.forEach((key) => {
        filteredData[key] = data[key];
      });
    }

    //callback function where ever this component is used
    onFilterChange(filteredData);
  };
  return (
    <Input
      initialValue={filterValue}
      labelPlaceholder={`Search by ${fieldToFilter}`}
      type="search"
      className="border-radius-8"
      onChange={handleFilterChange}
      css={{
        borderColor:"transparent",
        maxHeight:"32px",
        height:"32px",
        // marginTop: "1rem",
        // width: "30%",
        // marginLeft:"65%",
        boxShadow: "1px 1px 3px 0 grey",
        width: "100%",
      }}
      contentRight={<IconSearch />}
    />
  );
};

export default FilterSearch;
