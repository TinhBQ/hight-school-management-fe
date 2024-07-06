/* eslint-disable @typescript-eslint/no-explicit-any */
import * as FileSaver from 'file-saver';

import { Injectable } from '@angular/core';

import { font } from '@core/utils/font';

@Injectable({
  providedIn: 'root',
})
export class TableExportService {
  exportExcel(data: any, name: string) {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(data);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      this.saveAsExcelFile(excelBuffer, name);
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    FileSaver.saveAs(
      data,
      'smsedu_' + fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
    );
  }

  exportPdf(exportColumns: any, data: any, fileName: string, title: string) {
    import('jspdf').then((jsPDF) => {
      import('jspdf-autotable').then(() => {
        const doc = new jsPDF.default();
        doc.addFileToVFS('arial-normal.ttf', font);
        doc.addFont('arial-normal.ttf', 'arial', 'normal');
        doc.setFont('arial', 'normal');

        (doc as any).autoTable({
          columnStyles: {
            europe: { halign: 'center' },
            0: { font: 'arial', fontStyle: 'normal' }, // Apply the font to the first column
          },
          head: [exportColumns],
          body: data,
          margin: { top: 35 },
          didDrawPage: function () {
            doc.text(title, 20, 30);
          },
          styles: {
            font: 'arial',
            fontStyle: 'normal',
          },
        });
        doc.save('smsedu_' + fileName + '_export_' + new Date().getTime());
      });
    });
  }
}
