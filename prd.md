# PRD — BUKU DIGITAL KELUARGA BESAR

## 1. PROJECT OVERVIEW

### Nama Project

**Buku Digital Keluarga Besar**

### Tujuan

Membangun aplikasi web untuk mengumpulkan, mengelola, menghubungkan, dan menampilkan data keluarga besar dalam bentuk **buku digital interaktif** dan **family tree**.

Aplikasi dibuat berdasarkan konsep buku keluarga fisik seperti referensi yang diberikan, tetapi seluruh data disimpan secara digital dan saling terhubung.

Contoh buku fisik memiliki struktur:

- Data pribadi
- Data pasangan
- Data anak
- Foto
- Alamat
- Pendidikan
- Pekerjaan
- Nomor telepon
- Silsilah keluarga/status keluarga

Aplikasi harus mempertahankan konsep tersebut tetapi membuat proses pengumpulan data jauh lebih fleksibel.

---

# 2. MASALAH UTAMA

Pengumpulan data keluarga besar memiliki masalah utama:

1. Anggota keluarga tidak dapat mengisi secara bersamaan jika sistem bergantung pada urutan generasi.
2. Kakek/nenek mungkin belum mengisi data ketika anak/cucu sudah ingin mengisi.
3. Orang tua dapat mengisi pada hari yang berbeda dengan anak.
4. Satu orang dapat dimasukkan berkali-kali oleh anggota keluarga yang berbeda.
5. Hubungan keluarga dapat menjadi ambigu.
6. Buku fisik sulit diperbarui ketika ada anggota baru.
7. Foto dan data tersebar.
8. Silsilah sulit divisualisasikan.
9. Data yang sudah dikumpulkan sulit dibuat menjadi buku dengan layout yang konsisten.

---

# 3. SOLUSI UTAMA

Aplikasi menggunakan konsep:

```text
PERSON
   ↓
FAMILY
   ↓
RELATIONSHIP
   ↓
VERIFICATION
   ↓
FAMILY TREE
   ↓
DIGITAL BOOK
```

Data individu dan hubungan keluarga **dipisahkan**.

Sistem tidak mengharuskan:

```text
Buyut
 ↓
Kakek
 ↓
Ayah
 ↓
Anak
 ↓
Cucu
```

untuk mengisi secara berurutan.

Sebaliknya:

```text
Cucu mengisi sekarang
Ayah mengisi besok
Kakek mengisi minggu depan
Buyut sudah ada di database
```

semuanya tetap dapat dihubungkan.

---

# 4. KONSEP PALING PENTING

## "Input bebas, relasi dapat dihubungkan kemudian."

Ketika seseorang mengisi data orang tua yang belum ada di database, sistem membuat **Pending Person**.

Contoh:

```text
Nama Saya:
Budi Santoso

Ayah:
Agus Santoso
```

Jika Agus belum terdaftar:

```text
Agus Santoso
Status: Pending
```

Ketika Agus kemudian mengisi form:

```text
Agus Santoso
```

sistem mendeteksi kemungkinan data yang sama dan memberikan pilihan:

```text
Data yang mungkin cocok ditemukan:

Agus Santoso
Lahir: 1970
Keluarga: 10.1

[Hubungkan]
```

Setelah dihubungkan:

```text
Agus Santoso
      │
      ↓
Budi Santoso
```

---

# 5. AUTHENTICATION

## Tidak menggunakan Authentication

Project **tidak menggunakan**:

- Supabase Auth
- Login
- Register
- Password account
- Google Login
- Magic Link
- Session user

Pengguna dapat langsung mengisi form.

---

# 6. ACCESS CONTROL TANPA AUTHENTICATION

Karena tidak ada authentication, aplikasi menggunakan **access token berbasis data** untuk menghindari anggota lain mengedit data secara sembarangan.

Setiap submission memiliki:

```text
edit_token
```

Token dibuat secara random menggunakan UUID/Crypto.

Contoh:

```text
/edit/8f2d7a9c-...
```

Setelah form selesai:

```text
Data berhasil disimpan.

Simpan link berikut untuk mengedit data Anda:

[Copy Link]
```

Pengguna tidak perlu login.

Link tersebut menjadi semacam **kunci edit**.

### Important

Edit token:

- Tidak ditampilkan di public profile.
- Tidak disimpan di URL public profile.
- Tidak boleh menggunakan ID sequential.
- Menggunakan UUID/random token.
- Hanya diberikan kepada orang yang membuat data.

---

# 7. ADMIN ACCESS

Tidak menggunakan sistem authentication kompleks.

Admin dashboard menggunakan:

```text
ADMIN_SECRET
```

yang disimpan pada environment variable server.

Contoh:

```env
ADMIN_SECRET=generate-a-long-random-secret
```

Admin membuka:

```text
/admin
```

kemudian memasukkan secret.

Tidak ada:

- Admin account
- Email admin
- Password database
- Supabase Auth

Admin secret hanya digunakan untuk mengakses fungsi administrasi.

---

# 8. TECHNOLOGY STACK

## Core

### Next.js

Gunakan:

**Next.js App Router + TypeScript**

Digunakan untuk:

- Website
- Form
- Server Actions
- API
- Admin dashboard
- Book preview
- Public book
- PDF generation

---

## Styling

### Tailwind CSS

Digunakan untuk styling utama.

### shadcn/ui

Digunakan sebagai UI component library.

### Lucide React

Digunakan untuk icon.

---

# 9. BACKEND

## Supabase

Gunakan:

### PostgreSQL

Untuk seluruh data.

### Supabase Storage

Untuk seluruh file/gambar.

Tidak menggunakan Supabase Auth.

---

# 10. ADDITIONAL LIBRARIES

Gunakan hanya library yang benar-benar dibutuhkan.

```text
next
react
typescript

@supabase/supabase-js

react-hook-form
zod
@hookform/resolvers

tailwindcss
shadcn/ui
lucide-react

@xyflow/react
@tanstack/react-table

date-fns
sonner

browser-image-compression

@react-pdf/renderer

zustand
```

Jika menggunakan versi terbaru, gunakan versi stable yang kompatibel satu sama lain.

---

# 11. ALASAN PEMILIHAN STACK

## Next.js

Sebagai framework utama.

## Supabase

Karena menyediakan:

- PostgreSQL
- Storage
- API
- Realtime jika diperlukan
- Dashboard database

