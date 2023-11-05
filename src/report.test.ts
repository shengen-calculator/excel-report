import * as fs from "fs";
import ExpensesReport from "./ExpensesReport";

describe('Excel report test', () => {
    test(`Empty records test`, () => {
        runExpensesReportTest('src/data/empty_operation.json', 'src/data/empty.json');
    });
    test(`Full records test`, () => {
        runExpensesReportTest('src/data/full_operation.json', 'src/data/full.json');
    });
    test(`Mixed records test`, () => {
        runExpensesReportTest('src/data/mixed_operation.json', 'src/data/mixed.json');
    })
});

const runExpensesReportTest = (operationsPath: string, rowsPath: string) => {
    const operationJson = fs.readFileSync(operationsPath, 'utf8');
    const operations: any[] = JSON.parse(operationJson);
    const reportJson = fs.readFileSync(rowsPath, 'utf8');
    const expectedReportRows = JSON.parse(reportJson);
    const report = new ExpensesReport(operations.map(o => {
        return {...o, date: new Date(o.date)}
    }));
    const reportRows: any[] = report.getReportRows().map(row => {
        return {...row, date: row.date ? row.date.toISOString().split('T')[0] : null}
    });
    expect(expectedReportRows).toEqual(reportRows);
};
