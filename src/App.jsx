import { useState, useEffect, useRef, useMemo } from "react";
import uniq from "lodash/uniq";
import Multiselect from "multiselect-react-dropdown";
import DataTable from "react-data-table-component";

import "./App.css";
// Start Time: 01:00pm;

const dataSource = "./public/dataset_small.csv";

function CsvReader() {
  const filterQueue = useRef([]);
  const [csvFile, setCsvFile] = useState();
  const [globalDataStore, setGlobalDataStore] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);
  const [headerItems, setHeaderItems] = useState();
  const [numberDropdown, setNumberDropdown] = useState([]);

  const processCSV = (str = dataSource, delim = ",") => {
    let headersItems = str.slice(0, str.indexOf("\n")).split(delim);
    setHeaderItems(headersItems);

    let headers = str
      .slice(0, str.indexOf("\n"))
      .split(delim)
      .map((item, index) => {
        return {
          name: item.toUpperCase(),
          selector: (row) => row[item],
        };
      });
    setTableHeaders(headers);

    const rows = str.slice(str.indexOf("\n") + 1).split("\n");

    const newArray = rows.map((row) => {
      const values = row.split(delim);
      const eachObject = headersItems.reduce((obj = {}, header, i) => {
        obj[header] = values[i];

        return obj;
      }, {});
      return eachObject;
    });

    setGlobalDataStore(newArray);
    setFilterData(() => [...newArray]);
  };

  const submit = () => {
    const file = csvFile;
    const reader = new FileReader();
    reader.onload = function (e) {
      const text = e.target.result;
      processCSV(text);
    };
    reader.readAsText(file);
  };

  const [filters, setFilters] = useState([]);
  const [filterColumn, setFilterColumn] = useState();
  const [filterColumnKey, setFilterColumnKey] = useState();
  const [selectedValue, setSelectedValue] = useState({});

  const handleAddition = (mod, filterKeywords) => {
    setFilterData(() => {
      // if (filterQueue.current?.length == 0) {
      //   return globalDataStore;
      // }

      return filterData.filter((item) => {
        if (filterKeywords.includes(item[mod])) {
          return item;
        }
      });
    });
  };

  const handleRemoval = () => {
    setFilterData(() => {
      if (filterQueue.current?.length == 0) {
        return globalDataStore;
      }

      // if (filterQueue.current?.length == 1) {
      //   return globalDataStore.filter((item, index) => {
      //     return filterQueue.current[mod]?.includes(item[mod]);
      //   });
      // }
      return globalDataStore.filter((item, index) => {
        return stopKeywords.current[mod]?.includes(item[mod]);
      });
    });
  };

  const filter = useRef({});
  const handleSelectedValues = (mod, filterKeywords) => {
    filter.current[mod] = filterKeywords;

    setSelectedValue((selectedValue) => ({
      ...selectedValue,
      ...filter.current,
    }));

    filterQueue.current.push(filter);
    handleAddition(mod, filterKeywords);
    // setFilterColumn(mod);
    setFilterColumnKey(filter.current);
    // console.log(filter);
  };

  const handleUnSelectedValues = (mod, filterKeywords) => {
    filter.current[mod] = filterKeywords;
    setSelectedValue((selectedValue) => ({
      ...selectedValue,
      ...filter.current,
    }));

    filterQueue.current.pop();

    // handleAddition(mod, filterKeywords);

    handleRemoval(mod, filter);
    // console.log(filter);
  };

  return (
    <>
      <form id="csv-form">
        <div
          style={{
            display: "flex",
            justifyItems: "center",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <input
            type="file"
            accept=".csv"
            id="csvFile"
            onChange={(e) => {
              setCsvFile(e.target.files[0]);
            }}
          ></input>
          <br />
          <button
            onClick={(e) => {
              e.preventDefault();
              if (csvFile) submit();
            }}
          >
            Submit
          </button>
        </div>
      </form>
      <br />

      <>
        {headerItems?.map((item, index) => {
          return (
            <div key={item}>
              <Multiselect
                style={{
                  chips: { background: "red" },
                  searchBox: {
                    border: "1px solid #ddd",
                    display: "block",
                    borderBottom: "1px solid blue",
                    padding: "5px",
                  },
                  option: {
                    color: "#000",
                  },
                }}
                showArrow
                showCheckbox={true}
                caseSensitiveSearch={true}
                options={uniq(
                  filterData
                    .map((value, index) => value[item])
                    .filter((item) => item)
                ).sort((a, b) => a - b)} // Options to display in the dropdown
                selectedValues="" // Preselected value to persist in dropdown
                onSelect={(e) => handleSelectedValues(item, e)} // Function will trigger on select event
                onRemove={(e) => {
                  handleUnSelectedValues(item, e);
                }} // Function will trigger on remove event
                name={item}
                selectedValueDecorator={(e) => {
                  return e;
                }}
                isObject={false}
              />
            </div>
          );
        })}
        <div style={{ backgroundColor: "#ddd", color: "blue" }}>
          {filterData.length}&nbsp;
          {globalDataStore.length}
          <DataTable
            columns={tableHeaders}
            data={filterData}
            pagination
            paginationPerPage={100}
            paginationRowsPerPageOptions={[20, 30, 60, 80]}
          />
        </div>
      </>
    </>
  );
}

function App() {
  return (
    <>
      <div style={{ backgroundColor: "#fff", height: screen, width: "500px" }}>
        <CsvReader />
      </div>
    </>
  );
}

export default App;