tanpa perlu membangun backend terpisah.

## React Hook Form

Untuk form panjang dan multi-step.

## Zod

Untuk validasi.

## React Flow

Untuk family tree.

## browser-image-compression

Untuk mengecilkan ukuran foto sebelum upload.

## @react-pdf/renderer

Untuk membuat PDF buku.

## TanStack Table

Untuk admin member management.

## Zustand

Hanya digunakan untuk state UI global jika diperlukan.

Jangan menggunakan Zustand untuk data database yang seharusnya diambil dari server.

---

# 12. PROJECT STRUCTURE

Gunakan struktur:

```text
src/
├── app/
│   ├── page.tsx
│   ├── form/
│   │   ├── page.tsx
│   │   └── success/
│   │       └── page.tsx
│   │
│   ├── edit/
│   │   └── [token]/
│   │       └── page.tsx
│   │
│   ├── member/
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── family/
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── tree/
│   │   └── page.tsx
│   │
│   ├── book/
│   │   ├── page.tsx
│   │   └── preview/
│   │       └── page.tsx
│   │
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── members/
│   │   ├── families/
│   │   ├── relationships/
│   │   ├── pending/
│   │   └── book/
│   │
│   └── api/
│
├── components/
│   ├── ui/
│   ├── forms/
│   ├── family/
│   ├── tree/
│   ├── book/
│   ├── admin/
│   └── shared/
│
├── lib/
│   ├── supabase/
│   ├── validations/
│   ├── utils/
│   ├── relationships/
│   └── book/
│
├── actions/
│   ├── person-actions.ts
│   ├── family-actions.ts
│   ├── relationship-actions.ts
│   ├── upload-actions.ts
│   └── book-actions.ts
│
├── types/
│   ├── person.ts
│   ├── family.ts
│   ├── relationship.ts
│   └── book.ts
│
└── pdf/
    ├── BookPDF.tsx
    ├── CoverPDF.tsx
    ├── FamilyProfilePDF.tsx
    └── TreePDF.tsx
```

---

# 13. DATABASE DESIGN

Database menggunakan PostgreSQL melalui Supabase.

## TABLE: persons

Menyimpan satu individu.

```text
persons

id UUID PRIMARY KEY
family_code VARCHAR
full_name VARCHAR NOT NULL
nickname VARCHAR
gender VARCHAR
birth_place VARCHAR
birth_date DATE
death_date DATE
education VARCHAR
occupation VARCHAR
phone VARCHAR
email VARCHAR
address TEXT
city VARCHAR
province VARCHAR
photo_path TEXT
life_status VARCHAR DEFAULT 'alive'
data_status VARCHAR DEFAULT 'draft'
edit_token UUID UNIQUE
created_at TIMESTAMP
updated_at TIMESTAMP
```

---

# 14. PERSON STATUS

## life_status

```text
alive
deceased
```

Jika deceased:

```text
death_date
```

dapat diisi.

---

## data_status

```text
draft
submitted
verified
rejected
```

---

# 15. TABLE: families

```text
families

id UUID PRIMARY KEY
family_code VARCHAR UNIQUE
family_name VARCHAR
description TEXT
status VARCHAR
created_at TIMESTAMP
updated_at TIMESTAMP
```

Contoh:

```text
family_code:
10.1

family_name:
Keluarga Agung Trisnanto
```

---

# 16. TABLE: family_members

Menghubungkan individu dengan keluarga.

```text
family_members

id UUID PRIMARY KEY
family_id UUID
person_id UUID
role VARCHAR
created_at TIMESTAMP
```

Role:

```text
head
spouse
child
member
```

---

# 17. TABLE: relationships

Tabel paling penting untuk family tree.

```text
relationships

id UUID PRIMARY KEY

person_id UUID

related_person_id UUID

relationship_type VARCHAR

status VARCHAR

created_by UUID NULL

verified_by UUID NULL

created_at TIMESTAMP

updated_at TIMESTAMP
```

Relationship type:

```text
parent
child
spouse
```

---

# 18. RELATIONSHIP RULE

Jangan menyimpan:

```text
father_id
mother_id
grandfather_id
grandmother_id
child_id
grandchild_id
```

di tabel `persons`.

Gunakan relationship graph.

Contoh:

```text
Agung
  │
  ├── spouse → Agnes
  │
  ├── parent → Ilyasa
  │
  └── parent → Bintang
```

---

# 19. TABLE: pending_persons

Digunakan untuk orang yang disebut tetapi belum terdaftar.

```text
pending_persons

id UUID PRIMARY KEY
name VARCHAR NOT NULL
gender VARCHAR
birth_place VARCHAR
birth_date DATE
relationship_type VARCHAR
created_by_person_id UUID NULL
linked_person_id UUID NULL
status VARCHAR DEFAULT 'pending'
created_at TIMESTAMP
updated_at TIMESTAMP
```

Status:

```text
pending
linked
rejected
```

---

# 20. TABLE: relationship_requests

```text
relationship_requests

id UUID PRIMARY KEY

source_person_id UUID

target_person_id UUID

relationship_type VARCHAR

status VARCHAR

created_at TIMESTAMP

updated_at TIMESTAMP
```

Status:

```text
pending
approved
rejected
```

---

# 21. TABLE: books

```text
books

id UUID PRIMARY KEY

title VARCHAR

subtitle VARCHAR

family_name VARCHAR

cover_path TEXT

status VARCHAR

created_at TIMESTAMP

updated_at TIMESTAMP
```

Status:

```text
draft
published
archived
```

---

# 22. TABLE: book_sections

```text
book_sections

id UUID PRIMARY KEY

book_id UUID

section_type VARCHAR

title VARCHAR

sort_order INTEGER

is_visible BOOLEAN

created_at TIMESTAMP

updated_at TIMESTAMP
```

Section type:

```text
cover
toc
tree
generation
family
member
custom
```

---

# 23. TABLE: activity_logs

Mencatat aktivitas penting.

```text
activity_logs

id UUID PRIMARY KEY

action VARCHAR

entity_type VARCHAR

entity_id UUID

description TEXT

created_at TIMESTAMP
```

Contoh:

```text
CREATE_PERSON
UPDATE_PERSON
CREATE_RELATIONSHIP
APPROVE_RELATIONSHIP
UPLOAD_PHOTO
PUBLISH_BOOK
```

---

# 24. DATABASE INDEXES

Tambahkan index:

