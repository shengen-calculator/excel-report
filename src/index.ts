import ExpensesReport from "./ExpensesReport";
import * as fs from "fs";

const operationJson = fs.readFileSync('src/data/empty_operation.json', 'utf8');
const operations: any[] = JSON.parse(operationJson);
const report = new ExpensesReport(operations.map(o => {
    return {...o, date: new Date(o.date)}
}));
const data = report.getReportRows();
console.log(data);
