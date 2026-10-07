/**
 * Reusable Data Export Utility
 * Sri Raja Rajeshwara Handloom - Wholesale Cloth Merchant
 * 
 * Supports:
 * - UTF-8 CSV with Byte Order Mark (\uFEFF) for seamless Excel & Telugu/Hindi text compatibility
 * - Native Excel XML Spreadsheet (.xls) with formatted headers and data typing
 * - Domain exporters for Orders, Customers, Products, and Sales Analytics
 * - Strict security: Never exports passwords, secrets, or internal auth hashes
 */

export type ExportFormat = 'csv' | 'excel';

/**
 * Escapes a cell value for standard RFC 4180 CSV
 */
function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Download tabular dataset as CSV
 */
export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
) {
  const headerRow = headers.map(escapeCsvCell).join(',');
  const dataRows = rows.map((row) => row.map(escapeCsvCell).join(','));
  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerBrowserDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

/**
 * Download tabular dataset as Excel XML Spreadsheet (.xls)
 * Compatible with Microsoft Excel, LibreOffice Calc, and Google Sheets
 */
export function downloadExcel(
  filename: string,
  sheetName: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
) {
  const cleanSheetName = sheetName.replace(/[\\/?*[\]]/g, '').slice(0, 31) || 'Sheet1';

  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0D3B2E" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Default">
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Number">
   <NumberFormat ss:Format="#,##0"/>
  </Style>
  <Style ss:ID="Currency">
   <NumberFormat ss:Format="₹#,##0"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${cleanSheetName}">
  <Table>
`;

  let tableXml = '   <Row ss:StyleID="Header">\n';
  headers.forEach((h) => {
    tableXml += `    <Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>\n`;
  });
  tableXml += '   </Row>\n';

  rows.forEach((row) => {
    tableXml += '   <Row ss:StyleID="Default">\n';
    row.forEach((cell) => {
      if (typeof cell === 'number') {
        tableXml += `    <Cell ss:StyleID="Number"><Data ss:Type="Number">${cell}</Data></Cell>\n`;
      } else {
        tableXml += `    <Cell><Data ss:Type="String">${escapeXml(cell ?? '')}</Data></Cell>\n`;
      }
    });
    tableXml += '   </Row>\n';
  });

  const xmlFooter = `  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xmlHeader + tableXml + xmlFooter], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  triggerBrowserDownload(blob, filename.endsWith('.xls') ? filename : `${filename}.xls`);
}

