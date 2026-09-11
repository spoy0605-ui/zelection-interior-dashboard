// ==========================================
// 1. Data Store & Configuration
// ==========================================
// ตั้งค่า URL ของ Google Sheets Public CSV / Published API
const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ.../pub?output=csv';

let rawData = [];
let filteredData = [];
let chartInstances = {};

// Pagination State
let currentPage = 1;
let pageSize = 25;
let currentSortColumn = 'date';
let sortAscending = false;

// Dummy Seed Data (จำลองโครงสร้างจากไฟล์ O2O Master 2026)
const sampleData = [
  { docNo: '73925', date: '2026-01-03', channel: 'LINE', branch: 'CDC', customer: 'คุณ ธนิชชนันท์', phone: '062-9789664', project: 'หมู่บ้านบริติช วิลเลจ', propType: 'บ้าน', status: 'พร้อม', admin: 'ปอย', budget: '650,000+' },
  { docNo: '73926', date: '2026-01-04', channel: 'FB', branch: 'BN', customer: 'Phansgron', phone: '061-7270371', project: 'เศรษฐสิริ ดอนเมือง', propType: 'บ้าน', status: 'พร้อม', admin: 'ปอย', budget: '1,200,000' },
  { docNo: '76155', date: '2026-02-01', channel: 'FB', branch: 'RP', customer: 'คุณเบน', phone: '064-9699289', project: 'บ้าน ทวีวัฒนา', propType: 'บ้าน', status: 'ไม่พร้อม', admin: 'ปอย', budget: '400,000' },
  { docNo: '78305', date: '2026-03-01', channel: 'LINE', branch: 'RP', customer: 'คุณอัยยา', phone: '081-8454081', project: 'มันทนาเพชรเกษมสาย 4', propType: 'บ้าน', status: 'พร้อม', admin: 'ปอย', budget: '800,000' },
  { docNo: '80750', date: '2026-04-01', channel: 'FB', branch: 'CDC', customer: 'คุณใหญ่', phone: '064-5699196', project: 'Novel ลาดพร้าว 18', propType: 'บ้าน', status: 'พร้อม', admin: 'ปอย', budget: '1,500,000' },
  { docNo: '80875', date: '2026-04-02', channel: 'FB', branch: 'RM2', customer: 'คุณภัทรเมธี', phone: '064-4497388', project: 'Watermark Chaophraya', propType: 'คอนโด', status: 'พร้อม', admin: 'ปอย', budget: '900,000' },
  { docNo: '82855', date: '2026-05-04', channel: 'FB', branch: 'RM2', customer: 'คุณพ้อย', phone: '094-9146154', project: 'บ้านแถวบางบอน', propType: 'บ้าน', status: 'พร้อม', admin: 'กนกพร', budget: '2,000,000' },
  { docNo: '84956', date: '2026-06-01', channel: 'FB', branch: 'CDC', customer: 'คุณภัทร', phone: '089-1214600', project: 'บ้านสร้างเอง บางกะปิ', propType: 'บ้าน', status: 'พร้อม', admin: 'กนกพร', budget: '3,000,000' },
  { docNo: '87179', date: '2026-07-06', channel: 'FB', branch: 'CDC', customer: 'คุณสุทธิชัย', phone: '089-0961159', project: 'หมู่บ้านเดอะธารา', propType: 'บ้าน', status: 'พร้อม', admin: 'กนกพร', budget: '1,800,000' }
];

// ==========================================
// 2. Initialization & Data Fetching
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  loadData();
});

function loadData() {
  showLoading(true);
  // ตัวอย่างจำลองการ Fetch Data (เมื่อใช้งานจริงสามารถสลับไปใช้ fetch(GOOGLE_SHEETS_CSV_URL) ได้)
  setTimeout(() => {
    rawData = [...sampleData];
    filteredData = [...rawData];
    
    populateAdminDropdown();
    updateDashboardUI();
    showLoading(false);
  }, 600);
}

