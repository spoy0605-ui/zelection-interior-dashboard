// ==========================================
// Zelection Interior - Dashboard Data Logic
// ==========================================

// ข้อมูลจำลองรองรับการ Group By สรุปยอด
const sampleData = [
  { docNo: "DOC-001", date: "2026-03-01", channel: "FB", branch: "CDC", customer: "คุณอนันต์", phone: "081-234-XXXX", project: "Grand Bangkok Boulevard", propType: "บ้านเดี่ยว", status: "พร้อม", admin: "Admin A" },
  { docNo: "DOC-002", date: "2026-03-02", channel: "LINE", branch: "BN", customer: "คุณนภา", phone: "089-876-XXXX", project: "Nanthawan Bangna", propType: "บ้านเดี่ยว", status: "พร้อม", admin: "Admin B" },
  { docNo: "DOC-003", date: "2026-03-02", channel: "FB", branch: "CDC", customer: "คุณวิศรุต", phone: "086-555-XXXX", project: "Rhythm Ekkamai", propType: "คอนโด", status: "พร้อม", admin: "Admin A" },
  { docNo: "DOC-004", date: "2026-03-03", channel: "IG", branch: "RP", customer: "คุณเกศรา", phone: "082-111-XXXX", project: "Centro Ratchaphruek", propType: "บ้านเดี่ยว", status: "ไม่พร้อม", admin: "Admin C" },
  { docNo: "DOC-005", date: "2026-03-04", channel: "LINE", branch: "RM2", customer: "คุณธนกร", phone: "084-333-XXXX", project: "Ladawan Rama 2", propType: "บ้านเดี่ยว", status: "พร้อม", admin: "Admin B" }
];

let rawData = [...sampleData];
let filteredData = [...sampleData];

// ฟังก์ชันรวมกลุ่มข้อมูล (Aggregation Engine)
function processAggregatedData(data) {
  const totals = {
    totalLeads: data.length,
    byChannel: { FB: 0, LINE: 0, IG: 0 },
    byBranch: { CDC: 0, BN: 0, RP: 0, RM2: 0 },
    byStatus: { พร้อม: 0, ไม่พร้อม: 0 }
  };

  data.forEach(item => {
    // รวมยอดแยกตามช่องทาง
    if (totals.byChannel[item.channel] !== undefined) totals.byChannel[item.channel]++;
    // รวมยอดแยกตามสาขา
    if (totals.byBranch[item.branch] !== undefined) totals.byBranch[item.branch]++;
    // รวมยอดแยกตามสถานะ
    if (totals.byStatus[item.status] !== undefined) totals.byStatus[item.status]++;
  });

  return totals;
}

// อัปเดต KPI Cards
function updateKPICards(totals) {
  document.getElementById('kpiTotalLeads').innerText = totals.totalLeads;
  document.getElementById('kpiChannelBreakdown').innerText = 
    `FB: ${totals.byChannel.FB} | LINE: ${totals.byChannel.LINE} | IG: ${totals.byChannel.IG}`;
  
  // คำนวณสัดส่วนแบบประมาณการ
  const forwarded = Math.round(totals.totalLeads * 0.85);
  const visits = Math.round(forwarded * 0.60);
  const siteVisits = Math.round(visits * 0.40);

  document.getElementById('kpiForwarded').innerText = forwarded;
  document.getElementById('kpiActualVisits').innerText = visits;
  document.getElementById('kpiSiteVisits').innerText = siteVisits;
}

// โหลดข้อมูลและแสดงผล
function initDashboard() {
  const aggregated = processAggregatedData(filteredData);
  updateKPICards(aggregated);
  renderTable(filteredData);
  document.getElementById('loadingOverlay').style.display = 'none';
}

// แสดงข้อมูลลงตาราง
function renderTable(data) {
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;
  
  tbody.innerHTML = data.map(item => `
    <tr>
      <td>${item.docNo}</td>
      <td>${item.date}</td>
      <td><span class="badge badge-${item.channel.toLowerCase()}">${item.channel}</span></td>
      <td><b>${item.branch}</b></td>
      <td>${item.customer}</td>
      <td>${item.phone}</td>
      <td>${item.project}</td>
      <td>${item.propType}</td>
      <td><span class="status-tag ${item.status === 'พร้อม' ? 'ready' : 'not-ready'}">${item.status}</span></td>
      <td>${item.admin}</td>
    </tr>
  `).join('');

  document.getElementById('tableRecordCount').innerText = `แสดง ${data.length} รายการ (สรุปเรียบร้อยแล้ว)`;
}

window.addEventListener('DOMContentLoaded', initDashboard);
