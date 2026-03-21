function escapeCsvCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function exportToCsv(filename: string, headers: string[], rows: string[][]): void {
  const headerLine = headers.map(escapeCsvCell).join(',')
  const bodyLines = rows.map((row) => row.map(escapeCsvCell).join(','))
  const csv = [headerLine, ...bodyLines].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
