export function missingColumnName(error = {}) {
  const text = [error.message, error.details, error.hint].filter(Boolean).join(' ');
  const quotedColumn = text.match(/'([^']+)'\s+column/i);
  const sqlColumn = text.match(/column\s+(?:(?:public\.)?\w+\.)?"?([a-zA-Z_][a-zA-Z0-9_]*)"?\s+does not exist/i);

  return quotedColumn?.[1] || sqlColumn?.[1] || '';
}

export async function writeWithColumnFallback(row, optionalColumns, write) {
  const nextRow = { ...row };

  for (let attempts = 0; attempts <= optionalColumns.size; attempts += 1) {
    const { data, error } = await write(nextRow);
    if (!error) return data;

    const missingColumn = missingColumnName(error);
    if (!missingColumn || !optionalColumns.has(missingColumn) || !(missingColumn in nextRow)) {
      throw error;
    }

    delete nextRow[missingColumn];
  }

  throw new Error('Unable to write row after removing unsupported optional columns');
}
