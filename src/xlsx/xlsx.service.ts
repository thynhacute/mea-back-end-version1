import { HttpStatus, Injectable } from '@nestjs/common';
import XlsxPopulate from 'xlsx-populate';
import * as fs from 'fs';
import { Response } from 'express';
import { NKResponseException } from '../core/exception';
import * as _ from 'lodash';
import { XLSXImportInventoryItem, XLSXImportPlanItem, XLSXIncorrectItem } from 'src/core/interface/xlsx';
import docx from 'docx';
import moment from 'moment';
@Injectable()
export class XlsxService {
    async create() {
        const workbook = await XlsxPopulate.fromBlankAsync();

        // Get the first sheet of the workbook
        const sheet = workbook.sheet(0);

        // Define your header row data
        const headers = ['Header 1', 'Header 2', 'Header 3'];

        // Write the headers to the sheet
        headers.forEach((header, index) => {
            const cell = sheet.cell(1, index + 1);
            cell.value(header);
            // Set the font to bold for the header
            cell.style({ bold: true });
        });

        const path = './cache-file/xlsx/example.xlsx';
        // Save the workbook to a file
        await workbook.toFileAsync(path);

        return path;
    }

    async createXlsx(data: { [key: string]: any }[]) {
        // delete cache file
        fs.unlinkSync('./cache-file/xlsx/example.xlsx');

        // copy file
        fs.copyFileSync('./cache-file/xlsx/sample.xlsx', './cache-file/xlsx/example.xlsx');

        const workbook = await XlsxPopulate.fromFileAsync('./cache-file/xlsx/example.xlsx');

        // Get the first sheet of the workbook
        const sheet = workbook.sheet(0);

        // Define your header row data
        const headers = Object.keys(data[0]);

        // Write the headers to the sheet
        headers.forEach((header, index) => {
            const cell = sheet.cell(1, index + 1);
            cell.value(header);
            // Set the font to bold for the header
            cell.style({ bold: true });
            //set width for column
            cell.style({ fill: { color: 'FBDAD7' } });
            sheet.column(index + 1).width(20);
        });

        // Write the data to the sheet
        data.forEach((item, index) => {
            const row = index + 2;
            headers.forEach((header, index) => {
                sheet.cell(row, index + 1).value(item[header]);
            });
        });

        const path = './cache-file/xlsx/example.xlsx';

        await workbook.toFileAsync(path);

        return '/static/xlsx/example.xlsx';
    }

    async createImportInventoryXlsx(data: XLSXIncorrectItem<XLSXImportInventoryItem>[]) {
        // delete cache file
        fs.unlinkSync('./cache-file/xlsx/example.xlsx');

        // copy file
        fs.copyFileSync('./cache-file/xlsx/sample.xlsx', './cache-file/xlsx/example.xlsx');

        const workbook = await XlsxPopulate.fromFileAsync('./cache-file/xlsx/example.xlsx');

        // Get the first sheet of the workbook
        const sheet = workbook.sheet(0);

        // Define your header row data
        const headers = [
            'Tên hàng',
            'Mã thiết bị',
            'Loại thiết bị',
            'Ngày sản xuất',
            'Hạn dùng',
            'Ngày bảo hành',
            'Mô tả',
            'Số lượng',
            'Đơn vị tính',
            'Đơn giá',
        ];

        // Write the headers to the sheet
        headers.forEach((header, index) => {
            const cell = sheet.cell(1, index + 1);
            cell.value(header);
            // Set the font to bold for the header
            cell.style({ bold: true });
            //set width for column
            sheet.column(index + 1).width(20);
            cell.style({ fill: { color: 'FBDAD7' } });
        });

        // Write the data to the sheet
        data.forEach((item, index) => {
            const row = index + 2;
            sheet.cell(row, 1).value(item.data.name);
            sheet.cell(row, 2).value(item.data.code);
            sheet.cell(row, 3).value(item.data.category);
            sheet.cell(row, 4).value(moment(item.data.mfd).format('DD/MM/YYYY'));
            sheet.cell(row, 5).value(moment(item.data.expiredDate).format('DD/MM/YYYY'));
            sheet.cell(row, 6).value(moment(item.data.warrantyDate).format('DD/MM/YYYY'));
            sheet.cell(row, 7).value(item.data.description);
            sheet.cell(row, 8).value(item.data.quantity);
            sheet.cell(row, 9).value(item.data.unit);
            sheet.cell(row, 10).value(item.data.price);
        });

        data.forEach((item, index) => {
            const row = index + 2;
            const errors = item.errors || [];
            errors.forEach((error) => {
                const column = headers.indexOf(error.column) + 1;

                const cell = sheet.cell(row, column);
                cell.style({ fill: { color: error.color } });
            });
        });
        const borderStyle = {
            style: 'thin',
            color: '000000',
        };

        sheet.usedRange().forEach((cell) => {
            cell.style({
                leftBorder: borderStyle,
                rightBorder: borderStyle,
                topBorder: borderStyle,
                bottomBorder: borderStyle,
            });
        });
        const path = './cache-file/xlsx/example.xlsx';

        await workbook.toFileAsync(path);

        return '/static/xlsx/example.xlsx';
    }

