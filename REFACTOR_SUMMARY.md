# 📋 การแยก Refactor ไฟล์ KonvaCanvas.tsx

## 🎯 สรุปการแยก Components และ Functions

ไฟล์ `KonvaCanvas.tsx` เดิมมีบรรทัดโค้ดมากกว่า 1,400 บรรทัด ซึ่งทำให้ยากต่อการบำรุงรักษา ฉันได้แยกโค้ดออกเป็นส่วนต่าง ๆ ดังนี้:

## 📂 โครงสร้างไฟล์ใหม่

```
src/components/Canvas/
├── KonvaCanvas.tsx                 (ไฟล์เดิม - ยังคงใช้งานได้)
├── KonvaCanvasRefactored.tsx       (ไฟล์ตัวอย่างที่ใช้ components ที่แยกแล้ว)
├── components/
│   ├── ZoomControls.tsx           (ปุ่มซูมและรีเซ็ตมุมมอง)
│   ├── TextSettingsPanel.tsx     (แผงตั้งค่าข้อความ)
│   ├── ContextMenu.tsx            (เมนูคลิกขวา)
│   ├── JsonModal.tsx              (modal แสดง JSON)
│   ├── PreviewModal.tsx           (modal แสดงตัวอย่าง)
│   └── TextInputOverlay.tsx       (overlay สำหรับแก้ไขข้อความ)
├── hooks/
│   ├── useCanvasSize.ts           (จัดการขนาดของ canvas)
│   ├── useCanvasTransform.ts      (จัดการการซูมและแพน)
│   └── useTextEditing.ts          (จัดการการแก้ไขข้อความ)
└── utils/
    └── canvasUtils.ts             (utility functions)
```

## 🔧 รายละเอียดการแยก

### 1. UI Components (~/components/)

#### 🎮 ZoomControls.tsx

- **ขนาด**: ~70 บรรทัด
- **หน้าที่**: ปุ่มซูมเข้า/ออก, รีเซ็ตมุมมอง, แสดงสถานะตำแหน่ง
- **Props**: `scale`, `position`, `onZoomIn`, `onZoomOut`, `onResetView`

#### ✏️ TextSettingsPanel.tsx

- **ขนาด**: ~200 บรรทัด
- **หน้าที่**: แผงตั้งค่าฟอนต์, ขนาด, สี, สไตล์ข้อความ
- **Props**: `selectedText`, `textSettings`, `onTextSettingsChange`, etc.

#### 📋 ContextMenu.tsx

- **ขนาด**: ~80 บรรทัด
- **หน้าที่**: เมนูคลิกขวาสำหรับจัดการ layer
- **Props**: `contextMenu`, `onMoveForward`, `onMoveBackward`, etc.

#### 📄 JsonModal.tsx

- **ขนาด**: ~70 บรรทัด
- **หน้าที่**: แสดง JSON configuration และคัดลอก
- **Props**: `isOpen`, `onClose`, `jsonData`

#### 👁️ PreviewModal.tsx

- **ขนาด**: ~150 บรรทัด
- **หน้าที่**: แสดงตัวอย่าง artboard และแก้ไขใน preview mode
- **Props**: `artboardSize`, `images`, `texts`, etc.

#### 📝 TextInputOverlay.tsx

- **ขนาด**: ~80 บรรทัด
- **หน้าที่**: overlay สำหรับแก้ไขข้อความแบบ inline
- **Props**: `editingTextId`, `editingValue`, `onComplete`, etc.

### 2. Custom Hooks (~/hooks/)

#### 📐 useCanvasSize.ts

- **ขนาด**: ~20 บรรทัด
- **หน้าที่**: จัดการขนาด stage ตาม window resize
- **Return**: `stageSize`

#### 🔄 useCanvasTransform.ts

- **ขนาด**: ~20 บรรทัด
- **หน้าที่**: จัดการ state สำหรับการซูมและแพน
- **Return**: `scale`, `position`, `setScale`, `setPosition`, etc.

#### ✍️ useTextEditing.ts

- **ขนาด**: ~80 บรรทัด
- **หน้าที่**: จัดการการแก้ไขข้อความแบบ inline
- **Return**: `editingTextId`, `startEditing`, `completeEditing`, etc.

### 3. Utility Functions (~/utils/)

#### 🛠️ canvasUtils.ts

- **ขนาด**: ~230 บรรทัด
- **หน้าที่**:
  - `layerManagerUtils`: จัดการ z-index ของ elements
  - `guidelineUtils`: คำนวณเส้น guidelines สำหรับการ align
  - `jsonUtils`: สร้าง JSON สำหรับ export

## 🚀 ประโยชน์จากการแยก

### ✅ ข้อดี

1. **ลดความซับซ้อน**: ไฟล์หลักลดลงจาก 1,400+ บรรทัดเหลือ ~400 บรรทัด
2. **ง่ายต่อการบำรุงรักษา**: แต่ละ component มีหน้าที่เฉพาะ
3. **ใช้ซ้ำได้**: components สามารถนำไปใช้ที่อื่นได้
4. **ทดสอบง่าย**: แต่ละส่วนสามารถทดสอบแยกกันได้
5. **Separation of Concerns**: แยก UI, logic, และ utilities ออกจากกัน

### 🔄 การใช้งาน

- **ไฟล์เดิม**: `KonvaCanvas.tsx` ยังคงใช้งานได้ตามปกติ
- **ไฟล์ใหม่**: `KonvaCanvasRefactored.tsx` เป็นตัวอย่างการใช้ components ที่แยกแล้ว

## 📝 ขั้นตอนการ Migrate

หากต้องการเปลี่ยนจากไฟล์เดิมไปใช้ไฟล์ที่แยกแล้ว:

1. เปลี่ยน import จาก `KonvaCanvas` เป็น `KonvaCanvasRefactored`
2. ตรวจสอบ props ที่ส่งให้ยังครบถ้วน
3. ทดสอบฟีเจอร์ต่าง ๆ ให้ทำงานถูกต้อง

## 🔮 การพัฒนาต่อ

สามารถพัฒนาต่อได้โดย:

1. เพิ่ม unit tests สำหรับแต่ละ component
2. เพิ่ม TypeScript strict mode
3. เพิ่ม error boundaries
4. ปรับปรุง performance ด้วย React.memo
5. เพิ่ม accessibility features
