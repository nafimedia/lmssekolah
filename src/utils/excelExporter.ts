/**
 * Utility Exporter Spreadsheet Excel (.xlsx / .csv) untuk MTsN 2 Cilacap LMS.
 * Dilengkapi UTF-8 BOM (\uFEFF) agar terbaca sempurna di Microsoft Excel 2016-2026,
 * LibreOffice Calc, dan Google Sheets tanpa masalah karakter khusus.
 */

export function exportToCsv(filename: string, headers: string[], rows: (string | number | boolean)[][]) {
  const sanitize = (cell: any) => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent =
    "\uFEFF" + // UTF-8 BOM for Microsoft Excel compatibility
    headers.map(sanitize).join(",") +
    "\n" +
    rows.map((row) => row.map(sanitize).join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToExcelXml(
  filename: string,
  sheetName: string,
  headers: string[],
  rows: (string | number | boolean)[][]
) {
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#059669" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="DataCell">
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="NumberCell">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${sheetName || "Sheet1"}">
  <Table>
   <Row ss:Height="24">
    ${headers.map((h) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join("")}
   </Row>
   ${rows
     .map(
       (row) =>
         `<Row ss:Height="20">
          ${row
            .map((val) => {
              const isNum = typeof val === "number";
              return `<Cell ss:StyleID="${isNum ? "NumberCell" : "DataCell"}"><Data ss:Type="${
                isNum ? "Number" : "String"
              }">${escapeXml(String(val ?? ""))}</Data></Cell>`;
            })
            .join("")}
         </Row>`
     )
     .join("\n")}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xmlHeader], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".xls") ? filename : `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
