const xl = require("excel4node");

export default class ExpensesReport {
    private readonly wb: any;
    private readonly ws: any;
    private readonly data: Array<Operation>;
    private readonly reportRows: Array<ReportRow> = new Array<ReportRow>();

    constructor(data: Array<Operation>) {
        this.wb = new xl.Workbook({
            dateFormat: "d-m-yy",
        });
        this.ws = this.wb.addWorksheet("Manetta report");
        this.data = data;
        this.createReportRows();
    }

    private createReportRows() {
        const orderedData = this.data.sort(this.compareFn);
        orderedData.forEach(operation => {
            this.reportRows.unshift({
                date: operation.date,
                description: operation.description,
                tags: operation.tags,
                sum: operation.sum
            })
        })
    }

    private compareFn = (a: Operation, b: Operation): number => {
        const aTag = a.tags.join("");
        const bTag = b.tags.join("");

        if(aTag === bTag) {
            return a.date > b.date ? 1 : -1;
        }

        if(~aTag.indexOf(bTag)) {
            return -1;
        }

        if(~bTag.indexOf(aTag)) {
            return 1;
        }

        return aTag.localeCompare(bTag);
    };

    public getReportRows(): Array<ReportRow> {
        return this.reportRows;
    }

    public saveToFile = () => {
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].date) { // details
                this.ws.cell(i + 1, this.data[i].tags.length + 1).date(new Date(this.data[i].date || 0));
                this.ws.cell(i + 1, this.data[i].tags.length + 2).number(this.data[i].sum);
                this.ws.cell(i + 1, this.data[i].tags.length + 3).string(this.data[i].description);
                this.ws.row(i + 1).group(this.data[i].tags.length, true);
            } else if(this.data[i].sum > 0) { // header
                this.ws.cell(i + 1, this.data[i].tags.length)
                    .string(`${this.data[i].tags[this.data[i].tags.length - 1]} - ${this.data[i].sum}`);
                if(this.data[i].tags.length > 1) {
                    this.ws.row(i + 1).group(this.data[i].tags.length - 1, true);
                }
            } else { // footer (empty)
                this.ws.row(i + 1).group(this.data[i].tags.length, true);
            }
        }
        this.wb.write('ExcelFile.xlsx');
    }
}
