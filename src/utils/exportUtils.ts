import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, convertInchesToTwip, PageOrientation,
  Header, Footer, PageNumber, NumberFormat, UnderlineType,
} from 'docx';
import ExcelJS from 'exceljs';

// ─── Word Export ─────────────────────────────────────────────────────────────

const WORD_COLORS = {
  accent: '4F46E5',
  dark: '0F172A',
  mid: '334155',
  light: '94A3B8',
  bg: 'F1F5F9',
  white: 'FFFFFF',
  border: 'E2E8F0',
};

function cleanLine(text: string): TextRun[] {
  // Parse inline bold/italic
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map(part => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return new TextRun({ text: part.slice(2, -2), bold: true, font: 'Calibri' });
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return new TextRun({ text: part.slice(1, -1), italics: true, font: 'Calibri' });
    }
    return new TextRun({ text: part, font: 'Calibri' });
  });
}

function parseMarkdownToDocx(markdown: string): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];
  const lines = markdown.split('\n');
  let i = 0;

  // Title page paragraph (document title = first H1 or "The Delegation")
  let docTitle = 'The Delegation — Output';

  while (i < lines.length) {
    const line = lines[i];

    // ── Headings ──
    if (line.startsWith('# ')) {
      const text = line.slice(2).trim();
      if (!docTitle.includes('—')) docTitle = text;
      elements.push(new Paragraph({
        children: [new TextRun({
          text: text.toUpperCase(),
          bold: true,
          size: 36,
          color: WORD_COLORS.dark,
          font: 'Calibri',
        })],
        spacing: { before: 480, after: 120 },
        border: { bottom: { style: BorderStyle.THICK, size: 6, color: WORD_COLORS.accent } },
      }));

    } else if (line.startsWith('## ')) {
      elements.push(new Paragraph({
        children: [new TextRun({
          text: line.slice(3).trim(),
          bold: true,
          size: 26,
          color: WORD_COLORS.accent,
          font: 'Calibri',
        })],
        spacing: { before: 360, after: 80 },
      }));

    } else if (line.startsWith('### ')) {
      elements.push(new Paragraph({
        children: [new TextRun({
          text: line.slice(4).trim(),
          bold: true,
          size: 22,
          color: WORD_COLORS.mid,
          font: 'Calibri',
          underline: { type: UnderlineType.SINGLE, color: WORD_COLORS.border },
        })],
        spacing: { before: 240, after: 60 },
      }));

    // ── Bullets ──
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(new Paragraph({
        children: cleanLine(line.slice(2).trim()),
        bullet: { level: 0 },
        spacing: { before: 40, after: 40 },
        indent: { left: convertInchesToTwip(0.25) },
      }));

    } else if (/^\s{2,4}[-*] /.test(line)) {
      elements.push(new Paragraph({
        children: cleanLine(line.replace(/^\s+[-*] /, '').trim()),
        bullet: { level: 1 },
        spacing: { before: 20, after: 20 },
      }));

    // ── Numbered list ──
    } else if (/^\d+\. /.test(line)) {
      elements.push(new Paragraph({
        children: cleanLine(line.replace(/^\d+\. /, '').trim()),
        numbering: { reference: 'default-numbering', level: 0 },
        spacing: { before: 40, after: 40 },
      }));

    // ── Table ──
    } else if (line.includes('|') && line.trim().startsWith('|')) {
      const headers = line.split('|').map(c => c.trim()).filter(Boolean);
      if (i + 1 < lines.length && lines[i + 1].includes('---')) {
        i += 2;
        const rows: string[][] = [];
        while (i < lines.length && lines[i].includes('|') && lines[i].trim().startsWith('|')) {
          rows.push(lines[i].split('|').map(c => c.trim()).filter(Boolean));
          i++;
        }

        const colWidth = Math.floor(9000 / Math.max(headers.length, 1));

        const table = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            // Header row
            new TableRow({
              tableHeader: true,
              children: headers.map(h => new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: h, bold: true, color: WORD_COLORS.white, font: 'Calibri', size: 18 })],
                  alignment: AlignmentType.CENTER,
                })],
                shading: { fill: WORD_COLORS.dark, type: ShadingType.SOLID },
                width: { size: colWidth, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                borders: {
                  top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                },
              })),
            }),
            // Data rows
            ...rows.map((row, idx) => new TableRow({
              children: (row.length ? row : ['']).map((cell, ci) => new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: headers[ci] !== undefined ? cell : cell, font: 'Calibri', size: 18 })],
                  alignment: /^-?[\d.,]+%?$/.test(cell.trim()) ? AlignmentType.RIGHT : AlignmentType.LEFT,
                })],
                shading: { fill: idx % 2 === 0 ? 'F8FAFC' : WORD_COLORS.white, type: ShadingType.SOLID },
                margins: { top: 60, bottom: 60, left: 120, right: 120 },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: WORD_COLORS.border },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: WORD_COLORS.border },
                  left: { style: BorderStyle.SINGLE, size: 1, color: WORD_COLORS.border },
                  right: { style: BorderStyle.SINGLE, size: 1, color: WORD_COLORS.border },
                },
              })),
            })),
          ],
        });
        elements.push(table);
        elements.push(new Paragraph({ text: '', spacing: { after: 160 } }));
        continue;
      }

    // ── Horizontal rule ──
    } else if (line.trim() === '---' || line.trim() === '***') {
      elements.push(new Paragraph({
        text: '',
        border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: WORD_COLORS.border } },
        spacing: { before: 120, after: 120 },
      }));

    // ── Empty line ──
    } else if (line.trim() === '') {
      elements.push(new Paragraph({ text: '', spacing: { after: 80 } }));

    // ── Normal text ──
    } else {
      elements.push(new Paragraph({
        children: cleanLine(line),
        spacing: { before: 40, after: 80 },
      }));
    }

    i++;
  }

  return elements;
}

