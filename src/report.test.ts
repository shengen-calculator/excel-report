import * as fs from "fs";
import ExpensesReport from "./ExpensesReport";

describe('Excel report test', () => {
    test(`Empty records test`, () => {
        const operationJson = fs.readFileSync('src/data/empty_operation.json', 'utf8');
        const operations = JSON.parse(operationJson);
        const reportJson = fs.readFileSync('src/data/empty.json', 'utf8');
        const expectedReportRows = JSON.parse(reportJson);
        const report = new ExpensesReport(operations);
        const reportRows = report.getReportRows();
        expect(expectedReportRows).toEqual(reportRows);
    });
    test(`Full records test`, () => {
        const operationJson = fs.readFileSync('src/data/full_operation.json', 'utf8');
        const operations = JSON.parse(operationJson);
        const reportJson = fs.readFileSync('src/data/full.json', 'utf8');
        const expectedReportRows = JSON.parse(reportJson);
        const report = new ExpensesReport(operations);
        const reportRows = report.getReportRows();
        expect(expectedReportRows).toEqual(reportRows);
    });
    test(`Mixed records test`, () => {
        const operationJson = fs.readFileSync('src/data/mixed_operation.json', 'utf8');
        const operations = JSON.parse(operationJson);
        const reportJson = fs.readFileSync('src/data/mixed.json', 'utf8');
        const expectedReportRows = JSON.parse(reportJson);
        const report = new ExpensesReport(operations);
        const reportRows = report.getReportRows();
        expect(expectedReportRows).toEqual(reportRows);
    })
});
