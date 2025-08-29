

/**
 * Converts an array of objects to a CSV string and triggers a download.
 * @param filename The name of the file to be downloaded (e.g., 'report.csv').
 * @param rows An array of objects to be converted to CSV.
 */
export const exportToCsv = (filename: string, rows: object[]): void => {
    if (!rows || rows.length === 0) {
        alert("No data available to export.");
        return;
    }

    const processValue = (value: any): string => {
        const strValue = String(value === null || value === undefined ? '' : value);
        if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
            return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
    };

    const headers = Object.keys(rows[0]);
    const csvContent = [
        headers.join(','),
        ...rows.map(row => headers.map(header => processValue((row as any)[header])).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};
