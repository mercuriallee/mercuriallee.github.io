const Excel = ExcelJS;

var generateIASWorkbook = async function({log, workbook}) {

    const HeaderMaps = {id: '编号', time: '时间', revNum: '收入金额', desc: '明细', revName: '收款人', agent: '经手人', note: '备注', fapiao: '发票'};
    const MustHave = ['编号', '时间', '收入金额', '明细', '收款人', '经手人', '备注'];
    const MustNotNull = ['编号', '时间', '收入金额', '收款人'];
    const OutputSheetName = '借收明细';

    const HeaderRowHeight = 35;
    const ClassHeaderRowHeight = 25;
    const ContentRowHeight = 25;
    const BlankRowHeight = 25;

    const TotalRowFont = { name: 'Arial Black', size: 12, bold: true };
    const TotalSummaryFont = { name: 'Arial Black', size: 14, bold: true };
    const OutputSheetColumns = [
        {key: 'revName', header: '借款人', width: 20},
        {key: 'time', header: '时间', width: 12, style: {numFmt: 'yyyy.mm.dd'}},
        {key: 'revNum', header: '金额', width: 15},
        {key: '', header: '事由', width: 10},
        {key: 'agent', header: '经手人', width: 10},
        {key: 'fapiao', header: '发票', width: 10},
        {key: 'note', header: '备注', width: 20},
    ];
    const TotalRowHeight = 30;
    const TotalSummaryHeight = 35;
    const RevTotalRowHeight = 25;
    const RevTotalRowFont = {size: 11, bold: true, italic: true, color: {argb: 'FFFF0000'}};

    let outputWb = await buildIASSheet(workbook);

    // Inner Accountant Summary
    async function buildIASSheet(workbook) {
        let wb = workbook;

        const dumpData = [];
        wb.eachSheet((sheet, _) => {
            let headerNotFound = true;
            const needs = new Set(MustHave);
            sheet.getRow(1).eachCell((cell, col)=> {
                let text = cell.text.replace(/\s/g, '');
                for(let key in HeaderMaps) {
                    let title = HeaderMaps[key];
                    if(new RegExp(title).test(text)) {
                        sheet.getColumn(col).key = key;
                        needs.delete(title);
                        break;
                    }
                }
                // MustHave-Headers fullfill.
                if(needs.size == 0) {
                    headerNotFound = false;
                    return;
                }
                // end cell iterator.
            });

            // header not fullfill, invalid sheet.
            if(headerNotFound) {
                return;
            }

            sheet.eachRow((row, rowNum) => {
                // skip head row.
                if(rowNum == 1) return;
                let data = {};
                let TimeValid = true;
                row.eachCell((cell, _)=> {
                    let value = cell.value, key = cell._column.key;
                    if(key == 'time') {
                        try {
                            value = parseDate(value);
                        }catch(err) {
                            TimeValid = false;
                        }
                    } 
                    data[key] = value;
                })
                if(!TimeValid) {
                    log(`表《${row._worksheet.name}》，第${rowNum}行，编号${row.getCell('id')}，时间格式有误，已舍弃(${JSON.stringify(row.getCell('time').value)}).`);
                    return;
                }

                // check if MustNotNull's columns fullfill.
                for(let key in HeaderMaps) {
                    let title = HeaderMaps[key];
                    if(MustNotNull.includes(title)) {
                        // not fullfill MustNotNull Rule.
                        if(data[key] == null) {
                            let id = row.getCell('id');
                            if(!isNaN(id)) {
                                log(`表《${row._worksheet.name}》，第${rowNum}行，编号${id}，${HeaderMaps[key]}的值为空，已舍弃.`);
                            }
                            return;
                        }
                    }
                }

                dumpData.push(data);

            // end row iterator.
            })

        // end sheet iterator.
        });

        // create now sheet and fill rows group by desc.
        // dict - {desc: [rowData]}
        let dict = {};
        for(let rowData of dumpData) {
            let {desc} = rowData;
            if(dict[desc] == null) dict[desc] = [];
            dict[desc].push(rowData);
        }
        for(let desc in dict) {
            dict[desc].sort(({revName: n1, time: t1},{revName: n2, time: t2}) => {
                return n1 == n2 ? t1-t2 : (n1 < n2) ? -1 : 1;
            })
        }

        let outWb = new Excel.Workbook();
        let outSheet = outWb.addWorksheet(OutputSheetName);
        outSheet.columns = OutputSheetColumns;
        // header line style
        outSheet.getRow(1).height = HeaderRowHeight;

        let curRow = 2;
        for(let cls in dict) {
            //class header row.
            outSheet.mergeCells(curRow, 1, curRow, OutputSheetColumns.length);
            let cell = outSheet.getRow(curRow++).getCell('revName');
            cell._row.height = ClassHeaderRowHeight;
            cell.value = cls;
            cell.style.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFE3EBCC'}};

            for(let col=1; col<=OutputSheetColumns.length; col++) {
                let cell = outSheet.getRow(curRow).getCell(col);
                cell.value = cell._column.header;
                cell.style.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFE3EBCC'}};
            }
            outSheet.getRow(curRow).height = ClassHeaderRowHeight;
            curRow++;

            // content rows.
            let totalStartAddress = outSheet.getRow(curRow).getCell('revNum').address;
            for(let i=0, top=curRow, curRev=dict[cls][0].revName; i<dict[cls].length; i++) {
                let {revName, time, revNum, agent, note, fapiao} = dict[cls][i];
                outSheet.getRow(curRow).values = {
                    revName, time, revNum, agent, note, fapiao
                };
                outSheet.getRow(curRow).height = ContentRowHeight;
                curRow++;

                //rev summary row.
                if(i+1 == dict[cls].length || curRev != dict[cls][i+1].revName) {
                    outSheet.getRow(curRow).style.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFEFEFEF'}};
                    outSheet.getRow(curRow).style.font = RevTotalRowFont;
                    let topAddress    = outSheet.getRow(top).getCell('revNum').address,
                        bottomAddress = outSheet.getRow(curRow-1).getCell('revNum').address;
                    outSheet.getRow(curRow).values = {
                        'revName': '总计', 'revNum': {formula: `SUBTOTAL(109, ${topAddress}:${bottomAddress})`}
                    };
                    outSheet.getRow(curRow).height = RevTotalRowHeight;
                    if(i+1 < dict[cls].length) {
                        curRev = dict[cls][i+1].revName;
                    }
                    curRow++;
                    top = curRow;
                }
            }
            let totalEndAddress = outSheet.getRow(curRow).getCell('revNum').address;

            // blank row.
            curRow += 1;
            // total row.
            outSheet.getRow(curRow).style.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFFFFF00'}};
            outSheet.getRow(curRow).style.font = TotalRowFont;
            outSheet.getRow(curRow).values = {
                'revName': '总计', 'revNum': {formula: `SUBTOTAL(109, ${totalStartAddress}:${totalEndAddress})`}
            };
            outSheet.getRow(curRow).height = TotalRowHeight;
            // two blank row.
            curRow += 2;

        // end dict iterator.
        }

        // total summary row.
        outSheet.getRow(curRow).style.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFFFFF00'}};
        outSheet.getRow(curRow).style.font = TotalSummaryFont;
        outSheet.getRow(curRow).values = {
            'revName': '总计', 'revNum': {formula: `SUBTOTAL(109, ${outSheet.getRow(1).getCell('revNum').address}:${outSheet.getRow(curRow-1).getCell('revNum').address})`}
        };
        outSheet.getRow(curRow).height = TotalSummaryHeight;
        // two blank row.
        curRow += 2;

        // set alignment and border.
        for(let r=1; r <= outSheet.rowCount; r++) {
            let row = outSheet.getRow(r);
            if(row.values.length == 0) {
                row.height = BlankRowHeight;
                outSheet.mergeCells(r, 1, r, outSheet.columnCount);
            }
            for(let c = 1; c <= OutputSheetColumns.length; c++) {
                let style = row.getCell(c).style;
                style.alignment = {vertical: 'middle', horizontal: 'center'};
                style.border = {
                    left: {style: 'thin'},
                    right: {style: 'thin'},
                    left: {style: 'thin'},
                    bottom: {style: 'thin'},
                };
            }
        }

        return outWb;

        function parseDate(object) {
            if(toString.apply(object) == '[object Date]') {
                return object;
            }
            if(typeof(object) == 'number') {
                return object;
            }
            if(typeof object == 'string') {
                let regs = [/^(\d{4})(\d{2})(\d{2})$/,
                            /^(\d{4})-(\d{2})-(\d{2})$/,
                            /^(\d{4})\.(\d{2})\.(\d{2})$/];
                    str = object.trim();
                for(let reg of regs) {
                    let res = str.match(reg);
                    let date = null;
                    let year, month, day;
                    if(res != null) {
                        [, year, month, day] = res;
                        try{
                            date = new Date(year, month-1, day);
                        } catch(err) {
                            throw err;
                        }
                    }
                    return date;
                }
            }
            throw "Not Valid Date";
        }
    }

    return outputWb;
};