```text
persons.full_name

persons.birth_date

persons.family_code

persons.edit_token

families.family_code

relationships.person_id

relationships.related_person_id

relationships.relationship_type

pending_persons.name
```

Tujuannya agar search dan family tree tetap cepat ketika jumlah anggota bertambah.

---

# 25. DATA RELATIONSHIP FLOW

## Scenario A — Orang tua sudah ada

User memasukkan:

```text
Ayah:
Agung Trisnanto
```

Sistem melakukan search.

Jika ditemukan:

```text
Agung Trisnanto
22 September 1970

[Hubungkan]
```

Setelah klik:

```text
relationship
parent
```

dibuat.

---

# 26. Scenario B — Orang tua belum ada

User memasukkan:

```text
Ayah:
Agus Santoso
```

Tidak ditemukan.

Tampilkan:

```text
Anggota belum ditemukan.

[ Tambahkan sebagai orang yang belum terdaftar ]
```

Sistem membuat:

```text
pending_person
```

---

# 27. Scenario C — Pending Person Kemudian Mendaftar

Agus mendaftar.

Sistem mencari pending person berdasarkan:

```text
name
birth_date
birth_place
gender
```

Jika kemungkinan cocok:

```text
Kemungkinan data Anda sudah pernah
ditambahkan oleh anggota keluarga.

Agus Santoso

[Ini Saya]
[Bukan Saya]
```

Jika "Ini Saya":

```text
pending_person
      ↓
linked_person_id
      ↓
person
```

---

# 28. DUPLICATE DETECTION

Ketika membuat person baru, sistem harus mencari kemungkinan duplicate.

Matching menggunakan:

```text
full_name
birth_date
birth_place
gender
```

Tidak boleh otomatis menggabungkan data.

Selalu meminta konfirmasi.

---

# 29. FORM UTAMA

URL:

```text
/form
```

Form harus berupa multi-step.

---

# 30. STEP 1 — DATA DIRI

Field:

```text
Foto
Nama Lengkap *
Nama Panggilan
Jenis Kelamin *
Tempat Lahir
Tanggal Lahir
Status Hidup
Pendidikan Terakhir
Pekerjaan
Nomor Telepon
Email
Alamat
Kota
Provinsi
```

---

# 31. STEP 2 — STATUS KELUARGA

Pertanyaan:

```text
Status Anda dalam keluarga?
```

Pilihan:

```text
Anak
Cucu
Cicit
Orang Tua
Kakek/Nenek
Buyut
Lainnya
```

Catatan:

Status generasi ini **hanya informasi tampilan**.

Jangan digunakan sebagai dasar utama family tree.

Generasi tetap dihitung dari relationship.

---

# 32. STEP 3 — ORANG TUA

Form:

```text
Apakah orang tua Anda sudah terdaftar?

[ Cari anggota keluarga ]
```

Search:

```text
[ Cari nama... ]
```

Result:

```text
Agung Trisnanto
22 September 1970

[Hubungkan sebagai Ayah]
```

dan:

```text
[Hubungkan sebagai Ibu]
```

Jika tidak ada:

```text
[Orang ini belum terdaftar]
```

---

# 33. STEP 4 — PASANGAN

Pertanyaan:

```text
Apakah Anda memiliki pasangan?

○ Ya
○ Tidak
```

Jika ya:

```text
Apakah pasangan sudah terdaftar?

[ Cari anggota ]
```

Jika ditemukan:

```text
Agnes Evi Guno

[Hubungkan]
```

Jika belum:

```text
Nama pasangan
Tanggal lahir
Foto
```

Buat pending person atau person baru sesuai flow.

---

# 34. STEP 5 — ANAK

Pengguna dapat menambahkan banyak anak.

Interface:

```text
Anak #1

Nama
Jenis Kelamin
Tempat Lahir
Tanggal Lahir

[Hubungkan dengan anggota yang sudah ada]

[Hapus]
```

Button:

```text
+ Tambah Anak
```

Anak dapat berupa:

```text
Existing Person
```

atau:

```text
Pending Person
```

---

# 35. STEP 6 — REVIEW RELASI

Sebelum submit, tampilkan:

```text
Hubungan Keluarga Anda

Anda:
Agung Trisnanto

Pasangan:
Agnes Evi Guno ✓

Orang Tua:
Ayah: Budi Santoso ✓
Ibu: Siti Aminah Pending

Anak:
Ilyasa ✓
Bintang Pending
```

User dapat mengubah sebelum submit.

---

# 36. STEP 7 — FOTO

Upload:

### Foto Profil

Required/recommended.

### Foto Pasangan

Optional.

### Foto Anak

Optional.

---

# 37. IMAGE UPLOAD

Gunakan:

**Supabase Storage**

Bucket:

```text
family-assets
```

Path:

```text
families/{family_id}/persons/{person_id}/profile.webp
```

---

# 38. IMAGE COMPRESSION

Sebelum upload:

```text
Original Image
      ↓
Validate
      ↓
Resize
      ↓
Compress
      ↓
WEBP
      ↓
Supabase Storage
```

Target:

```text
Max width:
1200px

Quality:
75%

Target file:
< 1 MB
```

Untuk thumbnail:

```text
400 × 400
```

Jangan menyimpan Base64 di database.

Database hanya menyimpan:

```text
photo_path
```

---

# 39. IMAGE VALIDATION

Allowed:

```text
JPG
JPEG
PNG
WEBP
```

Maximum original:

```text
10 MB
```

Jika lebih:

```text
Foto terlalu besar.
Ukuran maksimal 10 MB.
```

---

# 40. IMAGE PREVIEW

Setelah memilih:

```text
┌────────────────────────┐
│                        │
│       [ PHOTO ]        │
│                        │
└────────────────────────┘

[ Ganti Foto ]
```

Upload dilakukan saat user menekan:

```text
Simpan / Lanjut
```

atau dapat dilakukan langsung dengan progress indicator.

---

# 41. FORM AUTOSAVE

Form panjang harus mendukung draft.

Setiap step disimpan.

Status:

```text
Draft
```

Jika browser tertutup:

```text
Draft ditemukan.

Anda memiliki pengisian yang belum selesai.

[Lanjutkan]
[Mulai Baru]
```

---

# 42. SUBMIT

Setelah submit:

