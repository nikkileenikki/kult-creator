import {
  Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun,
  WidthType, ShadingType, VerticalAlign, BorderStyle, AlignmentType,
} from 'docx'

const FONT = 'Aptos'
const PINK = 'FF2F74'
const GRAY = 'D9D9D9'
const WHITE = 'FFFFFF'
const BORDER = { style: BorderStyle.SINGLE, size: 4, color: '000000' }
const NIL = { style: BorderStyle.NONE, size: 0, color: 'auto' }
const CELL_BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER }

// Matches the original table's dxa grid: 801 | 1604 | 2278 | 1691 | 2945 | 7 (total 9326)
const TOTAL_W = 9326
const LEFT_LABEL_W = 4683   // cols 1-3
const RIGHT_VALUE_W = 4643  // cols 4-6

// Single (1.0) line spacing, with a comfortable paragraph gap.
const SPACING = { after: 120, line: 240, lineRule: 'auto' }

function run(text, opts = {}) {
  return new TextRun({ text, font: FONT, size: 24, ...opts })
}

function para(children, opts = {}) {
  return new Paragraph({ children, spacing: SPACING, ...opts })
}

function cellShading(color) {
  return { fill: color, type: ShadingType.CLEAR, color: 'auto' }
}

function baseCell({ children, width, colSpan, shading, valign = VerticalAlign.TOP, borders = CELL_BORDERS, margins }) {
  return new TableCell({
    columnSpan: colSpan,
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    borders,
    shading: shading ? cellShading(shading) : undefined,
    verticalAlign: valign,
    margins: margins ?? { top: 100, bottom: 100, left: 160, right: 160 },
    children,
  })
}

function checkbox(checked) {
  return new TextRun({ text: checked ? '☒' : '☐', font: 'MS Gothic', size: 20 })
}

// Section header: bold title + subtitle on the same line, plus an optional smaller note
// paragraph underneath — all in one gray cell.
function sectionHeaderRow(title, subtitle, note, { noteSize = 16, colSpan = 6, width = TOTAL_W, bottomBorder = false } = {}) {
  const titleLine = [run(title, { bold: true })]
  if (subtitle) titleLine.push(run(` ${subtitle}`, { size: 18 }))
  const paragraphs = [para(titleLine)]
  if (note) paragraphs.push(para([run(note, { italics: true, size: noteSize })]))
  return new TableRow({
    children: [baseCell({
      children: paragraphs,
      width, colSpan, shading: GRAY,
      borders: bottomBorder ? { ...CELL_BORDERS, bottom: BORDER } : CELL_BORDERS,
    })],
  })
}

// Single signatory row: left box = name (+ phone), right box = email (+ NRIC)
function signatoryRow({ name, phone, email, nric }) {
  const left = [para([run(name || '')])]
  if (phone) left.push(para([run(phone)]))
  const right = [para([run(email || '')])]
  if (nric) right.push(para([run(`NRIC/Passport: ${nric}`, { size: 18, italics: true })]))
  return new TableRow({
    children: [
      baseCell({ children: left, width: LEFT_LABEL_W, colSpan: 3 }),
      baseCell({ children: right, width: RIGHT_VALUE_W, colSpan: 3 }),
    ],
  })
}

function ccRepRow(name, email) {
  return new TableRow({
    children: [baseCell({
      children: [para([run(name || '')]), para([run(email || '')])],
      width: TOTAL_W, colSpan: 6,
    })],
  })
}

function labelValueRow(label, value) {
  return new TableRow({
    children: [
      baseCell({ children: [para([run(label, { bold: true })])], width: LEFT_LABEL_W, colSpan: 3, shading: GRAY, valign: VerticalAlign.CENTER }),
      baseCell({ children: [para([run(value || '', { size: 20 })])], width: RIGHT_VALUE_W, colSpan: 3, valign: VerticalAlign.CENTER }),
    ],
  })
}