export async function exportToWord(content: string, filename = 'delegation-output'): Promise<void> {
  const children = parseMarkdownToDocx(content);

  const doc = new Document({
    numbering: {
      config: [{
        reference: 'default-numbering',
        levels: [{ level: 0, format: NumberFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT }],
      }],
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1.2),
            right: convertInchesToTwip(1.2),
          },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [
              new TextRun({ text: 'The Delegation', bold: true, color: WORD_COLORS.accent, font: 'Calibri', size: 16 }),
              new TextRun({ text: '  ·  Generated by autonomous AI agents', color: WORD_COLORS.light, font: 'Calibri', size: 16 }),
            ],
            border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: WORD_COLORS.border } },
            spacing: { after: 120 },
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [
              new TextRun({ text: new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }), color: WORD_COLORS.light, font: 'Calibri', size: 16 }),
              new TextRun({ text: '     Page ', color: WORD_COLORS.light, font: 'Calibri', size: 16 }),
              new TextRun({ children: [PageNumber.CURRENT], color: WORD_COLORS.light, font: 'Calibri', size: 16 }),
            ],
            alignment: AlignmentType.RIGHT,
            border: { top: { style: BorderStyle.SINGLE, size: 1, color: WORD_COLORS.border } },
            spacing: { before: 80 },
          })],
        }),
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${Date.now()}.docx`;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── Excel Export ─────────────────────────────────────────────────────────────

const BRAND = {
  dark: '1A1A2E',
  accent: '4F46E5',
  accentLight: 'EEF2FF',
  headerBg: '1E293B',
  headerFg: 'FFFFFF',
  rowAlt: 'F8FAFC',
  rowNormal: 'FFFFFF',
  border: 'E2E8F0',
  h1: '0F172A',
  h2: '1E293B',
  h3: '334155',
  text: '475569',
  number: '4F46E5',
};

type ParsedBlock =
  | { type: 'h1' | 'h2' | 'h3'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'text'; text: string }
  | { type: 'empty' };

function parseMarkdown(markdown: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const lines = markdown.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', text: line.slice(2).trim() });
    } else if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3).trim() });
    } else if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4).trim() });
    } else if ((line.startsWith('- ') || line.startsWith('* '))) {
      blocks.push({ type: 'bullet', text: '• ' + line.slice(2).trim() });
    } else if (line.includes('|') && line.trim().startsWith('|')) {
      const headers = line.split('|').map(c => c.trim()).filter(Boolean);
      if (i + 1 < lines.length && lines[i + 1].includes('---')) {
        i += 2;
        const rows: string[][] = [];
        while (i < lines.length && lines[i].includes('|') && lines[i].trim().startsWith('|')) {
          rows.push(lines[i].split('|').map(c => c.trim()).filter(Boolean));
          i++;
        }
        blocks.push({ type: 'table', headers, rows });
        continue;
      }
    } else if (line.trim() === '') {
      blocks.push({ type: 'empty' });
    } else {
      blocks.push({ type: 'text', text: line.replace(/\*\*/g, '').trim() });
    }

    i++;
  }

  return blocks;
}

function isNumeric(val: string): boolean {
  return !isNaN(Number(val.replace(/[$%,]/g, '')));
}

export async function exportToExcel(content: string, filename = 'delegation-output'): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'The Delegation';
  wb.created = new Date();

  const ws = wb.addWorksheet('Output', {
    pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true },
    views: [{ showGridLines: false }],
  });

  ws.getColumn(1).width = 4;   // left margin
  ws.getColumn(2).width = 40;
  ws.getColumn(3).width = 20;
  ws.getColumn(4).width = 20;
  ws.getColumn(5).width = 20;
  ws.getColumn(6).width = 20;
  ws.getColumn(7).width = 4;   // right margin

  const blocks = parseMarkdown(content);
  let row = 2; // start with top margin

  for (const block of blocks) {
    if (block.type === 'h1') {
      const r = ws.getRow(row);
      ws.mergeCells(row, 2, row, 6);
      const cell = r.getCell(2);
      cell.value = block.text.toUpperCase();
      cell.font = { name: 'Calibri', size: 18, bold: true, color: { argb: BRAND.dark } };
      cell.alignment = { vertical: 'middle' };
      r.height = 36;
      row += 2;

    } else if (block.type === 'h2') {
      const r = ws.getRow(row);
      ws.mergeCells(row, 2, row, 6);
      const cell = r.getCell(2);
      cell.value = block.text;
      cell.font = { name: 'Calibri', size: 13, bold: true, color: { argb: BRAND.accent } };
      cell.border = { bottom: { style: 'medium', color: { argb: BRAND.accent } } };
      cell.alignment = { vertical: 'middle' };
      r.height = 26;
      row += 1;

    } else if (block.type === 'h3') {
      const r = ws.getRow(row);
      ws.mergeCells(row, 2, row, 6);
      const cell = r.getCell(2);
      cell.value = block.text;
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: BRAND.h3 } };
      r.height = 20;
      row += 1;

    } else if (block.type === 'bullet') {
      const r = ws.getRow(row);
      ws.mergeCells(row, 2, row, 6);
      const cell = r.getCell(2);
      cell.value = block.text;
      cell.font = { name: 'Calibri', size: 10, color: { argb: BRAND.text } };
      cell.alignment = { indent: 1 };
      r.height = 18;
      row += 1;

    } else if (block.type === 'table') {
      const colCount = Math.max(block.headers.length, ...block.rows.map(r => r.length));
      const startCol = 2;

      // Auto-size columns
      for (let c = 0; c < colCount; c++) {
        const col = ws.getColumn(startCol + c);
        const maxLen = Math.max(
          block.headers[c]?.length || 0,
          ...block.rows.map(r => (r[c] || '').length)
        );
        col.width = Math.min(Math.max(maxLen + 4, 12), 35);
      }

      // Header row
      const headerRow = ws.getRow(row);
      headerRow.height = 22;
      for (let c = 0; c < colCount; c++) {
        const cell = headerRow.getCell(startCol + c);
        cell.value = block.headers[c] || '';
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: BRAND.headerFg } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.headerBg } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: BRAND.headerBg } },
          bottom: { style: 'thin', color: { argb: BRAND.headerBg } },
          left: { style: 'thin', color: { argb: BRAND.headerBg } },
          right: { style: 'thin', color: { argb: BRAND.headerBg } },
        };
      }
      row++;

      // Data rows
      block.rows.forEach((dataRow, idx) => {
        const r = ws.getRow(row);
        r.height = 18;
        const bgColor = idx % 2 === 0 ? BRAND.rowNormal : BRAND.rowAlt;

        for (let c = 0; c < colCount; c++) {
          const cell = r.getCell(startCol + c);
          const val = dataRow[c] || '';
          const numeric = isNumeric(val);
          cell.value = numeric ? Number(val.replace(/[$%,]/g, '')) : val;
          cell.font = { name: 'Calibri', size: 10, color: { argb: numeric ? BRAND.number : BRAND.text } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
          cell.alignment = { horizontal: numeric ? 'right' : 'left', vertical: 'middle' };
          cell.border = {
            top: { style: 'hair', color: { argb: BRAND.border } },
            bottom: { style: 'hair', color: { argb: BRAND.border } },
            left: { style: 'hair', color: { argb: BRAND.border } },
            right: { style: 'hair', color: { argb: BRAND.border } },
          };
        }
        row++;
      });

      row += 2; // spacing after table

    } else if (block.type === 'text' && block.text) {
      const r = ws.getRow(row);
      ws.mergeCells(row, 2, row, 6);
      const cell = r.getCell(2);
      cell.value = block.text;
      cell.font = { name: 'Calibri', size: 10, color: { argb: BRAND.text } };
      cell.alignment = { wrapText: true };
      r.height = 18;
      row += 1;

    } else if (block.type === 'empty') {
      row += 1;
    }
  }

  // Generate and download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${Date.now()}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