```text
Data berhasil disimpan.

Terima kasih telah mengisi data
Keluarga Besar Bani H.M. Shidiq.

Simpan link berikut:

[ Copy Link Edit ]

Link ini digunakan untuk
mengubah data Anda di kemudian hari.
```

---

# 43. EDIT DATA

URL:

```text
/edit/[token]
```

Contoh:

```text
/edit/uuid-random-token
```

Halaman menampilkan data berdasarkan token.

User dapat:

- Edit nama
- Edit data pribadi
- Edit pasangan
- Edit orang tua
- Edit anak
- Ganti foto

---

# 44. MEMBER PROFILE

URL:

```text
/member/[id]
```

Tampilan:

```text
[Foto]

Agung Trisnanto

22 September 1970
Surakarta

Pekerjaan
Swasta

Pendidikan
S1
```

Section:

```text
Pasangan
Anak
Orang Tua
Saudara
Family Tree
```

---

# 45. FAMILY PROFILE

URL:

```text
/family/[id]
```

Tampilan mengikuti buku fisik.

Contoh:

```text
KELUARGA BESAR BANI H.M. SHIDIQ

Kode Keluarga:
10.1

DATA PRIBADI

[Foto]

Nama:
Agung Trisnanto

Status:
Cucu

Tempat/Tgl Lahir:
Surakarta, 22 September 1970

Pendidikan:
S1

Pekerjaan:
Swasta

No. Telp:
...

Alamat:
...
```

Kemudian:

```text
DATA ISTRI

[Foto]

Agnes Evi Guno
...
```

Kemudian:

```text
ANAK-ANAK

1. Muh. Ilyasa Pradita R.
2. Muh. Bintang Firdausi
```

---

# 46. FAMILY TREE

Gunakan:

**@xyflow/react**

Tree harus bersifat interactive.

Node:

```text
┌──────────────────────┐
│       [Foto]         │
│                      │
│ Agung Trisnanto      │
│ 1970                 │
│ Generasi 3           │
└──────────────────────┘
```

Edge:

```text
Parent → Child
Spouse ─ Spouse
```

---

# 47. TREE RULES

Family tree tidak dibuat dari `family_id` saja.

Family tree dibuat berdasarkan:

```text
relationships
```

Algoritma:

1. Tentukan root ancestor.
2. Ambil child relationship.
3. Traversal ke bawah.
4. Tentukan generation depth.
5. Generate nodes.
6. Generate edges.
7. Render menggunakan React Flow.

---

# 48. ROOT ANCESTOR

Admin dapat menentukan:

```text
Root Family Member
```

Contoh:

```text
H.M. Shidiq
```

Setelah root ditentukan:

```text
H.M. Shidiq
Generation 1
```

Anak:

```text
Generation 2
```

Cucu:

```text
Generation 3
```

Cicit:

```text
Generation 4
```

---

# 49. GENERATION CALCULATION

Jangan meminta user memasukkan:

```text
Generasi ke-3
```

sebagai data utama.

Sistem menghitung:

```text
Root = 1

Child = parent generation + 1

Grandchild = parent generation + 1
```

Jika terdapat relasi yang belum terhubung, anggota ditampilkan:

```text
Generasi belum diketahui
```

sampai relationship selesai.

---

# 50. TREE CONTROLS

Family tree menyediakan:

```text
Zoom In
Zoom Out
Fit View
Fullscreen
Search
Filter Generation
```

Search:

```text
[Cari anggota...]
```

Jika ditemukan, tree fokus ke node tersebut.

---

# 51. DIGITAL BOOK

Buku digital harus menjadi output utama.

Struktur:

```text
COVER
↓
DAFTAR ISI
↓
SILSILAH KELUARGA
↓
GENERASI 1
↓
GENERASI 2
↓
GENERASI 3
↓
GENERASI 4
↓
DATA KELUARGA
↓
DATA ANGGOTA
```

---

# 52. BOOK COVER

Contoh:

```text
┌──────────────────────────────┐
│                              │
│       KELUARGA BESAR         │
│                              │
│        BANI H.M. SHIDIQ      │
│                              │
│             [FOTO]           │
│                              │
│          2026                │
│                              │
└──────────────────────────────┘
```

Cover dapat diupload oleh admin.

---

# 53. TABLE OF CONTENT

Buku memiliki daftar isi otomatis.

Contoh:

```text
DAFTAR ISI

01  Silsilah Keluarga
02  Generasi Pertama
03  Generasi Kedua
04  Generasi Ketiga
05  Keluarga Agung Trisnanto
06  Keluarga Budi Santoso
07  Keluarga ...
```

Nomor halaman dihitung saat book generation.

---

# 54. BOOK PREVIEW

URL:

```text
/book/preview
```

Preview dibuat seperti membuka buku.

Desktop:

```text
┌──────────────┬──────────────┐
│              │              │
│    Page 1    │    Page 2    │
│              │              │
└──────────────┴──────────────┘
```

Mobile:

```text
┌───────────────────┐
│                   │
│      PAGE         │
│                   │
└───────────────────┘
```

Controls:

```text
←
Page 1 / 50
→

Zoom
Fullscreen
Contents
Search
```

---

# 55. BOOK PAGE COMPONENTS

Gunakan reusable components:

```text
BookCover
BookTableOfContents
BookTreePage
BookGenerationPage
BookFamilyPage
BookMemberPage
BookDividerPage
```

Semua data berasal dari database.

---

# 56. BOOK DESIGN

Visual harus terinspirasi dari buku keluarga fisik.

Karakter:

- Elegan
- Formal
- Hangat
- Family-oriented
- Tidak terlalu modern
- Mudah dibaca

Gunakan:

### Heading

Serif.

### Body

Sans-serif.

Warna:

```text
Background:
Warm White / Cream

Text:
Dark Brown / Charcoal

Accent:
Muted Gold / Brown
```

Hindari desain SaaS dashboard untuk tampilan buku.

---

# 57. ADMIN DASHBOARD

URL:

```text
/admin
```

Dashboard:

```text
BUKU DIGITAL KELUARGA BESAR

Total Anggota
247

Total Keluarga
82

Data Verified
198

Pending
32

Pending Relationship
17
```

---

# 58. ADMIN MENU

```text
Dashboard

Anggota
├── Semua Anggota
├── Pending
├── Duplicate
└── Verification

Keluarga
├── Semua Keluarga
└── Detail Keluarga

Relasi
├── Semua Relasi
├── Pending
└── Verification

Family Tree

Buku Digital
├── Pengaturan
├── Struktur
├── Preview
└── Export PDF

Activity Log
```

