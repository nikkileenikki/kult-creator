import * as XLSX from 'xlsx'

export function downloadXLSX(filename, sheets) {
  const wb = XLSX.utils.book_new()
  for (const { name, rows, columns } of sheets) {
    const data = rows.map(row => {
      const obj = {}
      for (const c of columns) obj[c.label] = row[c.key]
      return obj
    })
    const ws = XLSX.utils.json_to_sheet(data, { header: columns.map(c => c.label) })
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31))
  }
  XLSX.writeFile(wb, filename)
}
