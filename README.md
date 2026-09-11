# 🛋️ Zelection Interior - O2O Performance Dashboard

เว็บแอปพลิเคชัน Interactive Dashboard สำหรับติดตามและวิเคราะห์ข้อมูลการดำเนินงานรับลูกค้าออนไลน์ (O2O Online Lead Tracking & Analytics) ของ **Zelection Interior** รองรับการเชื่อมต่อข้อมูลแบบเรียลไทม์จาก Google Sheets

---

## 🌟 ฟีเจอร์หลัก (Key Features)

* **Multi-dimensional Conversion Funnel:** ติดตามอัตรา Conversion ตั้งแต่การทักแชต $\rightarrow$ ส่งต่อสาขา $\rightarrow$ การเข้าเยี่ยมชมสาขาจริง (Visit) $\rightarrow$ การเปิดวัดพื้นที่/สั่งซื้อ
* **Interactive Cross-Filtering:** กรองข้อมูลตามสาขา (CDC, Bangna, Ratchaphruek, Rama 2), ช่องทางติดต่อ (FB, LINE, IG), สถานะความพร้อม และช่องค้นหาข้อมูล
* **Responsive Design:** ออกแบบด้วยโทนสี Modern Blue & Grey สวยงาม ใช้งานง่าย รองรับทั้งคอมพิวเตอร์และมือถือ
* **Data Table & Detail Modal:** ตารางข้อมูลพร้อมระบบค้นหา เรียงลำดับ (Sorting) แบ่งหน้า (Pagination) และคลิกดูรายละเอียดโครงการ
* **Data Export:** ส่งออกข้อมูลที่ผ่านการกรองแล้วเป็นไฟล์ Excel (`.xlsx`), CSV (`.csv`) และ PDF (`.pdf`) ได้ทันที

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

* **Frontend:** HTML5, CSS3 (Custom Modern Theme & Responsive Layout), JavaScript (ES6+)
* **Data Visualization:** Chart.js
* **Icons & Fonts:** FontAwesome 6, Google Fonts
* **Export Libraries:** SheetJS (XLSX), jsPDF, AutoTable

---

## 📂 โครงสร้างไฟล์ในโครงการ

```text
zelection-dashboard/
├── index.html          # โครงสร้างหน้าเว็บ UI Layout, Filters, Cards และ Charts
├── styles.css          # สไตล์ตกแต่ง CSS (Modern Blue/Grey, Theme, Animations)
└── app.js              # ระบบคำนวณ Data, Chart.js, Cross-Filter และ Export