---

# 59. ADMIN MEMBER TABLE

Kolom:

```text
Foto
Nama
Jenis Kelamin
Tanggal Lahir
Keluarga
Status
Relasi
Action
```

Action:

```text
View
Edit
Verify
Link
Delete
```

Gunakan TanStack Table.

---

# 60. ADMIN PENDING

Menampilkan:

```text
Pending Person

Agus Santoso

Disebut oleh:
Budi Santoso

Kemungkinan:
Agus Santoso
ID: P-0012

[Link]
[Create New]
[Reject]
```

---

# 61. ADMIN DUPLICATE

Jika ada kemungkinan duplicate:

```text
Kemungkinan Duplikasi

Person A:
Agung Trisnanto
22 September 1970

Person B:
Agung Trisnanto
22 September 1970

[Merge]
[Bukan Duplicate]
```

Merge harus meminta konfirmasi.

---

# 62. MERGE PERSON

Jika dua person ternyata sama:

```text
Primary Person
Agung Trisnanto

Secondary Person
Agung Trisnanto
```

Sistem:

1. Memilih primary.
2. Memindahkan relationship secondary ke primary.
3. Memindahkan family membership.
4. Memindahkan data foto jika diperlukan.
5. Memindahkan pending relationships.
6. Menandai secondary sebagai merged.
7. Tidak langsung hard delete.

---

# 63. PRIVACY

Karena tidak ada authentication, data sensitif tidak boleh ditampilkan secara default di public book.

### Public

```text
Nama
Foto
Tempat/Tanggal lahir
Pendidikan
Pekerjaan
```

### Family Only

```text
Alamat
```

### Private

```text
Nomor HP
Email
```

Untuk MVP, public book tidak menampilkan:

```text
phone
email
```

---

# 64. PUBLIC BOOK

URL:

```text
/book/[slug]
```

Contoh:

```text
/book/bani-hm-shidiq
```

Pengunjung dapat:

- Membuka buku.
- Melihat family tree.
- Mencari anggota.
- Membuka profil.
- Melihat data public.
- Download PDF jika diaktifkan.

---

# 65. SEARCH

Global search:

```text
Cari anggota keluarga...
```

Search:

```text
full_name
nickname
family_code
birth_year
```

Hasil:

```text
Agung Trisnanto
1970
Keluarga 10.1

[ Lihat ]
```

---

# 66. BOOK GENERATION

Book tidak menyimpan HTML halaman.

Database:

```text
persons
families
relationships
```

↓

Book Generator

↓

```text
Book Data
```

↓

```text
Preview
```

atau

```text
PDF
```

---

# 67. PDF EXPORT

Gunakan:

```text
@react-pdf/renderer
```

PDF terdiri dari:

```text
CoverPDF
TOCPDF
TreePDF
GenerationPDF
FamilyPDF
MemberPDF
```

Ukuran:

```text
A4 Portrait
```

Jika layout buku membutuhkan landscape untuk family tree:

```text
Tree page:
A4 Landscape
```

Tetapi usahakan seluruh buku menggunakan format konsisten.

---

# 68. IMAGE DI PDF

Foto berasal dari Supabase Storage.

Saat PDF dibuat:

```text
Storage Path
      ↓
Image URL
      ↓
PDF Image
```

Pastikan URL dapat diakses oleh renderer.

Jika bucket private, gunakan signed URL.

---

# 69. BOOK VERSION

Buku memiliki versi.

Contoh:

```text
Buku 2026
Version 1
```

Jika data berubah:

```text
Generate Version 2
```

Data lama tidak harus dihapus.

---

# 70. BOOK STATUS

```text
draft
published
archived
```

Hanya `published` yang dapat ditampilkan pada public URL.

---

# 71. FORM VALIDATION

Gunakan:

```text
React Hook Form
+
Zod
```

Required:

```text
full_name
gender
```

Recommended:

```text
birth_place
birth_date
photo
```

Optional:

```text
nickname
education
occupation
phone
email
address
```

---

# 72. FORM ERROR

Gunakan pesan yang sederhana.

Contoh:

```text
Nama wajib diisi.

Jenis kelamin wajib dipilih.

Format email tidak valid.

Tanggal lahir tidak valid.

Foto terlalu besar.
```

Jangan menggunakan error teknis seperti:

```text
ZodError...
Postgres constraint...
```

---

# 73. LOADING STATE

Semua operasi async harus memiliki loading state.

Contoh:

```text
Menyimpan...
Mengupload foto...
Menghubungkan anggota...
Memuat family tree...
Membuat preview...
Membuat PDF...
```

Button disabled ketika loading.

---

# 74. TOAST

Gunakan Sonner.

Success:

```text
Data berhasil disimpan.
```

Error:

```text
Terjadi kesalahan. Silakan coba lagi.
```

---

# 75. RESPONSIVE DESIGN

Prioritas perangkat:

1. Mobile
2. Tablet
3. Desktop

Karena mayoritas anggota keluarga kemungkinan mengisi form menggunakan smartphone.

---

# 76. MOBILE FORM

Pada mobile:

- Satu kolom.
- Sticky bottom action.
- Progress step.
- Input besar.
- Upload foto dari kamera/gallery.
- Jangan membuat tabel lebar.
- Gunakan card untuk anak/pasangan.

Contoh:

```text
┌───────────────────────────┐
│ Data Pribadi              │
│                           │
│ Nama Lengkap              │
│ [____________________]    │
│                           │
│ Jenis Kelamin             │
│ [____________________]    │
│                           │
│                           │
│ [ Simpan & Lanjutkan ]    │
└───────────────────────────┘
```

---

# 77. FAMILY MEMBER CARD

```text
┌────────────────────────────┐
│ [Foto]                     │
│                            │
│ Agung Trisnanto            │
│ 1970                       │
│ Cucu                       │
│                            │
│ [Lihat Profil]             │
└────────────────────────────┘
```

---

# 78. FAMILY CARD

```text
┌────────────────────────────┐
│ Keluarga 10.1              │
│                            │
│ Agung Trisnanto             │
│ Agnes Evi Guno              │
│                            │
│ 2 Anak                     │
│                            │
│ [Lihat Keluarga]           │
└────────────────────────────┘
```

---

# 79. DATA FLOW

## User Submission

