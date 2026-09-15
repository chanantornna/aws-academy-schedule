# AWS Academy & Tech Alliance — ตารางเทรนนิ่ง

เว็บแอพจัดตารางงานเทรนนิ่งสำหรับโครงการ **AWS Academy & Tech Alliance** — โครงการอัพสกิลให้นักศึกษาและอาจารย์มหาวิทยาลัย โดย Partner ของ AWS (เช่น ERT) เข้าไปจัด Training ให้กับมหาวิทยาลัยที่สนใจ หัวข้อหลักคือ GenAI + PartyRock และ GenAI + KIRO

บันทึกได้ครบ: มหาวิทยาลัย, หัวข้อ, กลุ่มผู้เข้าร่วม (นักศึกษา/อาจารย์), trainer, วันเวลา, รูปแบบ (onsite/online/hybrid), สถานที่/ลิงก์, จำนวนผู้เข้าร่วม, ผู้ประสานงาน และสถานะตั้งแต่ติดต่อจนจัดเสร็จ พร้อมมุมมองตาราง + ปฏิทิน, ค้นหา/กรอง, ส่งออก CSV, รองรับไทย/อังกฤษ และเก็บข้อมูลในเครื่อง (localStorage)

## ฟีเจอร์

- สรุปภาพรวม: จำนวนเทรนนิ่ง, จำนวนมหาวิทยาลัย, ผู้เข้าร่วมรวม, ที่กำลังจะถึง, ที่จัดเสร็จแล้ว
- มุมมองตาราง และมุมมองปฏิทินรายเดือน (คลิกที่รายการในปฏิทินเพื่อแก้ไข)
- ค้นหา (มหาวิทยาลัย/คณะ/trainer/ผู้ประสานงาน/โน้ต) และกรองตามสถานะ, หัวข้อ, รูปแบบ
- เรียงตามวันที่จัด / ชื่อมหาวิทยาลัย / ล่าสุด
- ส่งออก CSV (รองรับภาษาไทยใน Excel)
- สลับภาษา ไทย / อังกฤษ
- เก็บข้อมูลใน localStorage ของเบราว์เซอร์

## รันในเครื่อง (Local development)

ต้องมี Node.js ติดตั้งก่อน (ทดสอบด้วย Node 20+).

```bash
npm install
npm run dev
```

เปิด http://localhost:5174/ (ตั้ง port ไว้ที่ 5174 เพื่อไม่ชนกับโปรเจกต์ KOL Schedule เดิมที่ใช้ 5173)

## Build

```bash
npm run build      # ผลลัพธ์อยู่ในโฟลเดอร์ dist/
npm run preview    # ดูตัว build ในเครื่อง
```

## Deploy ขึ้น GitHub Pages (auto)

โปรเจกต์นี้ตั้ง GitHub Actions ไว้แล้ว (`.github/workflows/deploy.yml`) — ทุกครั้งที่ push ขึ้น branch `main` มันจะ build แล้ว deploy ให้เอง

> สำคัญ: โฟลเดอร์นี้ต้องเป็น **root ของ repository ของตัวเอง** (แยกจาก repo `kol-schedule`) เพราะ workflow รัน `npm ci` / `npm run build` ที่ root ของ repo

ขั้นตอนครั้งแรก:

1. สร้าง repository เปล่าใหม่บน GitHub (เช่น `aws-academy-schedule`) — **อย่า** ติ๊ก add README/gitignore
2. เปิด terminal ในโฟลเดอร์ `aws-academy-schedule/` นี้ แล้ว init + push (แทน `<USERNAME>` และ `<REPO>` ด้วยของจริง):

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<USERNAME>/<REPO>.git
   git push -u origin main
   ```

3. บน GitHub ไปที่ **Settings → Pages** แล้วตั้ง **Source** เป็น **GitHub Actions**
4. รอ workflow รันเสร็จ (ดูที่แท็บ **Actions**) แล้วเปิดเว็บได้ที่:

   ```
   https://<USERNAME>.github.io/<REPO>/
   ```

> หมายเหตุ: `base` path ถูกตั้งอัตโนมัติจากชื่อ repo ตอน build บน CI (ผ่าน `VITE_BASE`) จึงไม่ต้องแก้ config เอง

## หมายเหตุเรื่องข้อมูล

ข้อมูลเก็บใน localStorage ของแต่ละเบราว์เซอร์/เครื่อง จึงไม่ sync ข้ามอุปกรณ์ ใช้ปุ่มส่งออก CSV เพื่อสำรอง/ย้ายข้อมูลได้