function escapeXml(unsafe: unknown): string {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function getTodayStamp(): string {
  return new Date().toISOString().split('T')[0];
}

// ============================================================================
// DOMAIN EXPORTERS
// ============================================================================

export interface OrderExportItem {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  businessName?: string | null;
  customerType: string;
  customerPhone: string;
  customerEmail: string;
  destinationCity?: string;
  destinationState?: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
}

export function exportOrdersDataset(orders: OrderExportItem[], format: ExportFormat = 'csv') {
  const headers = [
    'Order ID',
    'Order Date',
    'Customer Name',
    'Business / Shop Name',
    'Customer Type',
    'Phone',
    'Email',
    'Destination City',
    'Destination State',
    'Order Status',
    'Payment Method',
    'Payment Status',
    'Subtotal (₹)',
    'Freight Charge (₹)',
    'Grand Total (₹)',
    'Created At',
  ];

  const rows = orders.map((o) => [
    o.orderNumber,
    new Date(o.createdAt).toLocaleDateString('en-IN'),
    o.customerName,
    o.businessName || '—',
    o.customerType,
    o.customerPhone,
    o.customerEmail,
    o.destinationCity || '—',
    o.destinationState || '—',
    o.orderStatus,
    o.paymentMethod === 'whatsapp_manual' ? 'WhatsApp / Manual' : 'Online Gateway',
    o.paymentStatus,
    o.subtotal,
    o.deliveryCharge,
    o.grandTotal,
    o.createdAt,
  ]);

  const filename = `orders-${getTodayStamp()}`;
  if (format === 'excel') {
    downloadExcel(filename, 'Wholesale Orders', headers, rows);
  } else {
    downloadCsv(filename, headers, rows);
  }
}

export interface CustomerExportItem {
  fullName: string;
  businessName: string | null;
  customerType: string;
  phone: string;
  email: string;
  gstNumber?: string | null;
  city?: string;
  state?: string;
  totalOrders: number;
  totalPurchaseAmount: number;
  createdAt: string;
}

export function exportCustomersDataset(customers: CustomerExportItem[], format: ExportFormat = 'csv') {
  const headers = [
    'Customer Name',
    'Business / Store Name',
    'Customer Type',
    'Phone',
    'Email',
    'GST Number',
    'City',
    'State',
    'Order Count',
    'Lifetime Purchase Value (₹)',
    'Registration Date',
  ];

  const rows = customers.map((c) => [
    c.fullName,
    c.businessName || '—',
    c.customerType,
    c.phone,
    c.email,
    c.gstNumber || '—',
    c.city || '—',
    c.state || '—',
    c.totalOrders,
    c.totalPurchaseAmount,
    new Date(c.createdAt).toLocaleDateString('en-IN'),
  ]);

  const filename = `customers-${getTodayStamp()}`;
  if (format === 'excel') {
    downloadExcel(filename, 'Trade Customers', headers, rows);
  } else {
    downloadCsv(filename, headers, rows);
  }
}

export interface ProductExportItem {
  name: string;
  productCode: string;
  categoryName?: string;
  pricePerPiece: number | null;
  stockQuantity: number;
  isActive: boolean;
  description: string;
  createdAt?: string;
}

export function exportProductsDataset(products: ProductExportItem[], format: ExportFormat = 'csv') {
  const headers = [
    'Product Name',
    'SKU / Code',
    'Category',
    'Fixed Rate / Piece (₹)',
    'Godown Stock (pcs)',
    'Status',
    'Description',
    'Created Date',
  ];

  const rows = products.map((p) => [
    p.name,
    p.productCode,
    p.categoryName || '—',
    p.pricePerPiece !== null && p.pricePerPiece !== undefined ? p.pricePerPiece : 'Price on Enquiry',
    p.stockQuantity,
    p.isActive ? 'Active' : 'Inactive',
    p.description || '',
    p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '—',
  ]);

  const filename = `products-${getTodayStamp()}`;
  if (format === 'excel') {
    downloadExcel(filename, 'Wholesale Catalog', headers, rows);
  } else {
    downloadCsv(filename, headers, rows);
  }
}

export interface ReportExportInput {
  periodLabel: string;
  trend: Array<{ date: string; sales: number; orders: number }>;
  productPerformance: Array<{ name: string; productCode: string; unitsSold: number; revenue: number }>;
  categoryPerformance: Array<{ categoryName: string; unitsSold: number; revenue: number }>;
}

export function exportReportsDataset(data: ReportExportInput, format: ExportFormat = 'csv') {
  const headers = [
    'Date / Timeline',
    'Dispatched Orders',
    'Daily Sales Turnover (₹)',
  ];

  const rows = data.trend.map((t) => [
    t.date,
    t.orders,
    t.sales,
  ]);

  // Append empty row then best-sellers section
  rows.push(['', '', '']);
  rows.push(['--- BEST SELLING TEXTILE LINES ---', '', '']);
  rows.push(['Product Name', 'Total Pieces Sold', 'Turnover (₹)']);
  data.productPerformance.forEach((p) => {
    rows.push([`${p.name} (${p.productCode})`, p.unitsSold, p.revenue]);
  });

  // Append category performance section
  rows.push(['', '', '']);
  rows.push(['--- CATEGORY REVENUE BREAKDOWN ---', '', '']);
  rows.push(['Category Group', 'Total Pieces Sold', 'Turnover (₹)']);
  data.categoryPerformance.forEach((c) => {
    rows.push([c.categoryName, c.unitsSold, c.revenue]);
  });

  const filename = `sales-report-${getTodayStamp()}`;
  if (format === 'excel') {
    downloadExcel(filename, `Report - ${data.periodLabel}`, headers, rows);
  } else {
    downloadCsv(filename, headers, rows);
  }
}
