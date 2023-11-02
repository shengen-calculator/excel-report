import ExpensesReport from "./ExpensesReport";
import * as fs from "fs";

fs.readFile("src/data/full.json", "utf8", function (err, data) {
    if (err) throw err;
    const dataObject = JSON.parse(data);
    const report = new ExpensesReport(dataObject);
    report.saveToFile();
});