function showLoading(enable) {
  document.getElementById('loadingOverlay').style.display = enable ? 'flex' : 'none';
}

// Populate Admin Dropdown
function populateAdminDropdown() {
  const adminSelect = document.getElementById('filterAdmin');
  const admins = [...new Set(rawData.map(item => item.admin))];
  adminSelect.innerHTML = '<option value="ALL">ทั้งหมด</option>';
  admins.forEach(admin => {
    adminSelect.innerHTML += `<option value="${admin}">${admin}</option>`;
  });
}

// ==========================================
// 3. Filter & Search Logic (Cross Filter)
// ==========================================
function initEventListeners() {
  // Global Filter Events
  ['filterBranch', 'filterChannel', 'filterStatus', 'filterAdmin'].forEach(id => {
    document.getElementById(id).addEventListener('change', applyFilters);
  });

  // Search Input Event
  document.getElementById('globalSearch').addEventListener('input', applyFilters);

  // Page Size Selector
  document.getElementById('pageSize').addEventListener('change', (e) => {
    pageSize = parseInt(e.target.value);
    currentPage = 1;
    renderTable();
  });

  // Export Buttons
  document.getElementById('btnExportExcel').addEventListener('click', exportToExcel);
  document.getElementById('btnExportCSV').addEventListener('click', exportToCSV);
  document.getElementById('btnExportPDF').addEventListener('click', exportToPDF);
  document.getElementById('btnRefresh').addEventListener('click', loadData);

  // Modal Controls
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('btnCloseModal').addEventListener('click', closeModal);

  // Table Header Sort
  document.querySelectorAll('#projectsTable th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.getAttribute('data-sort');
      if (currentSortColumn === col) {
        sortAscending = !sortAscending;
      } else {
        currentSortColumn = col;
        sortAscending = true;
      }
      renderTable();
    });
  });
}

function applyFilters() {
  const branch = document.getElementById('filterBranch').value;
  const channel = document.getElementById('filterChannel').value;
  const status = document.getElementById('filterStatus').value;
  const admin = document.getElementById('filterAdmin').value;
  const searchText = document.getElementById('globalSearch').value.toLowerCase().trim();

  filteredData = rawData.filter(item => {
    const matchBranch = branch === 'ALL' || item.branch === branch;
    const matchChannel = channel === 'ALL' || item.channel === channel;
    const matchStatus = status === 'ALL' || item.status === status;
    const matchAdmin = admin === 'ALL' || item.admin === admin;
    
    const matchSearch = searchText === '' || 
      item.customer.toLowerCase().includes(searchText) ||
      item.project.toLowerCase().includes(searchText) ||
      item.phone.includes(searchText) ||
      item.docNo.includes(searchText);

    return matchBranch && matchChannel && matchStatus && matchAdmin && matchSearch;
  });

  currentPage = 1;
  updateDashboardUI();
}

function updateDashboardUI() {
  renderKPICards();
  renderCharts();
  renderTreemap();
  renderTable();
}

// ==========================================
// 4. KPI Calculations
// ==========================================
function renderKPICards() {
  const total = filteredData.length;
  const fbCount = filteredData.filter(d => d.channel === 'FB').length;
  const lineCount = filteredData.filter(d => d.channel === 'LINE').length;
  const igCount = filteredData.filter(d => d.channel === 'IG').length;

  const forwarded = filteredData.filter(d => d.branch !== '').length;
  const readyVisits = filteredData.filter(d => d.status === 'พร้อม').length;

  document.getElementById('kpiTotalLeads').innerText = total.toLocaleString();
  document.getElementById('kpiChannelBreakdown').innerText = `FB: ${fbCount} | LINE: ${lineCount} | IG: ${igCount}`;
  
  document.getElementById('kpiForwarded').innerText = forwarded.toLocaleString();
  document.getElementById('kpiForwardRate').innerText = total > 0 ? `${((forwarded/total)*100).toFixed(1)}% ของทักแชต` : '0%';

  document.getElementById('kpiActualVisits').innerText = readyVisits.toLocaleString();
  document.getElementById('kpiVisitRate').innerText = forwarded > 0 ? `${((readyVisits/forwarded)*100).toFixed(1)}% ของส่งต่อ` : '0%';

  document.getElementById('kpiSiteVisits').innerText = readyVisits.toLocaleString();
  document.getElementById('kpiConversionRate').innerText = total > 0 ? `Conversion: ${((readyVisits/total)*100).toFixed(1)}%` : '0%';
}

