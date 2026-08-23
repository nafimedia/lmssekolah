# Data Guru dan Penugasan Kelas — MTsN 2 Cilacap

## Tujuan

Dokumen ini menerjemahkan data pada spreadsheet menjadi format Markdown yang mudah dipahami oleh AI Agent.

Data berisi:
- **NIP**: Nomor Induk Pegawai.
- **Nama**: Nama guru/pegawai.
- **Jabatan/Mapel**: Mata pelajaran atau bidang yang diampu.
- **Kelas**: Tingkat kelas yang diampu, yaitu 7 (VII), 8 (VIII), dan/atau 9 (IX).
- **Level Admin**: Peran/hak akses pengguna di sistem.

## Standar Penamaan Kelas

Untuk sistem LMS, tingkat kelas **wajib menggunakan angka Romawi**:

- `7` → `VII`
- `8` → `VIII`
- `9` → `IX`

Jangan menggunakan `7`, `8`, atau `9` sebagai nama tingkat kelas pada UI, database referensi, atau output AI jika yang dimaksud adalah tingkat kelas madrasah. Gunakan `VII`, `VIII`, dan `IX`.

Pada spreadsheet asli, sel berwarna hijau pada kolom kelas menandakan bahwa guru tersebut mengajar kelas tersebut.

- Hijau pada kolom **7 (VII)** → guru mengajar kelas VII.
- Hijau pada kolom **8 (VIII)** → guru mengajar kelas VIII.
- Hijau pada kolom **9 (IX)** → guru mengajar kelas IX.
- Tidak ada sel hijau pada kolom 7/8/9 → tidak ada penugasan kelas yang ditandai pada data sumber.
- Jika beberapa kolom hijau → guru mengajar beberapa tingkat sekaligus.

> **Penting untuk AI Agent:** Jangan menganggap semua guru dengan `Level Admin = Guru Pengampu` pasti mengajar semua kelas. Gunakan hanya kelas yang ditandai pada kolom kelas.

## Data Guru

