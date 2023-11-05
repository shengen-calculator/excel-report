const xl = require("excel4node");

export default class ExpensesReport {
    private readonly wb: any;
    private readonly ws: any;
    private readonly data: Array<Operation>;
    private readonly reportRows: Array<ReportRow> = new Array<ReportRow>();
    private readonly totals: Record<string, number> = {};
    private readonly filledGroups: Record<string, boolean> = {};
    private readonly tags: Array<string> = [];

    constructor(data: Array<Operation>) {
        this.wb = new xl.Workbook({
            dateFormat: "d-m-yy",
        });
        this.ws = this.wb.addWorksheet("Manetta report");
        this.data = data;
        this.createReportRows();
    }

    private createReportRows = () => {
        const orderedData = this.data.sort(this.compareFn);
        this.countTotals();

        orderedData.forEach(operation => {
            for (let i = 0; i < operation.tags.length; i++) {
                while (this.tags.length > operation.tags.length) {
                    this.removeTag();
                }
                if (this.tags[i] !== operation.tags[i]) {
                    while (this.tags.length > i) {
                        this.removeTag();
                    }
                    this.addTag(this.tags, operation.tags[i]);
                }
            }
            this.reportRows.push(operation);
        });

        while (this.tags.length > 0) {
            this.removeTag();
        }
    };

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

    public getReportRows = (): Array<ReportRow> => {
        return this.reportRows;
    };

    private addTag = (tags: string[], tag: string): void => {
        this.reportRows.push({
            date: null,
            sum: this.totals[this.getKey([...tags, tag])],
            description: "",
            tags: [...tags, tag]
        });
        this.tags.push(tag);
    };

    private removeTag = (): void => {
        if(!this.filledGroups[this.getKey(this.tags)]) {
            this.reportRows.push({
                date: null,
                sum: 0,
                description: "",
                tags: [...this.tags]
            });
        }
        this.tags.pop();
    };

    private countTotals = (): void => {
        this.data.forEach(o => {
            for (let i = 0; i < o.tags.length; i++) {
                this.totals[this.getKey(o.tags.slice(0, i + 1))] =
                    (this.totals[this.getKey(o.tags.slice(0, i + 1))] || 0) + o.sum;
            }
            this.filledGroups[this.getKey(o.tags)] = true;
        });
    };

    private getKey = (tags: string[]) => tags.join("|");

    public saveToFile = () => {
        for (let i = 0; i < this.reportRows.length; i++) {
            if (this.reportRows[i].date) { // details
                this.ws.cell(i + 1, this.reportRows[i].tags.length + 1).date(this.reportRows[i].date);
                this.ws.cell(i + 1, this.reportRows[i].tags.length + 2).number(this.reportRows[i].sum);
                this.ws.cell(i + 1, this.reportRows[i].tags.length + 3).string(this.reportRows[i].description);
                this.ws.row(i + 1).group(this.reportRows[i].tags.length, true);
            } else if(this.reportRows[i].sum > 0) { // header
                this.ws.cell(i + 1, this.reportRows[i].tags.length)
                    .string(`${this.reportRows[i].tags[this.reportRows[i].tags.length - 1]} - ${this.reportRows[i].sum}`);
                if(this.reportRows[i].tags.length > 1) {
                    this.ws.row(i + 1).group(this.reportRows[i].tags.length - 1, true);
                }
            } else { // footer (empty)
                this.ws.row(i + 1).group(this.reportRows[i].tags.length, true);
            }
        }
        this.wb.write('ExcelFile.xlsx');
    }
}