// ==========================================
// 5. Chart.js Render Functions
// ==========================================
function renderCharts() {
  // Chart Colors (Blue / Modern Grey Palette)
  const colors = {
    navy: '#1e3a8a',
    blue: '#3b82f6',
    teal: '#14b8a6',
    sky: '#0284c7',
    grey: '#94a3b8'
  };

  // 1. Line Chart: Monthly Trend
  const monthlyCounts = {};
  filteredData.forEach(d => {
    const month = d.date.substring(0, 7);
    monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
  });

  createChart('lineTrendChart', 'line', {
    labels: Object.keys(monthlyCounts),
    datasets: [{
      label: 'จำนวนทักแชตสะสม',
      data: Object.values(monthlyCounts),
      borderColor: colors.blue,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.3
    }]
  });

  // 2. Bar Chart: Leads by Branch
  const branchCounts = { CDC: 0, BN: 0, RP: 0, RM2: 0 };
  filteredData.forEach(d => { if (branchCounts[d.branch] !== undefined) branchCounts[d.branch]++; });

  createChart('barBranchChart', 'bar', {
    labels: Object.keys(branchCounts),
    datasets: [{
      label: 'จำนวนลูกค้า (ราย)',
      data: Object.values(branchCounts),
      backgroundColor: [colors.navy, colors.blue, colors.teal, colors.sky],
      borderRadius: 6
    }]
  });

  // 3. Donut Chart: Channel Distribution
  const channelCounts = { FB: 0, LINE: 0, IG: 0 };
  filteredData.forEach(d => { if (channelCounts[d.channel] !== undefined) channelCounts[d.channel]++; });

  createChart('donutChannelChart', 'doughnut', {
    labels: ['Facebook', 'LINE Official', 'Instagram'],
    datasets: [{
      data: Object.values(channelCounts),
      backgroundColor: [colors.blue, colors.teal, colors.grey]
    }]
  });

  // 4. Pie Chart: Property Type Breakdown
  const propCounts = {};
  filteredData.forEach(d => { propCounts[d.propType] = (propCounts[d.propType] || 0) + 1; });

  createChart('piePropertyChart', 'pie', {
    labels: Object.keys(propCounts),
    datasets: [{
      data: Object.values(propCounts),
      backgroundColor: [colors.navy, colors.blue, colors.sky]
    }]
  });
}

function createChart(canvasId, type, data) {
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }
  const ctx = document.getElementById(canvasId).getContext('2d');
  chartInstances[canvasId] = new Chart(ctx, {
    type: type,
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 11 } } }
      }
    }
  });
}

// 5. Treemap Matrix Component
function renderTreemap() {
  const container = document.getElementById('treemapContainer');
  container.innerHTML = '';

  const branchPropMap = {};
  filteredData.forEach(d => {
    const key = `${d.branch} - ${d.propType}`;
    branchPropMap[key] = (branchPropMap[key] || 0) + 1;
  });

  const bgColors = ['#1e3a8a', '#2563eb', '#3b82f6', '#0284c7', '#0f766e'];
  let colorIdx = 0;

  Object.entries(branchPropMap).forEach(([key, val]) => {
    const block = document.createElement('div');
    block.className = 'treemap-block';
    block.style.backgroundColor = bgColors[colorIdx % bgColors.length];
    block.innerHTML = `<strong>${key}</strong><span>${val} โครงการ</span>`;
    container.appendChild(block);
    colorIdx++;
  });
}