```text
User
 ↓
Next.js Form
 ↓
React Hook Form
 ↓
Zod Validation
 ↓
Server Action
 ↓
Supabase PostgreSQL
 ↓
Relationship Processing
 ↓
Response
```

## Image

```text
User
 ↓
Select Image
 ↓
Browser Compression
 ↓
Supabase Storage
 ↓
Storage Path
 ↓
persons.photo_path
```

---

# 80. RELATIONSHIP PROCESSING

Ketika form disubmit:

```text
1. Create/update person
2. Create/update family
3. Process parent
4. Process spouse
5. Process children
6. Search existing persons
7. Create relationship if found
8. Create pending person if not found
9. Create relationship request if necessary
10. Return edit token
```

---

# 81. TRANSACTION SAFETY

Operasi yang berhubungan dengan banyak tabel harus diproses secara aman.

Contoh:

```text
Create Person
+
Create Family
+
Create Relationship
```

Jika salah satu gagal, sistem tidak boleh menghasilkan data setengah jadi.

Gunakan server-side transaction/RPC PostgreSQL untuk operasi kompleks.

---

# 82. RLS

Karena tidak ada authentication, jangan mengandalkan `auth.uid()`.

Database access sebaiknya **tidak memberikan akses tulis bebas dari browser**.

Rekomendasi:

```text
Browser
   ↓
Next.js Server Action
   ↓
Supabase Server
```

Server menggunakan:

```text
SUPABASE_SERVICE_ROLE_KEY
```

dan key tersebut **tidak pernah dikirim ke browser**.

Public browser hanya menggunakan data yang memang sengaja dipublikasikan.

---

# 83. ENVIRONMENT VARIABLES

Gunakan:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

ADMIN_SECRET=
```

Jangan pernah expose:

```text
SUPABASE_SERVICE_ROLE_KEY
ADMIN_SECRET
```

ke client.

---

# 84. SUPABASE STORAGE POLICY

Karena upload dilakukan melalui server action/API:

- Browser tidak mendapatkan service role.
- Server memvalidasi file.
- Server mengupload ke Supabase Storage.
- Database menyimpan storage path.

Bucket:

```text
family-assets
```

---

# 85. SECURITY CONSIDERATIONS

Walaupun tidak menggunakan authentication, tetap lakukan:

- UUID untuk ID.
- Random edit token.
- Server-side validation.
- File type validation.
- File size validation.
- Rate limiting untuk public form.
- CAPTCHA jika spam meningkat.
- Jangan expose phone/email pada public book.
- Jangan expose service role key.
- Jangan menggunakan sequential numeric IDs.
- Jangan menerima HTML mentah dari user.
- Sanitize text.
- Batasi ukuran request.

---

# 86. RATE LIMITING

Public form harus memiliki perlindungan dari spam.

Untuk MVP sederhana:

```text
IP based rate limit
```

Jika deployment Vercel membutuhkan layanan tambahan, gunakan rate-limit service yang ringan.

Jangan membuat sistem rate limiting kompleks jika belum diperlukan.

---

# 87. ADMIN DASHBOARD SECURITY

Admin URL:

```text
/admin
```

Admin harus memasukkan:

```text
ADMIN_SECRET
```

Secret diverifikasi server-side.

Jangan pernah membandingkan secret menggunakan client-side JavaScript.

---

# 88. ADMIN FEATURES MVP

Admin harus dapat:

### Dashboard

- Statistik anggota.
- Statistik keluarga.
- Pending.
- Relationship pending.

### Members

- Search.
- Filter.
- View.
- Edit.
- Verify.
- Delete/Archive.

### Families

- Create.
- Edit.
- View.

### Relationships

- View.
- Approve.
- Reject.
- Link.

### Tree

- View.
- Root selection.

### Book

- Configure.
- Preview.
- Publish.
- Generate PDF.

---

# 89. ACTIVITY LOG

Catat:

```text
Person created
Person updated
Person verified
Relationship created
Relationship approved
Relationship rejected
Person merged
Photo uploaded
Book published
Book generated
```

---

# 90. LANDING PAGE

Homepage:

```text
KELUARGA BESAR
BANI H.M. SHIDIQ

Satu keluarga.
Banyak generasi.
Satu cerita.

[ Isi Data Keluarga ]
[ Lihat Buku Digital ]
```

Section:

```text
Tentang Keluarga
Family Tree
Generasi
Buku Digital
```

---

# 91. FORM ENTRY

CTA utama:

```text
Isi Data Keluarga
```

Klik:

```text
/form
```

Tidak perlu login.

---

# 92. FORM INTRODUCTION

Sebelum form:

```text
Lengkapi Data Keluarga

Data yang Anda masukkan akan digunakan
untuk menyusun Buku Digital Keluarga Besar.

Anda dapat mengisi data keluarga meskipun
anggota keluarga lainnya belum mengisi.

Pastikan data yang dimasukkan benar.
```

Button:

```text
Mulai Mengisi
```

---

# 93. SUCCESS PAGE

Setelah submit:

```text
✓ Data Berhasil Disimpan

Terima kasih telah berpartisipasi
dalam pendataan keluarga.

Simpan link berikut untuk mengubah
data Anda di kemudian hari.

[ Copy Link ]

[ Lihat Data Saya ]

[ Kembali ke Buku ]
```

---

# 94. BOOK NAVIGATION

Book viewer:

```text
←
Previous

1 / 84

Next
→
```

Additional:

```text
Contents
Search
Zoom
Fullscreen
Download
```

---

# 95. BOOK SEARCH

Search di buku:

```text
Cari:
Agung Trisnanto
```

Result:

```text
Agung Trisnanto

Page 32

[ Buka Halaman ]
```

---

# 96. FAMILY TREE SEARCH

Search:

```text
Cari anggota...
```

Ketika user memilih:

```text
Agung Trisnanto
```

tree melakukan:

```text
focus node
zoom to node
highlight node
```

---

# 97. BOOK DATA GENERATION

Book generator membuat struktur:

```typescript
{
  cover,
  tableOfContents,
  tree,
  generations: [
    {
      generation: 1,
      members: []
    },
    {
      generation: 2,
      members: []
    }
  ],
  families: []
}
```

Struktur ini digunakan bersama oleh:

```text
Web Preview
PDF
```

---

# 98. IMPORTANT: SINGLE SOURCE OF TRUTH

Jangan membuat:

```text
Database Data
+
Book Data Manual
```

Yang benar:

```text
Supabase Database
        ↓
