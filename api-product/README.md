# Razor Audio REST API

REST API untuk data produk Razor Audio — dibuat menggunakan **Node.js** dan **Express.js** sebagai bagian dari exercise *Full Stack Web Development Bootcamp*.

---

## Tech Stack

| Tool | Versi |
|---|---|
| Node.js | v22+ |
| Express.js | v4.18 |
| dotenv | v16+ |
| cors | v2.8 |

---

## Struktur Folder

```
api-product/
├── server.js               ← Entry point, semua route & middleware
├── config.js               ← Konfigurasi environment
├── api.js                  ← Frontend integration script
├── package.json
├── .env                    ← Environment variables (tidak di-commit)
├── .gitignore
├── postman-collection.json ← Import ke Postman
└── README.md
```

---

## Cara Menjalankan

### 1. Install dependencies
```bash
npm install
```

### 2. Setup environment
```bash
# Salin .env dan sesuaikan jika perlu
# Default sudah siap pakai
PORT=3000
NODE_ENV=development
```

### 3. Jalankan server
```bash
# Mode normal
node server.js

# Mode development (auto-restart)
npm run dev
```

Server berjalan di: **http://localhost:3000**

---

## Endpoints

### Base URL
```
http://localhost:3000
```

---

### GET `/`
Health check — cek status API.

**Response:**
```json
{
  "success": true,
  "message": "Razor Audio API is running",
  "version": "v1",
  "env": "development"
}
```

---

### GET `/api/products`
Ambil semua produk. Support search, filter, sort, dan pagination.

**Query Parameters:**

| Parameter | Tipe | Contoh | Keterangan |
|---|---|---|---|
| `search` | string | `?search=Z90s` | Cari berdasarkan nama/deskripsi |
| `category` | string | `?category=wireless` | Filter kategori: `wireless`, `wired` |
| `minPrice` | number | `?minPrice=50` | Harga minimum |
| `maxPrice` | number | `?maxPrice=200` | Harga maksimum |
| `inStock` | boolean | `?inStock=true` | Filter stok tersedia |
| `sort` | string | `?sort=price` | Urutkan: `id`, `name`, `price`, `rating` |
| `order` | string | `?order=asc` | Arah urutan: `asc`, `desc` |
| `page` | number | `?page=1` | Halaman (default: 1) |
| `limit` | number | `?limit=10` | Jumlah per halaman (default: 10, max: 50) |

