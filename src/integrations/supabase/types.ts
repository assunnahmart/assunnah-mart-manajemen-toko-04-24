export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          budget_allocated: number | null
          budget_used: number | null
          created_at: string
          created_by: string | null
          deskripsi: string | null
          evaluasi: string | null
          hasil_kegiatan: string | null
          id: string
          jenis_kegiatan: string
          jumlah_peserta_actual: number | null
          lokasi: string | null
          nama_kegiatan: string
          nomor_urut: string | null
          penanggung_jawab: string
          status: string
          tanggal_mulai: string
          tanggal_selesai: string | null
          target_peserta: number | null
          unit: string
          updated_at: string
        }
        Insert: {
          budget_allocated?: number | null
          budget_used?: number | null
          created_at?: string
          created_by?: string | null
          deskripsi?: string | null
          evaluasi?: string | null
          hasil_kegiatan?: string | null
          id?: string
          jenis_kegiatan: string
          jumlah_peserta_actual?: number | null
          lokasi?: string | null
          nama_kegiatan: string
          nomor_urut?: string | null
          penanggung_jawab: string
          status?: string
          tanggal_mulai: string
          tanggal_selesai?: string | null
          target_peserta?: number | null
          unit: string
          updated_at?: string
        }
        Update: {
          budget_allocated?: number | null
          budget_used?: number | null
          created_at?: string
          created_by?: string | null
          deskripsi?: string | null
          evaluasi?: string | null
          hasil_kegiatan?: string | null
          id?: string
          jenis_kegiatan?: string
          jumlah_peserta_actual?: number | null
          lokasi?: string | null
          nama_kegiatan?: string
          nomor_urut?: string | null
          penanggung_jawab?: string
          status?: string
          tanggal_mulai?: string
          tanggal_selesai?: string | null
          target_peserta?: number | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      bidang_summary: {
        Row: {
          bidang: string
          bulan: number
          created_at: string
          id: string
          performance_score: number | null
          tahun: number
          total_activities: number | null
          total_budget: number | null
          total_cash_flow: number | null
          total_employees: number | null
          total_realization: number | null
          total_students: number | null
          updated_at: string
        }
        Insert: {
          bidang: string
          bulan?: number
          created_at?: string
          id?: string
          performance_score?: number | null
          tahun?: number
          total_activities?: number | null
          total_budget?: number | null
          total_cash_flow?: number | null
          total_employees?: number | null
          total_realization?: number | null
          total_students?: number | null
          updated_at?: string
        }
        Update: {
          bidang?: string
          bulan?: number
          created_at?: string
          id?: string
          performance_score?: number | null
          tahun?: number
          total_activities?: number | null
          total_budget?: number | null
          total_cash_flow?: number | null
          total_employees?: number | null
          total_realization?: number | null
          total_students?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      bidang_units: {
        Row: {
          bidang: string
          created_at: string
          id: string
          unit: string
          updated_at: string
        }
        Insert: {
          bidang: string
          created_at?: string
          id?: string
          unit: string
          updated_at?: string
        }
        Update: {
          bidang?: string
          created_at?: string
          id?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      budget_categories: {
        Row: {
          created_at: string
          created_by: string | null
          deskripsi: string | null
          id: string
          is_active: boolean
          kode_kategori: string
          nama_kategori: string
          sub_kategori: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deskripsi?: string | null
          id?: string
          is_active?: boolean
          kode_kategori: string
          nama_kategori: string
          sub_kategori?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deskripsi?: string | null
          id?: string
          is_active?: boolean
          kode_kategori?: string
          nama_kategori?: string
          sub_kategori?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      budget_plans: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bidang: string | null
          budget_category_id: string | null
          created_at: string
          created_by: string | null
          id: string
          kategori: string
          keterangan: string | null
          nominal_rencana: number
          nomor_urut: string | null
          status: string
          sub_kategori: string | null
          tahun_anggaran: number
          unit: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bidang?: string | null
          budget_category_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kategori: string
          keterangan?: string | null
          nominal_rencana: number
          nomor_urut?: string | null
          status?: string
          sub_kategori?: string | null
          tahun_anggaran: number
          unit: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bidang?: string | null
          budget_category_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kategori?: string
          keterangan?: string | null
          nominal_rencana?: number
          nomor_urut?: string | null
          status?: string
          sub_kategori?: string | null
          tahun_anggaran?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_plans_budget_category_id_fkey"
            columns: ["budget_category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_realizations: {
        Row: {
          bidang: string | null
          budget_category_id: string | null
          budget_plan_id: string | null
          cash_flow_id: string | null
          created_at: string
          created_by: string | null
          id: string
          kategori: string
          keterangan: string | null
          nominal_realisasi: number
          nomor_urut: string | null
          persentase_realisasi: number | null
          selisih: number | null
          sub_kategori: string | null
          tahun_anggaran: number
          unit: string
          updated_at: string
        }
        Insert: {
          bidang?: string | null
          budget_category_id?: string | null
          budget_plan_id?: string | null
          cash_flow_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kategori: string
          keterangan?: string | null
          nominal_realisasi: number
          nomor_urut?: string | null
          persentase_realisasi?: number | null
          selisih?: number | null
          sub_kategori?: string | null
          tahun_anggaran: number
          unit: string
          updated_at?: string
        }
        Update: {
          bidang?: string | null
          budget_category_id?: string | null
          budget_plan_id?: string | null
          cash_flow_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kategori?: string
          keterangan?: string | null
          nominal_realisasi?: number
          nomor_urut?: string | null
          persentase_realisasi?: number | null
          selisih?: number | null
          sub_kategori?: string | null
          tahun_anggaran?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_realizations_budget_category_id_fkey"
            columns: ["budget_category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_realizations_budget_plan_id_fkey"
            columns: ["budget_plan_id"]
            isOneToOne: false
            referencedRelation: "budget_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_realizations_cash_flow_id_fkey"
            columns: ["cash_flow_id"]
            isOneToOne: false
            referencedRelation: "cash_flow"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_flow: {
        Row: {
          asset_details: Json | null
          bidang: string | null
          budget_plan_id: string | null
          budget_realization_id: string | null
          created_at: string
          created_by: string | null
          deskripsi: string
          id: string
          inventory_item_id: string | null
          is_asset_purchase: boolean | null
          jenis_transaksi: string
          kategori: string
          no_bukti: string | null
          nominal: number
          nomor_urut: string | null
          saldo_sebelum: number | null
          saldo_sesudah: number | null
          tanggal: string
          unit: string
          updated_at: string
        }
        Insert: {
          asset_details?: Json | null
          bidang?: string | null
          budget_plan_id?: string | null
          budget_realization_id?: string | null
          created_at?: string
          created_by?: string | null
          deskripsi: string
          id?: string
          inventory_item_id?: string | null
          is_asset_purchase?: boolean | null
          jenis_transaksi: string
          kategori: string
          no_bukti?: string | null
          nominal: number
          nomor_urut?: string | null
          saldo_sebelum?: number | null
          saldo_sesudah?: number | null
          tanggal: string
          unit: string
          updated_at?: string
        }
        Update: {
          asset_details?: Json | null
          bidang?: string | null
          budget_plan_id?: string | null
          budget_realization_id?: string | null
          created_at?: string
          created_by?: string | null
          deskripsi?: string
          id?: string
          inventory_item_id?: string | null
          is_asset_purchase?: boolean | null
          jenis_transaksi?: string
          kategori?: string
          no_bukti?: string | null
          nominal?: number
          nomor_urut?: string | null
          saldo_sebelum?: number | null
          saldo_sesudah?: number | null
          tanggal?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_flow_budget_plan_id_fkey"
            columns: ["budget_plan_id"]
            isOneToOne: false
            referencedRelation: "budget_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_flow_budget_realization_id_fkey"
            columns: ["budget_realization_id"]
            isOneToOne: false
            referencedRelation: "budget_realizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_flow_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      chart_of_accounts: {
        Row: {
          bidang: string | null
          created_at: string
          id: string
          is_active: boolean
          jenis_akun: string
          kategori_akun: string
          kode_akun: string
          nama_akun: string
          sub_kategori: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          bidang?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          jenis_akun: string
          kategori_akun: string
          kode_akun: string
          nama_akun: string
          sub_kategori?: string | null
          unit: string
          updated_at?: string
        }
        Update: {
          bidang?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          jenis_akun?: string
          kategori_akun?: string
          kode_akun?: string
          nama_akun?: string
          sub_kategori?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      employee_attendance: {
        Row: {
          created_at: string
          employee_id: string
          foto_keluar: string | null
          foto_masuk: string | null
          id: string
          jam_keluar: string | null
          jam_masuk: string | null
          keterangan: string | null
          lokasi_keluar: string | null
          lokasi_masuk: string | null
          status: string
          tanggal: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          foto_keluar?: string | null
          foto_masuk?: string | null
          id?: string
          jam_keluar?: string | null
          jam_masuk?: string | null
          keterangan?: string | null
          lokasi_keluar?: string | null
          lokasi_masuk?: string | null
          status?: string
          tanggal: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          foto_keluar?: string | null
          foto_masuk?: string | null
          id?: string
          jam_keluar?: string | null
          jam_masuk?: string | null
          keterangan?: string | null
          lokasi_keluar?: string | null
          lokasi_masuk?: string | null
          status?: string
          tanggal?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_attendance_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_contracts: {
        Row: {
          created_at: string
          employee_id: string
          fasilitas: Json | null
          file_kontrak: string | null
          gaji_pokok: number
          id: string
          jenis_kontrak: string
          nomor_kontrak: string | null
          status: string
          tanggal_berakhir: string | null
          tanggal_mulai: string
          tunjangan: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          fasilitas?: Json | null
          file_kontrak?: string | null
          gaji_pokok: number
          id?: string
          jenis_kontrak: string
          nomor_kontrak?: string | null
          status?: string
          tanggal_berakhir?: string | null
          tanggal_mulai: string
          tunjangan?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          fasilitas?: Json | null
          file_kontrak?: string | null
          gaji_pokok?: number
          id?: string
          jenis_kontrak?: string
          nomor_kontrak?: string | null
          status?: string
          tanggal_berakhir?: string | null
          tanggal_mulai?: string
          tunjangan?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_contracts_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_evaluations: {
        Row: {
          aspek_penilaian: Json
          catatan: string | null
          created_at: string
          employee_id: string
          grade: string | null
          id: string
          penilai: string
          periode_akhir: string
          periode_awal: string
          rekomendasi: string | null
          status: string
          total_skor: number | null
          updated_at: string
        }
        Insert: {
          aspek_penilaian: Json
          catatan?: string | null
          created_at?: string
          employee_id: string
          grade?: string | null
          id?: string
          penilai: string
          periode_akhir: string
          periode_awal: string
          rekomendasi?: string | null
          status?: string
          total_skor?: number | null
          updated_at?: string
        }
        Update: {
          aspek_penilaian?: Json
          catatan?: string | null
          created_at?: string
          employee_id?: string
          grade?: string | null
          id?: string
          penilai?: string
          periode_akhir?: string
          periode_awal?: string
          rekomendasi?: string | null
          status?: string
          total_skor?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_evaluations_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_leaves: {
        Row: {
          alasan: string
          approved_at: string | null
          approved_by: string | null
          catatan_approval: string | null
          created_at: string
          employee_id: string
          id: string
          jenis_cuti: string
          jumlah_hari: number
          status: string
          tanggal_mulai: string
          tanggal_selesai: string
          updated_at: string
        }
        Insert: {
          alasan: string
          approved_at?: string | null
          approved_by?: string | null
          catatan_approval?: string | null
          created_at?: string
          employee_id: string
          id?: string
          jenis_cuti: string
          jumlah_hari: number
          status?: string
          tanggal_mulai: string
          tanggal_selesai: string
          updated_at?: string
        }
        Update: {
          alasan?: string
          approved_at?: string | null
          approved_by?: string | null
          catatan_approval?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          jenis_cuti?: string
          jumlah_hari?: number
          status?: string
          tanggal_mulai?: string
          tanggal_selesai?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_leaves_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_mutations: {
        Row: {
          alasan: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          employee_id: string
          gaji_baru: number | null
          gaji_lama: number | null
          id: string
          jabatan_baru: string | null
          jabatan_lama: string | null
          jenis_mutasi: string
          sk_nomor: string | null
          status: string
          tanggal_efektif: string
          unit_baru: string | null
          unit_lama: string | null
          updated_at: string
        }
        Insert: {
          alasan: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id: string
          gaji_baru?: number | null
          gaji_lama?: number | null
          id?: string
          jabatan_baru?: string | null
          jabatan_lama?: string | null
          jenis_mutasi: string
          sk_nomor?: string | null
          status?: string
          tanggal_efektif: string
          unit_baru?: string | null
          unit_lama?: string | null
          updated_at?: string
        }
        Update: {
          alasan?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id?: string
          gaji_baru?: number | null
          gaji_lama?: number | null
          id?: string
          jabatan_baru?: string | null
          jabatan_lama?: string | null
          jenis_mutasi?: string
          sk_nomor?: string | null
          status?: string
          tanggal_efektif?: string
          unit_baru?: string | null
          unit_lama?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_mutations_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_trainings: {
        Row: {
          biaya: number | null
          created_at: string
          employee_id: string
          hasil_evaluasi: string | null
          id: string
          jenis_pelatihan: string
          lokasi: string | null
          nama_pelatihan: string
          penyelenggara: string
          sertifikat: boolean | null
          status: string
          tanggal_mulai: string
          tanggal_selesai: string
          updated_at: string
        }
        Insert: {
          biaya?: number | null
          created_at?: string
          employee_id: string
          hasil_evaluasi?: string | null
          id?: string
          jenis_pelatihan: string
          lokasi?: string | null
          nama_pelatihan: string
          penyelenggara: string
          sertifikat?: boolean | null
          status?: string
          tanggal_mulai: string
          tanggal_selesai: string
          updated_at?: string
        }
        Update: {
          biaya?: number | null
          created_at?: string
          employee_id?: string
          hasil_evaluasi?: string | null
          id?: string
          jenis_pelatihan?: string
          lokasi?: string | null
          nama_pelatihan?: string
          penyelenggara?: string
          sertifikat?: boolean | null
          status?: string
          tanggal_mulai?: string
          tanggal_selesai?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_trainings_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          alamat: string
          created_at: string
          email: string | null
          gaji_pokok: number | null
          id: string
          jabatan: string
          jenis_kelamin: string
          nama_lengkap: string
          nik: string
          nip: string | null
          no_telepon: string | null
          nomor_urut: string | null
          pendidikan_terakhir: string
          pin_presensi: string | null
          status: string
          status_kepegawaian: string
          tanggal_lahir: string
          tanggal_masuk: string
          tempat_lahir: string
          unit: string
          updated_at: string
        }
        Insert: {
          alamat: string
          created_at?: string
          email?: string | null
          gaji_pokok?: number | null
          id?: string
          jabatan: string
          jenis_kelamin: string
          nama_lengkap: string
          nik: string
          nip?: string | null
          no_telepon?: string | null
          nomor_urut?: string | null
          pendidikan_terakhir: string
          pin_presensi?: string | null
          status?: string
          status_kepegawaian: string
          tanggal_lahir: string
          tanggal_masuk: string
          tempat_lahir: string
          unit: string
          updated_at?: string
        }
        Update: {
          alamat?: string
          created_at?: string
          email?: string | null
          gaji_pokok?: number | null
          id?: string
          jabatan?: string
          jenis_kelamin?: string
          nama_lengkap?: string
          nik?: string
          nip?: string | null
          no_telepon?: string | null
          nomor_urut?: string | null
          pendidikan_terakhir?: string
          pin_presensi?: string | null
          status?: string
          status_kepegawaian?: string
          tanggal_lahir?: string
          tanggal_masuk?: string
          tempat_lahir?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      finance_records: {
        Row: {
          created_at: string
          created_by: string | null
          deskripsi: string
          id: string
          jenis_transaksi: string
          jumlah: number
          kategori: string
          keterangan: string | null
          no_bukti: string | null
          tanggal_transaksi: string
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deskripsi: string
          id?: string
          jenis_transaksi: string
          jumlah: number
          kategori: string
          keterangan?: string | null
          no_bukti?: string | null
          tanggal_transaksi: string
          unit: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deskripsi?: string
          id?: string
          jenis_transaksi?: string
          jumlah?: number
          kategori?: string
          keterangan?: string | null
          no_bukti?: string | null
          tanggal_transaksi?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      integrated_budget_planning: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bidang: string | null
          created_at: string
          created_by: string | null
          id: string
          kas_keluar: number | null
          kas_masuk: number | null
          kategori: string
          keterangan: string | null
          nominal_realisasi: number | null
          nominal_rencana: number
          persentase_realisasi: number | null
          saldo_kas: number | null
          status: string
          sub_kategori: string | null
          tahun_anggaran: number
          tanggal_realisasi: string | null
          tanggal_rencana: string
          unit: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bidang?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kas_keluar?: number | null
          kas_masuk?: number | null
          kategori: string
          keterangan?: string | null
          nominal_realisasi?: number | null
          nominal_rencana?: number
          persentase_realisasi?: number | null
          saldo_kas?: number | null
          status?: string
          sub_kategori?: string | null
          tahun_anggaran?: number
          tanggal_realisasi?: string | null
          tanggal_rencana?: string
          unit: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bidang?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          kas_keluar?: number | null
          kas_masuk?: number | null
          kategori?: string
          keterangan?: string | null
          nominal_realisasi?: number | null
          nominal_rencana?: number
          persentase_realisasi?: number | null
          saldo_kas?: number | null
          status?: string
          sub_kategori?: string | null
          tahun_anggaran?: number
          tanggal_realisasi?: string | null
          tanggal_rencana?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          barcode_data: string | null
          bidang: string | null
          cash_flow_id: string | null
          created_at: string
          harga_perolehan: number | null
          id: string
          jumlah: number
          kategori: string
          keterangan: string | null
          kode_barang: string
          kondisi: string
          lokasi: string
          nama_barang: string
          tanggal_perolehan: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          barcode_data?: string | null
          bidang?: string | null
          cash_flow_id?: string | null
          created_at?: string
          harga_perolehan?: number | null
          id?: string
          jumlah?: number
          kategori: string
          keterangan?: string | null
          kode_barang: string
          kondisi: string
          lokasi: string
          nama_barang: string
          tanggal_perolehan?: string | null
          unit: string
          updated_at?: string
        }
        Update: {
          barcode_data?: string | null
          bidang?: string | null
          cash_flow_id?: string | null
          created_at?: string
          harga_perolehan?: number | null
          id?: string
          jumlah?: number
          kategori?: string
          keterangan?: string | null
          kode_barang?: string
          kondisi?: string
          lokasi?: string
          nama_barang?: string
          tanggal_perolehan?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_cash_flow_id_fkey"
            columns: ["cash_flow_id"]
            isOneToOne: false
            referencedRelation: "cash_flow"
            referencedColumns: ["id"]
          },
        ]
      }
      message_logs: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          message_content: string
          phone_numbers: string
          status: string
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          message_content: string
          phone_numbers: string
          status?: string
          unit: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          message_content?: string
          phone_numbers?: string
          status?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          message_content: string
          nomor_urut: string | null
          template_name: string
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          message_content: string
          nomor_urut?: string | null
          template_name: string
          unit: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          message_content?: string
          nomor_urut?: string | null
          template_name?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          budget: number | null
          created_at: string
          deskripsi: string | null
          id: string
          jenis_program: string
          jumlah_peserta: number | null
          nama_program: string
          penanggung_jawab: string
          status: string
          tanggal_mulai: string
          tanggal_selesai: string | null
          target_peserta: number | null
          unit: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          deskripsi?: string | null
          id?: string
          jenis_program: string
          jumlah_peserta?: number | null
          nama_program: string
          penanggung_jawab: string
          status?: string
          tanggal_mulai: string
          tanggal_selesai?: string | null
          target_peserta?: number | null
          unit: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          deskripsi?: string | null
          id?: string
          jenis_program?: string
          jumlah_peserta?: number | null
          nama_program?: string
          penanggung_jawab?: string
          status?: string
          tanggal_mulai?: string
          tanggal_selesai?: string | null
          target_peserta?: number | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          data_laporan: Json | null
          file_path: string | null
          id: string
          jenis_laporan: string
          judul_laporan: string
          nomor_urut: string | null
          periode_akhir: string
          periode_awal: string
          ringkasan: string | null
          status: string
          submitted_at: string | null
          submitted_by: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          data_laporan?: Json | null
          file_path?: string | null
          id?: string
          jenis_laporan: string
          judul_laporan: string
          nomor_urut?: string | null
          periode_akhir: string
          periode_awal: string
          ringkasan?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          unit: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          data_laporan?: Json | null
          file_path?: string | null
          id?: string
          jenis_laporan?: string
          judul_laporan?: string
          nomor_urut?: string | null
          periode_akhir?: string
          periode_awal?: string
          ringkasan?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      sales_records: {
        Row: {
          cara_pembayaran: string | null
          created_at: string
          harga_satuan: number
          id: string
          jumlah_terjual: number
          kategori_produk: string
          nama_produk: string
          pelanggan: string | null
          status: string
          tanggal_penjualan: string
          total_penjualan: number
          unit: string
          updated_at: string
        }
        Insert: {
          cara_pembayaran?: string | null
          created_at?: string
          harga_satuan: number
          id?: string
          jumlah_terjual: number
          kategori_produk: string
          nama_produk: string
          pelanggan?: string | null
          status?: string
          tanggal_penjualan: string
          total_penjualan: number
          unit: string
          updated_at?: string
        }
        Update: {
          cara_pembayaran?: string | null
          created_at?: string
          harga_satuan?: number
          id?: string
          jumlah_terjual?: number
          kategori_produk?: string
          nama_produk?: string
          pelanggan?: string | null
          status?: string
          tanggal_penjualan?: string
          total_penjualan?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          alamat: string
          created_at: string
          id: string
          jenis_kelamin: string
          kelas: string | null
          nama_ayah: string
          nama_ibu: string
          nama_lengkap: string
          nis: string | null
          nisn: string | null
          no_telepon: string | null
          nomor_urut: string | null
          pekerjaan_ayah: string | null
          pekerjaan_ibu: string | null
          status: string
          tahun_masuk: number
          tanggal_lahir: string
          tempat_lahir: string
          unit: string
          updated_at: string
        }
        Insert: {
          alamat: string
          created_at?: string
          id?: string
          jenis_kelamin: string
          kelas?: string | null
          nama_ayah: string
          nama_ibu: string
          nama_lengkap: string
          nis?: string | null
          nisn?: string | null
          no_telepon?: string | null
          nomor_urut?: string | null
          pekerjaan_ayah?: string | null
          pekerjaan_ibu?: string | null
          status?: string
          tahun_masuk: number
          tanggal_lahir: string
          tempat_lahir: string
          unit: string
          updated_at?: string
        }
        Update: {
          alamat?: string
          created_at?: string
          id?: string
          jenis_kelamin?: string
          kelas?: string | null
          nama_ayah?: string
          nama_ibu?: string
          nama_lengkap?: string
          nis?: string | null
          nisn?: string | null
          no_telepon?: string | null
          nomor_urut?: string | null
          pekerjaan_ayah?: string | null
          pekerjaan_ibu?: string | null
          status?: string
          tahun_masuk?: number
          tanggal_lahir?: string
          tempat_lahir?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_bidang_summary: {
        Args: {
          bidang_name: string
          tahun_param?: number
          bulan_param?: number
        }
        Returns: undefined
      }
      generate_item_code: {
        Args: { kategori_param: string }
        Returns: string
      }
      generate_transaction_number: {
        Args: { table_name: string; prefix?: string }
        Returns: string
      }
      generate_unique_pin: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