    async writeIncorrectDataToDocx(data: XLSXIncorrectItem<any>[]) {
        const p = data.map((item, index) => {
            const errors = item.errors || [];
            return new docx.Paragraph({
                children: [
                    new docx.TextRun({
                        text: `Hàng ${index + 1 + 1}: `,
                    }),

                    new docx.TextRun({
                        text: errors.map((error) => `${error.column} ${error.message}`).join(', '),
                    }),
                ],
            });
        });
        const doc = new docx.Document({
            styles: {
                paragraphStyles: [
                    {
                        id: 'Heading1',
                        name: 'Heading 1',
                        basedOn: 'Normal',
                        next: 'Normal',
                        quickFormat: true,
                        run: {
                            size: 28,
                            bold: true,
                        },
                        paragraph: {
                            spacing: {
                                after: 120,
                            },
                        },
                    },
                ],
            },
            sections: [
                {
                    properties: {},
                    children: p,
                },
            ],
        });

        const path = './cache-file/docx/example.docx';

        fs.writeFileSync(path, await docx.Packer.toBuffer(doc));

        return '/static/docx/example.docx';
    }

    async createImportPlanXlsx(data: XLSXIncorrectItem<XLSXImportPlanItem>[]) {
        // delete cache file
        fs.unlinkSync('./cache-file/xlsx/example.xlsx');

        // copy file
        fs.copyFileSync('./cache-file/xlsx/sample.xlsx', './cache-file/xlsx/example.xlsx');

        const workbook = await XlsxPopulate.fromFileAsync('./cache-file/xlsx/example.xlsx');

        // Get the first sheet of the workbook
        const sheet = workbook.sheet(0);

        // Define your header row data
        const headers = [
            'Tên thiết bị',
            'Mã thiết bị',
            'Kiểu máy',
            'Loại thiết bị',
            'Hãng',
            'Mô tả',
            'Số lượng',
            'Đơn vị tính',
            'Đơn giá',
            'Thành tiền',
            'Thông tin liên hệ',
        ];

        // Write the headers to the sheet
        headers.forEach((header, index) => {
            const cell = sheet.cell(1, index + 1);
            cell.value(header);
            // Set the font to bold for the header
            cell.style({ bold: true });
            //set width for column
            sheet.column(index + 1).width(20);
            cell.style({ fill: { color: 'FBDAD7' } });
        });

        // Write the data to the sheet
        data.forEach((item, index) => {
            const row = index + 2;
            sheet.cell(row, 1).value(item.data.name);
            sheet.cell(row, 2).value(item.data.code);
            sheet.cell(row, 3).value(item.data.machine);
            sheet.cell(row, 4).value(item.data.category);
            sheet.cell(row, 5).value(item.data.brand);
            sheet.cell(row, 6).value(item.data.description);
            sheet.cell(row, 7).value(item.data.quantity);
            sheet.cell(row, 8).value(item.data.unit);
            sheet.cell(row, 9).value(item.data.price);
            sheet.cell(row, 10).value(item.data.total);
            sheet.cell(row, 11).value(item.data.contact);
        });

        data.forEach((item, index) => {
            const row = index + 2;
            const errors = item.errors || [];
            errors.forEach((error) => {
                const column = headers.indexOf(error.column) + 1;

                const cell = sheet.cell(row, column);
                cell.style({ fill: { color: error.color } });
            });
        });

        const borderStyle = {
            style: 'thin',
            color: '000000',
        };

        sheet.usedRange().forEach((cell) => {
            cell.style({
                leftBorder: borderStyle,
                rightBorder: borderStyle,
                topBorder: borderStyle,
                bottomBorder: borderStyle,
            });
        });
        const path = './cache-file/xlsx/example.xlsx';

        await workbook.toFileAsync(path);

        return '/static/xlsx/example.xlsx';
    }

    async sendXlsx(res: Response, path: string, name: string) {
        try {
            // Check if the file exists
            if (fs.existsSync(path)) {
                // Set the response headers for the download
                res.setHeader('Content-Disposition', 'attachment; filename=' + name + '.xlsx');
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

                // Send the file to the user
                const fileStream = fs.createReadStream(path);
                return fileStream.pipe(res);
            } else {
                throw new NKResponseException('File not found', HttpStatus.NOT_FOUND);
            }
        } catch (error) {
            throw new NKResponseException('Error downloading the file', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
