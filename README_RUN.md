# Cara Menjalankan Aplikasi

Masalah sebelumnya terjadi karena perintah backend (`uvicorn`) berjalan terus-menerus dan "memblokir" terminal, sehingga perintah frontend di bawahnya tidak pernah dieksekusi jika Anda paste semuanya sekaligus ke satu terminal.

## Solusi Saat Ini
**Saya sudah menjalankan server frontend untuk Anda di latar belakang.**
Silakan coba refresh browser Anda di: [http://localhost:3000](http://localhost:3000)
Seharusnya sekarang sudah bisa diakses.

## Panduan Menjalankan Sendiri (Masa Depan)
Jika Anda ingin menjalankan ulang aplikasi ini nanti, pastikan menggunakan **dua terminal terpisah**:

### Terminal 1 (Backend)
```bash
cd backend
py -m uvicorn main:app --reload
```
_(Biarkan terminal ini tetap terbuka dan berjalan)_

### Terminal 2 (Frontend)
Buka jendela terminal baru, lalu jalankan:
```bash
cd frontend
npm run dev
```

Dengan cara ini, backend dan frontend berjalan bersamaan.
