const AppMethods = (setPending) => {
  const processCSV = (str, delim = ",") => {
    setPending(true);
    let headersItems = str.slice(0, str.indexOf("\n")).split(delim);

    let tableHeaders = str
      .slice(0, str.indexOf("\n"))
      .split(delim)
      .map((item, index) => {
        return {
          name: item.toUpperCase(),
          selector: (row) => row[item],
        };
      });

    const rows = str
      .slice(str.indexOf("\n") + 1)
      .split("\n")
      .filter((item) => item);

    const tableRows = rows.map((row) => {
      const values = row.split(delim);
      const eachObject = headersItems.reduce((obj = {}, header, i) => {
        obj[header] = values[i];
        return obj;
      }, {});
      return eachObject;
    });
    return { tableHeaders, tableRows, headersItems };
  };
  return {
    processCSV,
  };
};

export { AppMethods };
