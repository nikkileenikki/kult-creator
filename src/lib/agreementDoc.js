import {
  Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun,
  WidthType, ShadingType, VerticalAlign, BorderStyle, AlignmentType,
} from 'docx'

const PINK = 'E64980'
const GRAY = 'D9D9D9'
const WHITE = 'FFFFFF'
const BORDER = { style: BorderStyle.SINGLE, size: 4, color: '000000' }
const CELL_BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER }

function cellShading(color) {
  return { fill: color, type: ShadingType.CLEAR, color: 'auto' }
}

function textCell({ text, bold, italic, size = 20, color = '000000', shading, colSpan, width, align, valign = VerticalAlign.TOP }) {
  return new TableCell({
    columnSpan: colSpan,
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    borders: CELL_BORDERS,
    shading: shading ? cellShading(shading) : undefined,
    verticalAlign: valign,
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: Array.isArray(text) ? text : [
      new Paragraph({
        alignment: align,
        children: [new TextRun({ text, bold, italics: italic, size, color })],
      }),
    ],
  })
}

function sectionHeaderRow(title, note, colSpan = 2) {
  const children = [new TextRun({ text: title, bold: true, size: 22 })]
  if (note) children.push(new TextRun({ text: `  ${note}`, italics: true, size: 18 }))
  return new TableRow({
    children: [textCell({ text: [new Paragraph({ children })], shading: GRAY, colSpan })],
  })
}

function checkboxLine(label, checked) {
  return new TextRun({ text: `${checked ? '☒' : '☐'} ${label}`, size: 20 })
}

function signatoryCell(label, name, email, nric, colSpan) {
  const lines = [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20 })] })]
  lines.push(new Paragraph({ children: [new TextRun({ text: name || '', size: 20 })] }))
  if (email) lines.push(new Paragraph({ children: [new TextRun({ text: email, size: 20 })] }))
  if (nric) lines.push(new Paragraph({ children: [new TextRun({ text: `NRIC/Passport: ${nric}`, size: 18, italics: true })] }))
  return textCell({ text: lines, width: colSpan ? undefined : 50, colSpan })
}

export function generateAgreementDocx(data) {
  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Title
      new TableRow({
        children: [textCell({ text: 'ASTRO DOCUSIGN & STAMPING INFORMATION SHEET', bold: true, size: 26, color: 'FFFFFF', shading: PINK, colSpan: 2, align: AlignmentType.CENTER })],
      }),

      // Astro signatories
      sectionHeaderRow('ASTRO SIGNATORIES', '– Full Name and Email Address. It is the responsibility of the contract owner to ensure that the Astro signatory has the proper LOA to sign the document.'),
      new TableRow({
        children: [
          signatoryCell('1.', data.astroSignatory1Name, data.astroSignatory1Email),
          signatoryCell('2.', data.astroSignatory2Name, data.astroSignatory2Email),
        ],
      }),

      // Counterparty signatories
      sectionHeaderRow('COUNTERPARTY SIGNATORIES', '– Full Name and Email Address. If Individual please provide NRIC No/Passport Details for stamping purposes.'),
      new TableRow({
        children: [
          signatoryCell('1.', data.counterparty1Name, data.counterparty1Email, data.counterparty1Nric),
          signatoryCell('2.', data.counterparty2Name, data.counterparty2Email, data.counterparty2Nric),
        ],
      }),

      // CC representative
      sectionHeaderRow('COUNTERPARTY REPRESENTATIVE TO BE COPIED', '(if applicable) - Full Name and Email Address'),
      new TableRow({
        children: [signatoryCell('1.', data.ccRepName, data.ccRepEmail, null, 2)],
      }),

      // Signing order
      new TableRow({
        children: [
          textCell({ text: 'IS SIGNING ORDER REQUIRED?', bold: true, shading: GRAY }),
          textCell({
            text: [
              new Paragraph({ children: [checkboxLine('No', data.signingOrderRequired !== 'Yes')] }),
              new Paragraph({ children: [checkboxLine(`Yes${data.signingOrderRequired === 'Yes' && data.signingOrderSequence ? ` — ${data.signingOrderSequence}` : ' (Indicate sequence, e.g. A to sign first, then followed by B)'}`, data.signingOrderRequired === 'Yes')] }),
            ],
          }),
        ],
      }),

      // CES / Board paper
      new TableRow({
        children: [
          textCell({ text: 'IS CES AND/OR BOARD PAPER REQUIRED?', bold: true, shading: GRAY }),
          textCell({
            text: [
              new Paragraph({ children: [checkboxLine('No', data.cesBoardRequired !== 'Yes')] }),
              new Paragraph({ children: [checkboxLine('Yes (Attach fully signed CES and/or Board Paper in this email)', data.cesBoardRequired === 'Yes')] }),
            ],
          }),
        ],
      }),

      // Cost centre
      new TableRow({
        children: [
          textCell({ text: 'COST CENTRE FOR STAMP DUTY:', bold: true, shading: GRAY }),
          textCell({ text: data.costCentre || '' }),
        ],
      }),

      // Contract amount
      new TableRow({
        children: [
          textCell({ text: 'CONTRACT AMOUNT:', bold: true, shading: GRAY }),
          textCell({ text: data.contractAmount || '' }),
        ],
      }),

      // Stamp duty party header
      sectionHeaderRow('WHICH PARTY WILL BEAR THE STAMP DUTY?', '', 2),

      // Stamp duty checkboxes (3 columns rendered as one row with 3 cells via a nested table would need 3 cols;
      // simplest: single row spanning both cols with inline checkboxes)
      new TableRow({
        children: [
          textCell({
            text: [new Paragraph({
              children: [
                checkboxLine('Astro', data.stampDutyParty === 'Astro'),
                new TextRun({ text: '        ' }),
                checkboxLine('Counterparty', data.stampDutyParty === 'Counterparty'),
                new TextRun({ text: '        ' }),
                checkboxLine('Shared', data.stampDutyParty === 'Shared'),
              ],
            })],
            colSpan: 2,
          }),
        ],
      }),

      // Special requests
      sectionHeaderRow('ANY SPECIAL REQUESTS?', '(e.g. special message to signers; auto-reminder, to include specific documents for viewing only by specific individuals, etc.)', 2),
      new TableRow({
        children: [textCell({ text: data.specialRequests || '', colSpan: 2 })],
      }),
    ],
  })

  return new Document({
    sections: [{ children: [table] }],
  })
}

export async function downloadAgreementDocx(filename, data) {
  const doc = generateAgreementDocx(data)
  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
