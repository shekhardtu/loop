import { useState, useEffect, useRef, useMemo } from "react";
import uniq from "lodash/uniq";
import debounce from "lodash/debounce";
import Multiselect from "multiselect-react-dropdown";
import DataTable from "react-data-table-component";

import "./App.css";
// Start Time: 12:30pm;

const dataSource = "./public/dataset_small.csv";

function CsvReader() {
  const filterQueue = useRef([]);
  const filter = useRef({});
  const [csvFile, setCsvFile] = useState();
  const [globalDataStore, setGlobalDataStore] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);
  const [headerItems, setHeaderItems] = useState();
  const [pending, setPending] = useState(false);

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

    const rows = str
      .slice(str.indexOf("\n") + 1)
      .split("\n")
      .filter((item) => item);

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
    setPending(false);
  };

  const submit = () => {
    setPending(true);
    const file = csvFile;
    const reader = new FileReader();
    reader.onload = function (e) {
      const text = e.target.result;
      processCSV(text);
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    setTimeout(() => {
      setPending(false);
    }, 500);
  }, [filterData]);

  const handleAddition = (mod, filterKeywords) => {
    setFilterData(() => {
      return filterData.filter((item) => {
        if (filterKeywords.includes(item[mod])) {
          return item;
        }
      });
    });
  };

  const handleRemoval = (mod) => {
    setFilterData(() => {
      if (filterQueue.current?.length == 0) {
        return globalDataStore;
      }

      if (filterQueue.current?.length == 1) {
        return globalDataStore.filter((item, index) => {
          for (const key in filter.current) {
            if (filter.current[key].length == 1) {
              return filter.current[key]?.includes(item[key]);
            }
          }
        });
      }

      return globalDataStore.filter((item, index) => {
        for (const key in filter.current) {
          if (filter.current[key].includes(item[key])) {
            return item;
          }
        }
      });
    });
  };

  const handleSelectedValues = (mod, filterKeywords) => {
    setPending(true);
    filter.current[mod] = filterKeywords;
    filterQueue.current.push(filter);
    handleAddition(mod, filterKeywords);
  };

  const handleUnSelectedValues = (mod, filterKeywords) => {
    setPending(true);
    filterQueue.current.pop();
    filter.current[mod] = filterKeywords;
    handleRemoval(mod, filter);
  };

  return (
    <>
      <form
        id="csv-form"
        className="outline outline-gray-500 rounded-md flex justify-center"
      >
        <div className=" flex my-4 justify-center items-center ">
          <input
            type="file"
            accept=".csv"
            id="csvFile"
            onChange={(e) => {
              setCsvFile(e.target.files[0]);
            }}
            className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
          ></input>
          <br />
          <button
            className="bg-indigo-500 px-10 py-2 text-white rounded-md"
            type="button"
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

      <div className="flex flex-row mx-auto w-full outline outline-gray-500 rounded-md">
        <div className="flex w-4/12 flex-col h-screen relative">
          <div className="flex-col p-4 ">
            {headerItems?.map((item, index) => {
              return (
                <div
                  key={item}
                  className="mb-4 flex flex-col justify-start items-center "
                >
                  <div className=" flex flex-col justify-center items-center ">
                    <label
                      htmlFor={item}
                      className="capitalize font-bold text-gray-600 w-full  text-left"
                    >
                      {item}
                    </label>

                    <Multiselect
                      className="w-[300px] h-9"
                      style={{
                        searchWrapper: {
                          width: "400px",
                        },
                        multiselectContainer: {
                          margin: "5px auto",
                        },
                        inputField: {},
                        optionContainer: {
                          // To change css for option container
                          border: "2px solid #ddd",
                          color: "#fff",
                        },
                        chips: { background: "red" },
                        searchBox: {
                          border: "2px solid #ddd",
                          display: "block",
                          borderBottom: "2px solid #ddd",
                          padding: "5px",
                        },
                        option: {
                          color: "#000",
                        },
                      }}
                      showArrow
                      options={uniq(
                        filterData.map((value, index) => value[item])
                      ).sort((a, b) => a - b)} // Options to display in the dropdown
                      onSelect={debounce(
                        (e) => handleSelectedValues(item, e),
                        1000
                      )} // Function will trigger on select event
                      onRemove={(e) => {
                        handleUnSelectedValues(item, e);
                      }} // Function will trigger on remove event
                      isObject={false}
                      showCheckbox={true}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex border-t py-6 bg-white mt-20">
            <div className="flex-1">
              <div className="text-lg text-gray-800 font-bold">
                {filterData.length}
              </div>
              <div className="text-xs text-gray-500">Filtered Data</div>
            </div>
            <div className="flex-1">
              <div className="text-lg text-gray-800 font-bold">
                {globalDataStore.length}
              </div>
              <div className="text-xs text-gray-500">Total Records</div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 border-l border-gray-500 relative">
          <div className="mx-auto sticky top-2 block">
            <CreateTable
              tableHeaders={tableHeaders}
              filterData={filterData}
              pending={pending}
            ></CreateTable>
          </div>
        </div>
      </div>
    </>
  );
}

const CreateTable = ({ tableHeaders, filterData, pending }) => {
  return (
    <>
      <DataTable
        columns={tableHeaders}
        data={filterData}
        fixedHeader
        fixedHeaderScrollHeight="1000px"
        pagination
        progressPending={pending}
        paginationPerPage={100}
        progressComponent={
          <div className=" font-bold text-lg mx-auto mt-32">Processing...</div>
        }
        paginationRowsPerPageOptions={[100, 200, 300, 400]}
      />
    </>
  );
};

function App() {
  return (
    <>
      <div className="flex flex-col container">
        <CsvReader />
      </div>
    </>
  );
}

export default App;
