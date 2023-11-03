import ExpensesReport from "./ExpensesReport";
import * as fs from "fs";

const operationJson = fs.readFileSync('src/data/one_operation.json', 'utf8');
const operations = JSON.parse(operationJson);
const report = new ExpensesReport(operations);
const data = report.getReportRows();
console.log(data);