**Contoh Request:**
```
GET /api/products?search=razor&category=wireless&sort=price&order=asc&page=1&limit=2
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Razor Z90s",
      "brand": "Razor Audio",
      "price": 129.99,
      "image": "https://...",
      "category": "wireless",
      "rating": 4.8,
      "inStock": true
    }
  ],
  "meta": {
    "total": 4,
    "page": 1,
    "limit": 2,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### GET `/api/products/:id`
Ambil detail lengkap satu produk.

**Contoh Request:**
```
GET /api/products/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Razor Z90s",
    "brand": "Razor Audio",
    "tagline": "Over-Ear Wireless ANC Headphones with Spatial Sound",
    "price": 129.99,
    "image": "https://...",
    "variants": {
      "colorOrSize": [
        { "id": "matte-black", "label": "Matte Black", "price": 129.99, "image": "https://..." },
        { "id": "silver-aluminum", "label": "Silver Aluminum", "price": 159.99, "image": "https://..." },
        { "id": "matte-blue", "label": "Matte Blue", "price": 149.99, "image": "https://..." }
      ],
      "quantity": 50
    },
    "description": "Razor Z90s hadir dengan desain ergonomis...",
    "specs": {
      "driverSize": "40mm Neodymium",
      "frequencyResponse": "20Hz - 20kHz",
      "bluetoothVersion": "v5.3",
      "batteryLife": "Up to 50 Hours",
      "noiseCancellation": "Hybrid ANC",
      "weight": "250g"
    },
    "features": ["Fast Charging", "Multipoint Connection", "Spatial Audio", "Hybrid ANC"],
    "rating": 4.8,
    "inStock": true
  }
}
```

---

### GET `/api/products/:id/variants`
Ambil varian warna/ukuran dan stok produk.

**Contoh Request:**
```
GET /api/products/1/variants
```

---

### POST `/api/products`
Tambah produk baru.

**Headers:**
```
Content-Type: application/json
```

**Body (wajib: name, price, image, description):**
```json
{
  "name": "Razor Elite",
  "brand": "Razor Audio",
  "price": 299.99,
  "image": "https://...",
  "description": "Headphone flagship Razor Audio.",
  "category": "wireless",
  "variants": {
    "colorOrSize": [
      { "id": "platinum", "label": "Platinum Silver", "price": 299.99, "image": "https://..." }
    ],
    "quantity": 15
  },
  "specs": {
    "driverSize": "50mm Beryllium",
    "frequencyResponse": "5Hz - 40kHz",
    "bluetoothVersion": "v5.4",
    "batteryLife": "Up to 60 Hours",
    "noiseCancellation": "Hybrid ANC Pro+",
    "weight": "265g"
  },
  "features": ["Beryllium driver", "LDAC + aptX Lossless"],
  "inStock": true
}
```

**Response: `201 Created`**
```json
{
  "success": true,
  "message": "Produk berhasil ditambahkan.",
  "data": { "id": 5, "name": "Razor Elite", ... }
}
```

---

### PUT `/api/products/:id`
Update seluruh data produk (semua field wajib diisi).

**Contoh Request:**
```
PUT /api/products/1
Content-Type: application/json

{
  "name": "Razor Z90s (Updated)",
  "price": 139.99,
  "image": "https://...",
  "description": "Versi terbaru dengan baterai 55 jam."
}
```

---

### PATCH `/api/products/:id`
Update sebagian data produk (hanya field yang dikirim yang berubah).

**Contoh Request:**
```
PATCH /api/products/1
Content-Type: application/json

{
  "price": 119.99,
  "inStock": false
}
```

---

### DELETE `/api/products/:id`
Hapus produk berdasarkan ID.

**Contoh Request:**
```
DELETE /api/products/1
```

**Response:**
```json
{
  "success": true,
  "message": "Produk berhasil dihapus.",
  "data": { "id": 1, "name": "Razor Z90s" }
}
```

---

## Error Responses

| Status Code | Keterangan |
|---|---|
| `400 Bad Request` | Field wajib tidak lengkap atau format salah |
| `404 Not Found` | Produk atau endpoint tidak ditemukan |
| `500 Internal Server Error` | Error server |

**Contoh Error Response:**
```json
{
  "success": false,
  "message": "Product tidak ditemukan. ID: 99"
}
```

---

## Import ke Postman

1. Buka **Postman**
2. Klik **Import** (pojok kiri atas)
3. Pilih file `postman-collection.json`
4. Klik **Import**
5. Semua 13 request langsung tersedia

---

## Integrasi Frontend

File `api.js` di folder ini digunakan untuk mengintegrasikan API dengan halaman `index.html`.

Cara kerja:
1. Halaman dibuka → `api.js` fetch `GET /api/products/1`
2. Data diterima → field nama, harga, gambar, varian, spesifikasi, fitur diisi otomatis
3. Jika API offline → halaman tetap tampil dengan data lokal (fallback)

---

## Data Produk

| ID | Nama | Harga | Kategori |
|---|---|---|---|
| 1 | Razor Z90s | $129.99 | wireless |
| 2 | Razor X50 | $89.99 | wireless |
| 3 | Razor Pro S | $219.99 | wired |
| 4 | Razor Lite | $59.99 | wireless |

---

## Dibuat untuk

**Full Stack Web Development Bootcamp**
Exercise: *Practical Guidance — Modern Back-End Development with AI*

---

*Razor Audio &copy; 2026*
