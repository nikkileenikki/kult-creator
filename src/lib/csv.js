function csvEscape(val) {
  const str = String(val ?? '')
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

export function rowsToCSV(rows, columns) {
  const header = columns.map(c => csvEscape(c.label)).join(',')
  const lines = rows.map(row => columns.map(c => csvEscape(row[c.key])).join(','))
  return [header, ...lines].join('\n')
}

export function downloadCSV(filename, csvString) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
