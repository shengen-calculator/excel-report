import ExpensesReport from "./ExpensesReport";
import * as fs from "fs";

const operationJson = fs.readFileSync('src/data/full_operation.json', 'utf8');
const operations: any[] = JSON.parse(operationJson);
const report = new ExpensesReport(operations);
report.getReportRows();