Book Data Generator
        ↓
     ┌──┴──┐
     ↓     ↓
   Web    PDF
```

---

# 99. BOOK UPDATE

Jika anggota baru ditambahkan:

```text
New Person
 ↓
Relationship
 ↓
Database Updated
 ↓
Family Tree Updated
 ↓
Book Preview Updated
```

Admin tidak perlu mengedit halaman buku secara manual.

---

# 100. MVP PHASE

## PHASE 1 — Foundation

- [ ] Next.js setup
- [ ] TypeScript
- [ ] Tailwind
- [ ] shadcn/ui
- [ ] Supabase connection
- [ ] Database schema
- [ ] Storage bucket
- [ ] Environment variables

---

## PHASE 2 — Data Collection

- [ ] Landing page
- [ ] Form intro
- [ ] Multi-step form
- [ ] Personal data
- [ ] Parent
- [ ] Spouse
- [ ] Children
- [ ] Address
- [ ] Photo upload
- [ ] Image compression
- [ ] Draft
- [ ] Submit
- [ ] Edit token

---

## PHASE 3 — Relationship

- [ ] Person search
- [ ] Existing person linking
- [ ] Pending person
- [ ] Relationship request
- [ ] Relationship verification
- [ ] Duplicate detection
- [ ] Merge

---

## PHASE 4 — Family Tree

- [ ] Root ancestor
- [ ] Generation calculation
- [ ] Tree generation
- [ ] React Flow
- [ ] Node profile
- [ ] Search
- [ ] Zoom
- [ ] Filter generation

---

## PHASE 5 — Digital Book

- [ ] Cover
- [ ] Table of contents
- [ ] Tree page
- [ ] Generation page
- [ ] Family page
- [ ] Member page
- [ ] Book viewer
- [ ] Search
- [ ] Responsive book

---

## PHASE 6 — Admin

- [ ] Admin secret
- [ ] Dashboard
- [ ] Member management
- [ ] Family management
- [ ] Relationship management
- [ ] Pending management
- [ ] Duplicate management
- [ ] Activity log

---

## PHASE 7 — PDF

- [ ] PDF cover
- [ ] PDF TOC
- [ ] PDF tree
- [ ] PDF generation
- [ ] PDF family
- [ ] PDF member
- [ ] PDF download

---

# 101. ACCEPTANCE CRITERIA

Project dianggap berhasil jika:

### Data

- [ ] User dapat mengisi data tanpa login.
- [ ] User dapat mengupload foto.
- [ ] Foto otomatis dikompres.
- [ ] Foto tersimpan di Supabase Storage.
- [ ] Data tersimpan di PostgreSQL.
- [ ] User mendapatkan edit link.

### Relationship

- [ ] User dapat memilih anggota yang sudah ada.
- [ ] User dapat menambahkan anggota yang belum ada.
- [ ] Pending person dapat di-link.
- [ ] Duplicate dapat dideteksi.
- [ ] Relationship dapat diverifikasi.
- [ ] Data dapat diisi tanpa urutan generasi.

### Tree

- [ ] Family tree dibuat dari relationship.
- [ ] Generasi dihitung otomatis.
- [ ] Node dapat diklik.
- [ ] Search tersedia.
- [ ] Tree dapat di-zoom.

### Book

- [ ] Buku dapat dipreview.
- [ ] Buku responsive.
- [ ] Daftar isi otomatis.
- [ ] Data keluarga muncul.
- [ ] Data anggota muncul.
- [ ] Buku mengambil data terbaru dari database.

### PDF

- [ ] PDF dapat dibuat.
- [ ] Foto muncul.
- [ ] Layout konsisten.
- [ ] PDF dapat di-download.

### Admin

- [ ] Admin dapat melihat semua anggota.
- [ ] Admin dapat memverifikasi.
- [ ] Admin dapat mengelola relationship.
- [ ] Admin dapat mengelola buku.
- [ ] Admin dapat publish buku.

---

# 102. NON-FUNCTIONAL REQUIREMENTS

## Performance

Target:

- Landing page cepat.
- Form tidak melakukan full page reload.
- Image upload memiliki progress.
- Family tree tidak mengambil seluruh data jika tidak diperlukan.
- Member list menggunakan pagination.
- Search menggunakan server-side query.

## Responsive

Wajib mendukung:

```text
Mobile
Tablet
Desktop
```

## Accessibility

Gunakan:

- Semantic HTML.
- Label form.
- Keyboard navigation.
- Focus state.
- Alt text foto.
- Kontras warna yang cukup.

---

# 103. DESIGN SYSTEM

Gunakan:

```text
Primary:
Dark Brown

Background:
Warm White / Cream

Surface:
White

Text:
Charcoal

Muted:
Warm Gray

Accent:
Muted Gold
```

Gunakan CSS variables sehingga warna mudah diganti.

---

# 104. TYPOGRAPHY

Untuk buku:

```text
Heading:
Serif

Body:
Sans Serif
```

Untuk dashboard:

```text
Sans Serif
```

Buku harus terasa seperti:

```text
Family Archive
+
Modern Digital Book
```

bukan:

```text
Corporate SaaS
```

---

# 105. EMPTY STATES

Contoh:

```text
Belum ada anggota keluarga.

[ Tambah Anggota ]
```

Pending:

```text
Belum ada hubungan yang menunggu verifikasi.
```

Tree:

```text
Family tree belum dapat dibuat
karena belum ada root ancestor.
```

---

# 106. ERROR STATES

Contoh:

```text
Data gagal dimuat.

[ Coba Lagi ]
```

Upload:

```text
Foto gagal diupload.

Pastikan ukuran dan format foto sesuai.
```

Database:

```text
Terjadi masalah saat menyimpan data.