// ==========================================
// 6. Data Table & Pagination
// ==========================================
function renderTable() {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';

  // Sort Logic
  filteredData.sort((a, b) => {
    let valA = a[currentSortColumn] || '';
    let valB = b[currentSortColumn] || '';
    return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  // Pagination Calculations
  const totalRecords = filteredData.length;
  document.getElementById('tableRecordCount').innerText = `แสดง ${totalRecords} รายการ`;

  const startIndex = (currentPage - 1) * pageSize;
  const pageData = filteredData.slice(startIndex, startIndex + pageSize);

  pageData.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>#${row.docNo}</strong></td>
      <td>${row.date}</td>
      <td><span class="badge" style="background:#e0f2fe; color:#0369a1;">${row.channel}</span></td>
      <td>${row.branch}</td>
      <td>${row.customer}</td>
      <td>${row.phone}</td>
      <td>${row.project}</td>
      <td>${row.propType}</td>
      <td><span class="badge ${row.status === 'พร้อม' ? 'badge-ready' : 'badge-notready'}">${row.status}</span></td>
      <td>${row.admin}</td>
    `;
    tr.addEventListener('click', () => openModal(row));
    tbody.appendChild(tr);
  });

  renderPaginationControls(Math.ceil(totalRecords / pageSize));
}

function renderPaginationControls(totalPages) {
  const container = document.getElementById('pagination');
  container.innerHTML = '';

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
    btn.innerText = i;
    btn.addEventListener('click', () => {
      currentPage = i;
      renderTable();
    });
    container.appendChild(btn);
  }
}

// ==========================================
// 7. Modal Details Display
// ==========================================
function openModal(data) {
  const body = document.getElementById('modalBody');
  document.getElementById('modalTitle').innerText = `รายละเอียดโครงการ: ${data.project}`;

  body.innerHTML = `
    <div><strong>เลขที่เอกสาร:</strong> #${data.docNo}</div>
    <div><strong>วันที่สอบถาม:</strong> ${data.date}</div>
    <div><strong>ชื่อลูกค้า:</strong> ${data.customer}</div>
    <div><strong>เบอร์โทรศัพท์:</strong> ${data.phone}</div>
    <div><strong>ช่องทางติดต่อ:</strong> ${data.channel}</div>
    <div><strong>สาขาที่ดูแล:</strong> ${data.branch}</div>
    <div><strong>ประเภทอสังหาฯ:</strong> ${data.propType}</div>
    <div><strong>สถานะความพร้อม:</strong> ${data.status}</div>
    <div><strong>ผู้ดูแล (Admin):</strong> ${data.admin}</div>
    <div><strong>งบประมาณประเมิน:</strong> ${data.budget || 'ไม่ระบุ'}</div>
  `;

  document.getElementById('detailModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('detailModal').style.display = 'none';
}

// ==========================================
// 8. Data Export Capabilities
// ==========================================
function exportToExcel() {
  const ws = XLSX.utils.json_to_sheet(filteredData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "O2O_Leads");
  XLSX.writeFile(wb, "Zelection_O2O_Leads.xlsx");
}

function exportToCSV() {
  const ws = XLSX.utils.json_to_sheet(filteredData);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'Zelection_O2O_Leads.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Zelection Interior - O2O Leads Report", 14, 15);
  
  const tableData = filteredData.map(d => [d.docNo, d.date, d.channel, d.branch, d.customer, d.project, d.status]);
  doc.autoTable({
    head: [['Doc No', 'Date', 'Channel', 'Branch', 'Customer', 'Project', 'Status']],
    body: tableData,
    startY: 20
  });

  doc.save("Zelection_O2O_Leads.pdf");
}