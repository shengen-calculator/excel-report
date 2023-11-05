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
                    this.removeTag(this.tags);
                }
                if (this.tags[i] !== operation.tags[i]) {
                    while (this.tags.length > i) {
                        this.removeTag(this.tags);
                    }
                    this.addTag(this.tags, operation.tags[i]);
                }
            }
            this.reportRows.push(operation);
        })
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

    private removeTag = (tags: string[]): void => {
        if(!this.filledGroups[this.getKey(tags)]) {
            this.reportRows.push({
                date: null,
                sum: 0,
                description: "",
                tags: tags
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