| No | NIP | Nama | Jabatan/Mapel | Kelas | Level Admin |
|---:|---|---|---|---|---|
| 1 | `197905162006041020` | H. SOLIHUN, S.Pd., M.Si | Kepala Madrasah | VII, VIII, IX | Kamad |
| 2 | `196909081998032001` | Hj. NANGIMAH, S. | Bahasa Indonesia | VII | Guru Pengampu |
| 3 | `197002272005011001` | ACHMAD MAKMUN ROSID, S.Pd., M.Pd | Bahasa Inggris | VIII | Admin, Wali Kelas, Guru |
| 4 | `197004082007012025` | MAHMUDAH, S. | Akidah Akhlak | - | Guru Pengampu |
| 5 | `197109302007012011` | Hj. SITI MUHSINAH, S | Bahasa Arab | IX | Guru Pengampu |
| 6 | `197311232005011004` | H. DASIRUN, S.Ag., M.Pd.I | Sejarah Kebudayaan Islam | - | Guru Pengampu |
| 7 | `197311252007102001` | SRIYANI KUNTARI, S.Pd | Matematika | - | Guru Pengampu |
| 8 | `197312112007101021` | TEGUH WIYONO, S.Pd | Pendidikan Jasmani, Olahraga dan Kesehatan | - | Guru Pengampu |
| 9 | `197405022007101003` | MUHTAMAM, S.Ag., M.Pd.I | Fikih | VII, IX | Guru Pengampu |
| 10 | `197509192009012008` | UMI KHAFSOH, S.Pd | Ilmu Pendidikan Sosial | - | Guru Pengampu |
| 11 | `197602012007101019` | WAKHIBUN, S.P | Akidah Akhlak | VIII | Guru Pengampu |
| 12 | `197705132007101002` | SAYONO, S.Pd., M.Pd. | Matematika | IX | Guru Pengampu |
| 13 | `197710212007101001` | WAHYUDIN, S | Bahasa Arab | - | Guru Pengampu |
| 14 | `197804212009012004` | NAZIHATUN ZUHRIYAH, S.Pd. | Ilmu Pendidikan Sosial | VII | Guru Pengampu |
| 15 | `197806212007101002` | RIDHO ANSHORI, S.Pd., M.Pd | Bahasa Inggris | - | Guru Pengampu |
| 16 | `197807072007102001` | CARYATI, | Fikih | - | Guru Pengampu |
| 17 | `197906142007102002` | SOBIYATI, S.Pd | Bahasa Indonesia | VIII | Wali Kelas, Guru |
| 18 | `198002152007102002` | DAISAH, S.Pd | Bahasa Indonesia | IX | Guru Pengampu |
| 19 | `198007172005012001` | H. ANI YULIANI, S.Pd | Matematika | VIII | Guru Pengampu |
| 20 | `198102062007102003` | CETY MAHARSY, S.Pd | Bahasa Inggris | VII | Guru Pengampu |
| 21 | `198302142023211010` | ALI MANSUR, S.Pd | Ilmu Pendidikan Sosial | VIII | Waka Kurikulum |
| 22 | `198409142023211019` | ASROR HIDAYAT, S.Pd | Bimbingan dan Konseling | IX | Guru Pengampu |
| 23 | `199011022025212013` | NOVANTYA KARTIKAWATI, S.Pd | Ilmu Pendidikan Alam | IX | Wali Kelas, Guru |
| 24 | `199202022023211045` | HASIS SYARIFUDIN, S.Pd | Prakarya dan Seni Budaya | VII, VIII, IX | Guru Pengampu |
| 25 | `199204042025051002` | AH. SYARIF HIDAYAH, S.Pd.I | Al Qur'an Hadis | VIII, IX | Admin, Guru |
| 26 | `199204152023212049` | STEFI APRIONITA SETYO ARUM, S.Pd | Ilmu Pendidikan Alam | - | Guru Pengampu |
| 27 | `199301292025212006` | IFTI NURROHMAH, S.Pd | Matematika | - | Guru Pengampu |
| 28 | `199309192023211016` | MASRUKHAN, S.Pd | Pendidikan Jasmani, Olahraga dan Kesehatan | - | Guru Pengampu |
| 29 | `199405142019032021` | ENDAH SUPRIHATIN, S.Pd | Bahasa Arab | - | Guru Pengampu |
| 30 | `199508182023212044` | MAULIDIA NURUL IZATI, S.Pd | Bimbingan dan Konseling | VII | Wali Kelas, Guru |
| 31 | `199611202025211009` | ILHAM HABIBI, S.Pd | Ilmu Pendidikan Alam | - | Guru Pengampu |
| 32 | `199701112025211009` | MISBAH AHMAD DANI, S.Pd | Al Qur'an Hadis | VII | Guru Pengampu |
| 33 | `199711212025212010` | SASI VIVIANI, S.Pd | Bahasa Inggris | - | Guru Pengampu |
| 34 | `199711302025052006` | ANGGUN NOVTALIA BERLIAN, S.Pd | Pendidikan Kewarganegaraan | VII, VIII, IX | Guru Pengampu |
| 35 | `199712302024212037` | INDAH NURROHMAH, S.Pd | Bahasa Inggris | IX | Wali Kelas, Guru |
| 36 | `199804202025052007` | SARAH SAFIRA, S.Pd | Bimbingan dan Konseling | VIII | Guru Pengampu |
| 37 | `199810202025052006` | HIKMATUL ASTRI AZKIYA, S.Pd | Ilmu Pendidikan Alam | VIII | Guru Pengampu |
| 38 | `12345678` | RINDANG FARIHA IDANA, S.Pd | Bahasa Jawa | VII, VIII, IX | Wali Kelas, Guru |

## Ringkasan Penugasan Kelas

### Kelas VII
Guru yang memiliki penandaan kelas VII:

1. H. SOLIHUN — Kepala Madrasah
2. Hj. NANGIMAH — Bahasa Indonesia
3. ACHMAD MAKMUN ROSID — Bahasa Inggris
4. MUHTAMAM — Fikih
5. WAKHIBUN — Akidah Akhlak
6. NAZIHATUN ZUHRIYAH — Ilmu Pendidikan Sosial
7. SOBIYATI — Bahasa Indonesia
8. H. ANI YULIANI — Matematika
9. CETY MAHARSY — Bahasa Inggris
10. ALI MANSUR — Ilmu Pendidikan Sosial
11. HASIS SYARIFUDIN — Prakarya dan Seni Budaya
12. AH. SYARIF HIDAYAH — Al Qur'an Hadis
13. MAULIDIA NURUL IZATI — Bimbingan dan Konseling
14. MISBAH AHMAD DANI — Al Qur'an Hadis
15. ANGGUN NOVTALIA BERLIAN — Pendidikan Kewarganegaraan
16. SARAH SAFIRA — Bimbingan dan Konseling
17. HIKMATUL ASTRI AZKIYA — Ilmu Pendidikan Alam
18. RINDANG FARIHA IDANA — Bahasa Jawa

### Kelas VIII
Guru yang memiliki penandaan kelas VIII:

