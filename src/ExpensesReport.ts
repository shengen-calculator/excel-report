const xl = require("excel4node");

export default class ExpensesReport {
    private readonly wb: any;
    private readonly ws: any;
    private readonly data: Array<Operation>;
    private readonly reportRows: Array<ReportRow> = new Array<ReportRow>();
    private readonly totals: Record<string, number> = {};
    private readonly filledGroups: Record<string, boolean> = {};
    private readonly tags: Array<string> = [];
    private readonly headerStyle: any;
    private readonly groupStyle: any;
    private readonly detailsStyle: any;
    private readonly detailsSumStyle: any;
    private readonly topShift: number = 4;



    constructor(data: Array<Operation>) {
        this.wb = new xl.Workbook({
            dateFormat: "d-m-yy",
        });
        this.ws = this.wb.addWorksheet("Manetta report");
        this.data = data;
        this.headerStyle = this.createHeaderStyle();
        this.groupStyle = this.createGroupStyle();
        this.detailsStyle = this.createDetailsStyle();
        this.detailsSumStyle = this.createDetailsSumStyle();
        this.createHeader();
        this.createReportRows();
    }

    /**
     * Create header style
     * @return {any}
     */
    private createHeaderStyle = () => {
        return this.wb.createStyle({
            font: {
                color: "#4F33FF",
                size: 16,
            }
        });
    };

    /**
     * Create group style
     * @return {any}
     */
    private createGroupStyle = () => {
        return this.wb.createStyle({
            font: {
                color: "#FF0800",
                size: 16,
            },
            numberFormat: "€#,##0.00; (€#,##0.00); -",
        });
    };

    /**
     * Create details style
     * @return {any}
     */
    private createDetailsStyle = () => {
        return this.wb.createStyle({
            font: {
                size: 14,
            }
        });
    };

    /**
     * Create details price style
     * @return {any}
     */
    private createDetailsSumStyle = () => {
        return this.wb.createStyle({
            font: {
                size: 16,
            },
            numberFormat: "€#,##0.00; (€#,##0.00); -",
        });
    };

    private createHeader = () => {
        this.ws.cell(1, 1)
            .string(`Start Date`)
            .style(this.headerStyle);
        this.ws.cell(1, 2)
            .date(new Date())
            .style(this.headerStyle);
        this.ws.cell(2, 1)
            .string(`End Date`)
            .style(this.headerStyle);
        this.ws.cell(2, 2)
            .date(new Date())
            .style(this.headerStyle);
    };

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
                this.ws.cell(i + this.topShift, this.reportRows[i].tags.length + 1)
                    .date(this.reportRows[i].date)
                    .style(this.detailsStyle);
                this.ws.cell(i + this.topShift, this.reportRows[i].tags.length + 2)
                    .string(this.reportRows[i].description)
                    .style(this.detailsStyle);
                this.ws.cell(i + this.topShift, this.reportRows[i].tags.length + 3)
                    .number(this.reportRows[i].sum)
                    .style(this.detailsSumStyle);

                this.ws.row(i + this.topShift).group(this.reportRows[i].tags.length, true);
            } else if(this.reportRows[i].sum > 0) { // header
                this.ws.cell(i + this.topShift, this.reportRows[i].tags.length)
                    .string(this.reportRows[i].tags[this.reportRows[i].tags.length - 1])
                    .style(this.groupStyle);
                this.ws.cell(i + this.topShift, this.reportRows[i].tags.length + 1)
                    .number(this.reportRows[i].sum)
                    .style(this.groupStyle);
                if(this.reportRows[i].tags.length > 1) {
                    this.ws.row(i + this.topShift).group(this.reportRows[i].tags.length - 1, true);
                }
            } else { // footer (empty)
                this.ws.row(i + this.topShift).group(this.reportRows[i].tags.length, true);
            }
        }
        this.wb.write('ExcelFile.xlsx');
    }
}