Data Anda belum dianggap tersimpan.
Silakan coba lagi.
```

---

# 107. IMPORTANT DEVELOPMENT RULES

AI coding agent harus mengikuti aturan berikut:

### Rule 1

Jangan membuat authentication.

### Rule 2

Jangan menggunakan Prisma jika tidak diperlukan.

### Rule 3

Jangan membuat backend Express terpisah.

### Rule 4

Gunakan Supabase PostgreSQL.

### Rule 5

Gunakan Supabase Storage untuk gambar.

### Rule 6

Jangan menyimpan Base64 image di database.

### Rule 7

Gunakan Server Actions untuk mutation penting.

### Rule 8

Gunakan Zod untuk validation.

### Rule 9

Gunakan React Hook Form untuk form.

### Rule 10

Jangan membuat relationship berdasarkan urutan pengisian.

### Rule 11

Gunakan pending person.

### Rule 12

Jangan otomatis merge duplicate tanpa konfirmasi.

### Rule 13

Jangan menyimpan generation number sebagai sumber kebenaran.

### Rule 14

Generation harus dihitung dari relationship graph.

### Rule 15

Book harus di-generate dari database.

### Rule 16

Jangan membuat data buku secara hardcoded.

---

# 108. PRIORITY

## P0 — Wajib

```text
Database
Form
Person
Family
Relationship
Pending Person
Image Upload
Edit Token
Admin
Family Tree
Book Preview
```

## P1 — Penting

```text
Duplicate Detection
Relationship Verification
PDF Export
Activity Log
Search
```

## P2 — Future

```text
QR Code
Family Timeline
Gallery
Event
Video
Audio
GEDCOM
AI Relationship Suggestion
```

---

# 109. FINAL ARCHITECTURE

```text
                         USER
                           │
                           ↓
                    NEXT.JS APP
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ↓             ↓             ↓
           FORM          BOOK          ADMIN
             │             │             │
             └─────────────┼─────────────┘
                           ↓
                    SERVER ACTIONS
                           │
                           ↓
                     SUPABASE
              ┌────────────┼────────────┐
              ↓            ↓            ↓
         PostgreSQL      Storage      RPC
              │            │
              ↓            ↓
         Family Data      Images
              │
              ↓
       Relationship Graph
              │
        ┌─────┴─────┐
        ↓           ↓
   Family Tree    Book Data
                    │
              ┌─────┴─────┐
              ↓           ↓
         Web Preview     PDF
```

---

# 110. CORE DATA RELATIONSHIP

```text
                        ROOT ANCESTOR
                              │
                              ↓
                         GENERATION 1
                              │
                         parent/child
                              │
                              ↓
                         GENERATION 2
                              │
                         parent/child
                              │
                              ↓
                         GENERATION 3
                              │
                         parent/child
                              │
                              ↓
                         GENERATION 4
```

Pasangan:

```text
Person A ───── spouse ───── Person B
```

Anak:

```text
Person A
   │
   ├──── child ──── Person C
   │
   └──── child ──── Person D
```

---

# 111. CONTOH KONDISI REAL

Misalnya ada:

```text
H.M. Shidiq
      │
      ↓
Agung
      │
      ↓
Ilyasa
      │
      ↓
Cucu
```

Tetapi pengisian terjadi:

```text
Hari 1:
Cucu

Hari 2:
Ilyasa

Hari 5:
Agung

Hari 10:
H.M. Shidiq
```

Database awal:

```text
Cucu
 ↓
Ilyasa [Pending]
```

Kemudian:

```text
Ilyasa
 ↓
Agung [Pending]
```

Kemudian:

```text
Agung
 ↓
H.M. Shidiq [Pending]
```

Setelah seluruh data terhubung:

```text
H.M. Shidiq
      │
      ↓
    Agung
      │
      ↓
    Ilyasa
      │
      ↓
     Cucu
```

Sistem kemudian menghitung:

```text
H.M. Shidiq → Generation 1
Agung       → Generation 2
Ilyasa      → Generation 3
Cucu        → Generation 4
```

---

# 112. HASIL AKHIR YANG DIHARAPKAN

Aplikasi menghasilkan tiga output utama:

## 1. DATA COLLECTION

```text
/form
```

Untuk mengumpulkan data keluarga.

## 2. FAMILY TREE

```text
/tree
```

Untuk melihat hubungan antar generasi.

## 3. DIGITAL BOOK

```text
/book/[slug]
```

Untuk membaca buku keluarga dalam format digital.

---

# 113. VIBE CODING INSTRUCTION

Saat mulai mengembangkan project, AI coding agent harus:

1. Membaca PRD ini terlebih dahulu.
2. Membuat project Next.js App Router dengan TypeScript.
3. Setup Tailwind dan shadcn/ui.
4. Setup Supabase.
5. Membuat database schema dan migration.
6. Membuat storage bucket.
7. Membuat utility Supabase server/client.
8. Membuat type definitions berdasarkan database.
9. Membuat validation schema menggunakan Zod.
10. Membuat multi-step family form.
11. Membuat image upload + compression.
12. Membuat edit token.
13. Membuat relationship engine.
14. Membuat pending person system.
15. Membuat family tree.
16. Membuat book generator.
17. Membuat book preview.
18. Membuat admin dashboard.
19. Membuat PDF export.
20. Melakukan testing terhadap seluruh flow.

Jangan langsung membuat seluruh UI sekaligus.

Implementasikan berdasarkan urutan:

```text
DATABASE
    ↓
CORE DATA
    ↓
FORM
    ↓
RELATIONSHIP
    ↓
TREE
    ↓
BOOK
    ↓
ADMIN
    ↓
PDF
    ↓
POLISH
```

---

# 114. DEFINITION OF DONE

Project dianggap selesai apabila pengguna dapat melakukan flow berikut tanpa bantuan developer:

```text
Buka website
      ↓
Klik "Isi Data Keluarga"
      ↓
Mengisi data diri
      ↓
Upload foto
      ↓
Mencari orang tua
      ↓
Jika belum ada → buat pending
      ↓
Menambahkan pasangan
      ↓
Menambahkan anak
      ↓
Review
      ↓
Submit
      ↓
Mendapatkan edit link
      ↓
Admin melihat data
      ↓
Admin melakukan verification
      ↓
Anggota lain mengisi data
      ↓
Pending relationship terhubung
      ↓
Family tree otomatis berubah
      ↓
Buku digital otomatis berubah
      ↓
Admin preview buku
      ↓
Admin publish
      ↓
Pengunjung membuka buku digital
      ↓
Admin export PDF
```

**Core principle aplikasi:**

> **Anggota keluarga boleh mengisi kapan saja dan dari generasi mana saja. Sistem yang bertugas menghubungkan mereka, bukan pengguna yang harus mengikuti urutan silsilah.**

Dengan prinsip ini, project tetap sederhana dari sisi UX tetapi struktur database-nya cukup kuat untuk menangani keluarga besar dengan ratusan bahkan ribuan anggota.