1. H. SOLIHUN — Kepala Madrasah
2. ACHMAD MAKMUN ROSID — Bahasa Inggris
3. WAKHIBUN — Akidah Akhlak
4. SOBIYATI — Bahasa Indonesia
5. H. ANI YULIANI — Matematika
6. ALI MANSUR — Ilmu Pendidikan Sosial
7. HASIS SYARIFUDIN — Prakarya dan Seni Budaya
8. AH. SYARIF HIDAYAH — Al Qur'an Hadis
9. ANGGUN NOVTALIA BERLIAN — Pendidikan Kewarganegaraan
10. SARAH SAFIRA — Bimbingan dan Konseling
11. HIKMATUL ASTRI AZKIYA — Ilmu Pendidikan Alam
12. RINDANG FARIHA IDANA — Bahasa Jawa

### Kelas IX
Guru yang memiliki penandaan kelas IX:

1. H. SOLIHUN — Kepala Madrasah
2. Hj. SITI MUHSINAH — Bahasa Arab
3. MUHTAMAM — Fikih
4. SAYONO — Matematika
5. DAISAH — Bahasa Indonesia
6. ASROR HIDAYAT — Bimbingan dan Konseling
7. NOVANTYA KARTIKAWATI — Ilmu Pendidikan Alam
8. HASIS SYARIFUDIN — Prakarya dan Seni Budaya
9. AH. SYARIF HIDAYAH — Al Qur'an Hadis
10. ANGGUN NOVTALIA BERLIAN — Pendidikan Kewarganegaraan
11. INDAH NURROHMAH — Bahasa Inggris
12. RINDANG FARIHA IDANA — Bahasa Jawa

## Ringkasan Berdasarkan Level Admin

### Kamad
- H. SOLIHUN, S.Pd., M.Si (Kepala Madrasah)

### Waka Kurikulum
- ALI MANSUR, S.Pd (Ilmu Pendidikan Sosial)

### Admin
- ACHMAD MAKMUN ROSID, S.Pd., M.Pd — Admin, Wali Kelas, Guru
- AH. SYARIF HIDAYAH, S.Pd.I — Admin, Guru

### Wali Kelas
- ACHMAD MAKMUN ROSID, S.Pd., M.Pd (Wali Kelas VIII B)
- SOBIYATI, S.Pd (Wali Kelas VIII A)
- NOVANTYA KARTIKAWATI, S.Pd (Wali Kelas IX A)
- MAULIDIA NURUL IZATI, S.Pd (Wali Kelas VII A)
- INDAH NURROHMAH, S.Pd (Wali Kelas IX B)
- RINDANG FARIHA IDANA, S.Pd (Wali Kelas VII B)

### Guru Pengampu
Guru dengan level `Guru Pengampu` adalah guru yang berperan sebagai pengampu mata pelajaran. Penugasan kelasnya tetap mengikuti kolom kelas pada data sumber dan tidak boleh diasumsikan otomatis mengajar semua tingkat.

## Data Ringkas dalam Format Machine-Friendly

```yaml
kelas:
  VII:
    - "197905162006041020"
    - "196909081998032001"
    - "197002272005011001"
    - "197405022007101003"
    - "197602012007101019"
    - "197804212009012004"
    - "197906142007102002"
    - "198007172005012001"
    - "198102062007102003"
    - "198302142023211010"
    - "199202022023211045"
    - "199204042025051002"
    - "199508182023212044"
    - "199701112025211009"
    - "199711302025052006"
    - "199804202025052007"
    - "199810202025052006"
    - "12345678"

  VIII:
    - "197905162006041020"
    - "197002272005011001"
    - "197602012007101019"
    - "197906142007102002"
    - "198007172005012001"
    - "198302142023211010"
    - "199202022023211045"
    - "199204042025051002"
    - "199711302025052006"
    - "199804202025052007"
    - "199810202025052006"
    - "12345678"

  IX:
    - "197905162006041020"
    - "197109302007012011"
    - "197405022007101003"
    - "197705132007101002"
    - "198002152007102002"
    - "198409142023211019"
    - "199011022025212013"
    - "199202022023211045"
    - "199204042025051002"
    - "199711302025052006"
    - "199712302024212037"
    - "12345678"
```

## Instruksi untuk AI Agent

Saat menggunakan dokumen ini sebagai referensi:

> Gunakan data guru berdasarkan NIP sebagai identifier. Interpretasikan sel hijau pada kolom kelas sebagai penugasan guru terhadap tingkat kelas tersebut. Jangan membuat penugasan kelas yang tidak ditandai. Jangan mengubah NIP atau nama secara otomatis.