export function generateAgreementDocx(data) {
  const table = new Table({
    width: { size: TOTAL_W, type: WidthType.DXA },
    rows: [
      // Title
      new TableRow({
        children: [baseCell({
          children: [para([run('ASTRO DOCUSIGN & STAMPING INFORMATION SHEET', { bold: true, size: 28, color: WHITE })], { alignment: AlignmentType.CENTER, spacing: { ...SPACING, before: 120 } })],
          width: TOTAL_W, colSpan: 6, shading: PINK, valign: VerticalAlign.CENTER,
        })],
      }),

      // Astro signatory
      sectionHeaderRow('ASTRO SIGNATORIES', '– Full Name and Email Address', '* It is the responsibility of the contract owner to ensure that the Astro signatory has the proper LOA to sign the document'),
      signatoryRow({ name: data.astroSignatory1Name, email: data.astroSignatory1Email }),

      // Counterparty signatory
      sectionHeaderRow('COUNTERPARTY SIGNATORIES', '– Full Name and Email Address', '*(If Individual please provide NRIC No/Passport Details for stamping purposes)'),
      signatoryRow({ name: data.counterparty1Name, phone: data.counterparty1Phone, email: data.counterparty1Email, nric: data.counterparty1Nric }),

      // CC representative
      sectionHeaderRow('COUNTERPARTY REPRESENTATIVE TO BE COPIED', null, '*(if applicable) - Full Name and Email Address'),
      ccRepRow(data.ccRepName, data.ccRepEmail),

      // Signing order
      new TableRow({
        children: [
          baseCell({ children: [para([run('IS SIGNING ORDER REQUIRED?', { bold: true })])], width: LEFT_LABEL_W, colSpan: 3, shading: GRAY, valign: VerticalAlign.CENTER }),
          baseCell({
            children: [
              para([checkbox(data.signingOrderRequired !== 'Yes'), run(' No', { size: 20 })]),
              para([
                checkbox(data.signingOrderRequired === 'Yes'), run(' Yes ', { size: 20 }),
                run('(', { size: 14 }), run('Indicate sequence, e.g. A to sign first, then followed by B', { size: 14, italics: true }), run(')', { size: 14 }),
              ]),
              ...(data.signingOrderRequired === 'Yes' && data.signingOrderSequence
                ? [para([run(`Sequence: ${data.signingOrderSequence}`, { size: 18, italics: true })])]
                : []),
            ],
            width: RIGHT_VALUE_W, colSpan: 3,
          }),
        ],
      }),

      // CES / Board paper
      new TableRow({
        children: [
          baseCell({ children: [para([run('IS CES AND/OR BOARD PAPER REQUIRED?', { bold: true })])], width: LEFT_LABEL_W, colSpan: 3, shading: GRAY, valign: VerticalAlign.CENTER }),
          baseCell({
            children: [
              para([checkbox(data.cesBoardRequired !== 'Yes'), run(' No', { size: 20 })]),
              para([
                checkbox(data.cesBoardRequired === 'Yes'), run(' Yes ', { size: 20 }),
                run('(', { size: 14 }), run('Attach fully signed CES and/or Board Paper in this email', { size: 14, italics: true }), run(')', { size: 14 }),
              ]),
            ],
            width: RIGHT_VALUE_W, colSpan: 3,
          }),
        ],
      }),

      // Cost centre
      labelValueRow('COST CENTRE FOR STAMP DUTY:', data.costCentre),

      // Contract amount
      labelValueRow('CONTRACT AMOUNT:', data.contractAmount),

      // Stamp duty party header
      sectionHeaderRow('WHICH PARTY WILL BEAR THE STAMP DUTY?', null, null, { bottomBorder: true }),

      // Stamp duty checkboxes — 4 cells: spacer | Astro | Counterparty | Shared
      new TableRow({
        children: [
          baseCell({ children: [para([run('')])], width: 801, borders: { ...CELL_BORDERS, right: NIL } }),
          baseCell({
            children: [para([checkbox(data.stampDutyParty === 'Astro'), run(' Astro', { size: 20 })], { alignment: AlignmentType.CENTER })],
            width: 1604, borders: { ...CELL_BORDERS, left: NIL }, valign: VerticalAlign.CENTER,
          }),
          baseCell({
            children: [para([checkbox(data.stampDutyParty === 'Counterparty'), run(' Counterparty', { size: 20 })], { alignment: AlignmentType.CENTER })],
            width: 3969, colSpan: 2, valign: VerticalAlign.CENTER,
          }),
          baseCell({
            children: [para([checkbox(data.stampDutyParty === 'Shared'), run(' Shared', { size: 20 })], { alignment: AlignmentType.CENTER })],
            width: 2952, colSpan: 2, valign: VerticalAlign.CENTER,
          }),
        ],
      }),

      // Special requests
      sectionHeaderRow('ANY SPECIAL REQUESTS?', null, '(e.g. special message to signers; auto-reminder, to include specific documents for viewing only by specific individuals, etc.)', { noteSize: 14 }),
      new TableRow({
        children: [baseCell({
          children: [para([run(data.specialRequests || '')])],
          width: TOTAL_W, colSpan: 6,
        })],
      }),
    ],
  })

  return new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 24 },
          paragraph: { spacing: SPACING },
        },
      },
    },
    sections: [{
      properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
      children: [table],
    }],
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
