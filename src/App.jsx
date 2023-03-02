import { useState } from "react";

import "./App.css";
// Start Time: 01:00pm;

const dataSource = "./public/dataset_small.csv";

function CsvReader() {
  const [csvFile, setCsvFile] = useState();
  const [tableData, setTableData] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);
  // [{name: "", age: 0, rank: ""},{name: "", age: 0, rank: ""}]

  const processCSV = (str = dataSource, delim = ",") => {
    let headers = str
      .slice(0, str.indexOf("\n"))
      .split(delim)
      .map((item, index) => {
        debugger;
        const value = item;

        return {
          name: item,
          selector: (row) => row[value],
        };
      });
    setTableHeaders(headers);
    const rows = str.slice(str.indexOf("\n") + 1).split("\n");

    const newArray = rows.map((row) => {
      const values = row.split(delim);
      const eachObject = headers.reduce((obj, header, i) => {
        obj[header] = values[i];
        return obj;
      }, {});
      return eachObject;
    });
    setTableData(newArray);
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
  return (
    <form id="csv-form">
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
      <br />
      <br />
      {tableData.length > 0 ? (
        <>
          {/* {JSON.stringify(tableData)}
          {JSON.stringify(tableHeaders)} */}

          <DataTable columns={tableHeaders} data={tableData} />
        </>
      ) : null}
    </form>
  );
}

import DataTable from "react-data-table-component";
function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <CsvReader />
    </>
  );
}

export default App;
