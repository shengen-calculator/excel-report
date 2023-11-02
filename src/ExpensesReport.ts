const xl = require("excel4node");

export default class ExpensesReport {
    private readonly wb: any;
    private readonly ws: any;
    private readonly data: Array<OperationRow>;

    constructor(data: Array<OperationRow>) {
        this.wb = new xl.Workbook({
            dateFormat: "d-m-yy",
        });
        this.ws = this.wb.addWorksheet("Manetta report");
        this.data = data;
    }

    public saveToFile = () => {
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].date) { // details
                this.ws.cell(i + 1, this.data[i].tags.length + 1).date(this.data[i].date);
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
