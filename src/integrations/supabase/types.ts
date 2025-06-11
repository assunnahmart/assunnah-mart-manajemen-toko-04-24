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
      barang_konsinyasi: {
        Row: {
          barcode: string | null
          created_at: string | null
          harga_beli: number | null
          harga_jual: number | null
          id: string
          jenis_konsinyasi: string
          kategori_id: string | null
          kategori_pembelian: string | null
          nama: string
          satuan: string | null
          status: string | null
          stok_minimal: number | null
          stok_saat_ini: number | null
          supplier_id: string | null
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          created_at?: string | null
          harga_beli?: number | null
          harga_jual?: number | null
          id?: string
          jenis_konsinyasi: string
          kategori_id?: string | null
          kategori_pembelian?: string | null
          nama: string
          satuan?: string | null
          status?: string | null
          stok_minimal?: number | null
          stok_saat_ini?: number | null
          supplier_id?: string | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          created_at?: string | null
          harga_beli?: number | null
          harga_jual?: number | null
          id?: string
          jenis_konsinyasi?: string
          kategori_id?: string | null
          kategori_pembelian?: string | null
          nama?: string
          satuan?: string | null
          status?: string | null
          stok_minimal?: number | null
          stok_saat_ini?: number | null
          supplier_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "barang_konsinyasi_kategori_id_fkey"
            columns: ["kategori_id"]
            isOneToOne: false
            referencedRelation: "kategori_barang"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "barang_konsinyasi_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_barang_konsinyasi_supplier"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier"
            referencedColumns: ["id"]
          },
        ]
      }
      chart_of_accounts: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          jenis_akun: string
          kategori: string | null
          kode_akun: string
          nama_akun: string
          parent_id: string | null
          saldo_normal: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          jenis_akun: string
          kategori?: string | null
          kode_akun: string
          nama_akun: string
          parent_id?: string | null
          saldo_normal?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          jenis_akun?: string
          kategori?: string | null
          kode_akun?: string
          nama_akun?: string
          parent_id?: string | null
          saldo_normal?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      detail_transaksi_pembelian: {
        Row: {
          barang_id: string | null
          created_at: string | null
          harga_satuan: number
          id: string
          jumlah: number
          nama_barang: string
          subtotal: number
          transaksi_id: string | null
        }
        Insert: {
          barang_id?: string | null
          created_at?: string | null
          harga_satuan: number
          id?: string
          jumlah: number
          nama_barang: string
          subtotal: number
          transaksi_id?: string | null
        }
        Update: {
          barang_id?: string | null
          created_at?: string | null
          harga_satuan?: number
          id?: string
          jumlah?: number
          nama_barang?: string
          subtotal?: number
          transaksi_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "detail_transaksi_pembelian_barang_id_fkey"
            columns: ["barang_id"]
            isOneToOne: false
            referencedRelation: "barang_konsinyasi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detail_transaksi_pembelian_barang_id_fkey"
            columns: ["barang_id"]
            isOneToOne: false
            referencedRelation: "stock_opname_recap"
            referencedColumns: ["barang_id"]
          },
          {
            foreignKeyName: "detail_transaksi_pembelian_transaksi_id_fkey"
            columns: ["transaksi_id"]
            isOneToOne: false
            referencedRelation: "transaksi_pembelian"
            referencedColumns: ["id"]
          },
        ]
      }
      detail_transaksi_penjualan: {
        Row: {
          barang_id: string | null
          created_at: string | null
          harga_satuan: number
          id: string
          jumlah: number
          nama_barang: string
          subtotal: number
          transaksi_id: string | null
        }
        Insert: {
          barang_id?: string | null
          created_at?: string | null
          harga_satuan: number
          id?: string
          jumlah: number
          nama_barang: string
          subtotal: number
          transaksi_id?: string | null
        }
        Update: {
          barang_id?: string | null
          created_at?: string | null
          harga_satuan?: number
          id?: string
          jumlah?: number
          nama_barang?: string
          subtotal?: number
          transaksi_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "detail_transaksi_penjualan_barang_id_fkey"
            columns: ["barang_id"]
            isOneToOne: false
            referencedRelation: "barang_konsinyasi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detail_transaksi_penjualan_barang_id_fkey"
            columns: ["barang_id"]
            isOneToOne: false
            referencedRelation: "stock_opname_recap"
            referencedColumns: ["barang_id"]
          },
          {
            foreignKeyName: "detail_transaksi_penjualan_transaksi_id_fkey"
            columns: ["transaksi_id"]
            isOneToOne: false
            referencedRelation: "transaksi_penjualan"
            referencedColumns: ["id"]
          },
        ]
      }
      hutang_supplier: {
        Row: {
          created_at: string | null
          id: string
          jumlah_hutang: number
          sisa_hutang: number
          status: string | null
          supplier_id: string | null
          tanggal_jatuh_tempo: string | null
          transaksi_pembelian_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          jumlah_hutang: number
          sisa_hutang: number
          status?: string | null
          supplier_id?: string | null
          tanggal_jatuh_tempo?: string | null
          transaksi_pembelian_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          jumlah_hutang?: number
          sisa_hutang?: number
          status?: string | null
          supplier_id?: string | null
          tanggal_jatuh_tempo?: string | null
          transaksi_pembelian_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hutang_supplier_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hutang_supplier_transaksi_pembelian_id_fkey"
            columns: ["transaksi_pembelian_id"]
            isOneToOne: false
            referencedRelation: "transaksi_pembelian"
            referencedColumns: ["id"]
          },
        ]
      }
      jadwal_kasir: {
        Row: {
          created_at: string | null
          hari: string
          id: string
          jam_mulai: string
          jam_selesai: string
          kasir_id: string | null
          minggu_ke: number | null
          shift: string
          tahun: number | null
        }
        Insert: {
          created_at?: string | null
          hari: string
          id?: string
          jam_mulai: string
          jam_selesai: string
          kasir_id?: string | null
          minggu_ke?: number | null
          shift: string
          tahun?: number | null
        }
        Update: {
          created_at?: string | null
          hari?: string
          id?: string
          jam_mulai?: string
          jam_selesai?: string
          kasir_id?: string | null
          minggu_ke?: number | null
          shift?: string
          tahun?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jadwal_kasir_kasir_id_fkey"
            columns: ["kasir_id"]
            isOneToOne: false
            referencedRelation: "kasir"
            referencedColumns: ["id"]
          },
        ]
      }
      kas_umum_transactions: {
        Row: {
          akun_id: string | null
          created_at: string | null
          id: string
          jenis_transaksi: string
          jumlah: number
          kasir_name: string | null
          kasir_username: string | null
          keterangan: string | null
          referensi_id: string | null
          referensi_tipe: string | null
          tanggal_transaksi: string
          transaction_number: string
          updated_at: string | null
        }
        Insert: {
          akun_id?: string | null
          created_at?: string | null
          id?: string
          jenis_transaksi: string
          jumlah: number
          kasir_name?: string | null
          kasir_username?: string | null
          keterangan?: string | null
          referensi_id?: string | null
          referensi_tipe?: string | null
          tanggal_transaksi?: string
          transaction_number: string
          updated_at?: string | null
        }
        Update: {
          akun_id?: string | null
          created_at?: string | null
          id?: string
          jenis_transaksi?: string
          jumlah?: number
          kasir_name?: string | null
          kasir_username?: string | null
          keterangan?: string | null
          referensi_id?: string | null
          referensi_tipe?: string | null
          tanggal_transaksi?: string
          transaction_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kas_umum_transactions_akun_id_fkey"
            columns: ["akun_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      kasir: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          nama: string
          shift: string | null
          status: string | null
          telepon: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          nama: string
          shift?: string | null
          status?: string | null
          telepon?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          nama?: string
          shift?: string | null
          status?: string | null
          telepon?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      kasir_kas_transactions: {
        Row: {
          created_at: string | null
          id: string
          jenis_transaksi: string
          jumlah: number
          kas_umum_id: string | null
          kasir_id: string | null
          kasir_name: string | null
          kategori: string
          keterangan: string | null
          referensi_id: string | null
          referensi_tipe: string | null
          sync_to_kas_umum: boolean | null
          tanggal_transaksi: string
          transaction_number: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          jenis_transaksi: string
          jumlah: number
          kas_umum_id?: string | null
          kasir_id?: string | null
          kasir_name?: string | null
          kategori: string
          keterangan?: string | null
          referensi_id?: string | null
          referensi_tipe?: string | null
          sync_to_kas_umum?: boolean | null
          tanggal_transaksi?: string
          transaction_number: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          jenis_transaksi?: string
          jumlah?: number
          kas_umum_id?: string | null
          kasir_id?: string | null
          kasir_name?: string | null
          kategori?: string
          keterangan?: string | null
          referensi_id?: string | null
          referensi_tipe?: string | null
          sync_to_kas_umum?: boolean | null
          tanggal_transaksi?: string
          transaction_number?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      kategori_barang: {
        Row: {
          created_at: string | null
          deskripsi: string | null
          id: string
          nama: string
        }
        Insert: {
          created_at?: string | null
          deskripsi?: string | null
          id?: string
          nama: string
        }
        Update: {
          created_at?: string | null
          deskripsi?: string | null
          id?: string
          nama?: string
        }
        Relationships: []
      }
      konsinyasi_detail: {
        Row: {
          barang_id: string | null
          created_at: string | null
          harga_beli: number
          id: string
          jumlah_terjual: number
          laporan_id: string | null
          nama_barang: string
          total_nilai: number
        }
        Insert: {
          barang_id?: string | null
          created_at?: string | null
          harga_beli: number
          id?: string
          jumlah_terjual: number
          laporan_id?: string | null
          nama_barang: string
          total_nilai: number
        }
        Update: {
          barang_id?: string | null
          created_at?: string | null
          harga_beli?: number
          id?: string
          jumlah_terjual?: number
          laporan_id?: string | null
          nama_barang?: string
          total_nilai?: number
        }
        Relationships: [
          {
            foreignKeyName: "konsinyasi_detail_barang_id_fkey"
            columns: ["barang_id"]
            isOneToOne: false
            referencedRelation: "barang_konsinyasi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "konsinyasi_detail_barang_id_fkey"
            columns: ["barang_id"]
            isOneToOne: false
            referencedRelation: "stock_opname_recap"
            referencedColumns: ["barang_id"]
          },
          {
            foreignKeyName: "konsinyasi_detail_laporan_id_fkey"
            columns: ["laporan_id"]
            isOneToOne: false
            referencedRelation: "konsinyasi_laporan"
            referencedColumns: ["id"]
          },
        ]
      }
      konsinyasi_harian: {
        Row: {
          created_at: string | null
          harga_beli: number
          id: string
          jumlah_real_terjual: number
          jumlah_terjual_sistem: number
          jumlah_titipan: number
          kasir_id: string | null
          kasir_name: string | null
          keterangan: string | null
          product_id: string | null
          product_name: string
          selisih_stok: number
          sisa_stok: number
          status: string | null
          supplier_id: string | null
          supplier_name: string
          tanggal_konsinyasi: string
          total_pembayaran: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          harga_beli?: number
          id?: string
          jumlah_real_terjual?: number
          jumlah_terjual_sistem?: number
          jumlah_titipan?: number
          kasir_id?: string | null
          kasir_name?: string | null
          keterangan?: string | null
          product_id?: string | null
          product_name: string
          selisih_stok?: number
          sisa_stok?: number
          status?: string | null
          supplier_id?: string | null
          supplier_name: string
          tanggal_konsinyasi?: string
          total_pembayaran?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          harga_beli?: number
          id?: string
          jumlah_real_terjual?: number
          jumlah_terjual_sistem?: number
          jumlah_titipan?: number
          kasir_id?: string | null
          kasir_name?: string | null
          keterangan?: string | null
          product_id?: string | null
          product_name?: string
          selisih_stok?: number
          sisa_stok?: number
          status?: string | null
          supplier_id?: string | null
          supplier_name?: string
          tanggal_konsinyasi?: string
          total_pembayaran?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "konsinyasi_harian_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "barang_konsinyasi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "konsinyasi_harian_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_opname_recap"
            referencedColumns: ["barang_id"]
          },
          {
            foreignKeyName: "konsinyasi_harian_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier"
            referencedColumns: ["id"]
          },
        ]
      }
      konsinyasi_laporan: {
        Row: {
          created_at: string | null
          id: string
          periode_mulai: string
          periode_selesai: string
          status: string | null
          supplier_id: string | null
          total_komisi: number | null
          total_penjualan: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          periode_mulai: string
          periode_selesai: string
          status?: string | null
          supplier_id?: string | null
          total_komisi?: number | null
          total_penjualan?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          periode_mulai?: string
          periode_selesai?: string
          status?: string | null
          supplier_id?: string | null
          total_komisi?: number | null
          total_penjualan?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "konsinyasi_laporan_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier"
            referencedColumns: ["id"]
          },
        ]
      }
      mutasi_stok: {
        Row: {
          barang_id: string | null
          created_at: string | null
          id: string
          jenis_mutasi: string
          jumlah: number
          keterangan: string | null
          referensi_id: string | null
          referensi_tipe: string | null
          stok_sebelum: number
          stok_sesudah: number
        }
        Insert: {
          barang_id?: string | null
          created_at?: string | null
          id?: string
          jenis_mutasi: string
          jumlah: number
          keterangan?: string | null
          referensi_id?: string | null
          referensi_tipe?: string | null
          stok_sebelum: number
          stok_sesudah: number
        }
        Update: {
          barang_id?: string | null
          created_at?: string | null
          id?: string
          jenis_mutasi?: string
          jumlah?: number
          keterangan?: string | null
          referensi_id?: string | null
          referensi_tipe?: string | null
          stok_sebelum?: number
          stok_sesudah?: number
        }
        Relationships: [
          {
            foreignKeyName: "mutasi_stok_barang_id_fkey"
            columns: ["barang_id"]
            isOneToOne: false
            referencedRelation: "barang_konsinyasi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mutasi_stok_barang_id_fkey"
            columns: ["barang_id"]
            isOneToOne: false
            referencedRelation: "stock_opname_recap"
            referencedColumns: ["barang_id"]
          },
        ]
      }
      pelanggan: {
        Row: {
          alamat: string | null
          created_at: string | null
          id: string
          jabatan: string | null
          jenis_pembayaran: string | null
          limit_kredit: number | null
          nama: string
          nama_unit: string | null
          sisa_piutang: number | null
          status: string | null
          telepon: string | null
          total_tagihan: number | null
          updated_at: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string | null
          id?: string
          jabatan?: string | null
          jenis_pembayaran?: string | null
          limit_kredit?: number | null
          nama: string
          nama_unit?: string | null
          sisa_piutang?: number | null
          status?: string | null
          telepon?: string | null
          total_tagihan?: number | null
          updated_at?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string | null
          id?: string
          jabatan?: string | null
          jenis_pembayaran?: string | null
          limit_kredit?: number | null
          nama?: string
          nama_unit?: string | null
          sisa_piutang?: number | null
          status?: string | null
          telepon?: string | null
          total_tagihan?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pelanggan_perorangan: {
        Row: {
          alamat: string | null
          batas_potong_gaji: number | null
          created_at: string | null
          departemen: string | null
          gaji_pokok: number | null
          id: string
          jabatan: string | null
          nama: string
          nik: string | null
          sisa_piutang: number | null
          status: string | null
          telepon: string | null
          updated_at: string | null
        }
        Insert: {
          alamat?: string | null
          batas_potong_gaji?: number | null
          created_at?: string | null
          departemen?: string | null
          gaji_pokok?: number | null
          id?: string
          jabatan?: string | null
          nama: string
          nik?: string | null
          sisa_piutang?: number | null
          status?: string | null
          telepon?: string | null
          updated_at?: string | null
        }
        Update: {
          alamat?: string | null
          batas_potong_gaji?: number | null
          created_at?: string | null
          departemen?: string | null
          gaji_pokok?: number | null
          id?: string
          jabatan?: string | null
          nama?: string
          nik?: string | null
          sisa_piutang?: number | null
          status?: string | null
          telepon?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pelanggan_unit: {
        Row: {
          alamat: string | null
          created_at: string | null
          id: string
          jenis_pembayaran: string | null
          kontak_person: string | null
          limit_kredit: number | null
          nama_unit: string
          status: string | null
          telepon: string | null
          total_tagihan: number | null
          updated_at: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string | null
          id?: string
          jenis_pembayaran?: string | null
          kontak_person?: string | null
          limit_kredit?: number | null
          nama_unit: string
          status?: string | null
          telepon?: string | null
          total_tagihan?: number | null
          updated_at?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string | null
          id?: string
          jenis_pembayaran?: string | null
          kontak_person?: string | null
          limit_kredit?: number | null
          nama_unit?: string
          status?: string | null
          telepon?: string | null
          total_tagihan?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pos_transaction_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          product_name: string
          quantity: number
          subtotal: number
          transaction_id: string
          unit: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          product_name: string
          quantity: number
          subtotal: number
          transaction_id: string
          unit?: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          subtotal?: number
          transaction_id?: string
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "pos_transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "pos_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_transactions: {
        Row: {
          amount_paid: number
          change_amount: number
          created_at: string
          id: string
          items_count: number
          kasir_name: string
          kasir_username: string
          notes: string | null
          payment_method: string
          status: string
          total_amount: number
          transaction_number: string
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          change_amount?: number
          created_at?: string
          id?: string
          items_count?: number
          kasir_name: string
          kasir_username: string
          notes?: string | null
          payment_method?: string
          status?: string
          total_amount?: number
          transaction_number: string
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          change_amount?: number
          created_at?: string
          id?: string
          items_count?: number
          kasir_name?: string
          kasir_username?: string
          notes?: string | null
          payment_method?: string
          status?: string
          total_amount?: number
          transaction_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      produk_pembelian: {
        Row: {
          barcode: string | null
          created_at: string | null
          harga_beli: number | null
          harga_jual: number | null
          id: string
          kategori: string | null
          keterangan: string | null
          nama_produk: string
          satuan: string | null
          status: string | null
          stok_minimal: number | null
          stok_saat_ini: number | null
          supplier_id: string | null
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          created_at?: string | null
          harga_beli?: number | null
          harga_jual?: number | null
          id?: string
          kategori?: string | null
          keterangan?: string | null
          nama_produk: string
          satuan?: string | null
          status?: string | null
          stok_minimal?: number | null
          stok_saat_ini?: number | null
          supplier_id?: string | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          created_at?: string | null
          harga_beli?: number | null
          harga_jual?: number | null
          id?: string
          kategori?: string | null
          keterangan?: string | null
          nama_produk?: string
          satuan?: string | null
          status?: string | null
          stok_minimal?: number | null
          stok_saat_ini?: number | null
          supplier_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produk_pembelian_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier"
            referencedColumns: ["id"]
          },
        ]
      }
      stok_opname: {
        Row: {
          barang_id: string | null
          created_at: string | null
          id: string
          kasir_id: string | null
          keterangan: string | null
          selisih: number | null
          status: string | null
          stok_fisik: number
          stok_sistem: number
          tanggal_opname: string
        }
        Insert: {
          barang_id?: string | null
          created_at?: string | null
          id?: string
          kasir_id?: string | null
          keterangan?: string | null
          selisih?: number | null
          status?: string | null
          stok_fisik: number
          stok_sistem: number
          tanggal_opname: string
        }
        Update: {
          barang_id?: string | null
          created_at?: string | null
          id?: string
          kasir_id?: string | null
          keterangan?: string | null
          selisih?: number | null
          status?: string | null
          stok_fisik?: number
          stok_sistem?: number
          tanggal_opname?: string
        }
        Relationships: [
          {
            foreignKeyName: "stok_opname_barang_id_fkey"
            columns: ["barang_id"]
            isOneToOne: false
            referencedRelation: "barang_konsinyasi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stok_opname_barang_id_fkey"
            columns: ["barang_id"]
            isOneToOne: false
            referencedRelation: "stock_opname_recap"
            referencedColumns: ["barang_id"]
          },
          {
            foreignKeyName: "stok_opname_kasir_id_fkey"
            columns: ["kasir_id"]
            isOneToOne: false
            referencedRelation: "kasir"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier: {
        Row: {
          alamat: string | null
          created_at: string | null
          email: string | null
          id: string
          jenis: string | null
          nama: string
          telepon: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          jenis?: string | null
          nama: string
          telepon?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          jenis?: string | null
          nama?: string
          telepon?: string | null
        }
        Relationships: []
      }
      transaksi_pembelian: {
        Row: {
          catatan: string | null
          created_at: string | null
          diskon: number | null
          id: string
          jatuh_tempo: string | null
          jenis_pembayaran: string
          kasir_id: string | null
          nomor_transaksi: string
          pajak: number | null
          status: string | null
          subtotal: number
          supplier_id: string | null
          tanggal_pembelian: string
          total: number
          updated_at: string | null
        }
        Insert: {
          catatan?: string | null
          created_at?: string | null
          diskon?: number | null
          id?: string
          jatuh_tempo?: string | null
          jenis_pembayaran?: string
          kasir_id?: string | null
          nomor_transaksi: string
          pajak?: number | null
          status?: string | null
          subtotal?: number
          supplier_id?: string | null
          tanggal_pembelian?: string
          total: number
          updated_at?: string | null
        }
        Update: {
          catatan?: string | null
          created_at?: string | null
          diskon?: number | null
          id?: string
          jatuh_tempo?: string | null
          jenis_pembayaran?: string
          kasir_id?: string | null
          nomor_transaksi?: string
          pajak?: number | null
          status?: string | null
          subtotal?: number
          supplier_id?: string | null
          tanggal_pembelian?: string
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaksi_pembelian_kasir_id_fkey"
            columns: ["kasir_id"]
            isOneToOne: false
            referencedRelation: "kasir"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaksi_pembelian_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier"
            referencedColumns: ["id"]
          },
        ]
      }
      transaksi_penjualan: {
        Row: {
          bayar: number | null
          catatan: string | null
          created_at: string | null
          diskon: number | null
          id: string
          jenis_pembayaran: string
          kasir_id: string | null
          kembalian: number | null
          nomor_transaksi: string
          pajak: number | null
          pelanggan_perorangan_id: string | null
          pelanggan_unit_id: string | null
          status: string | null
          subtotal: number
          tanggal_transaksi: string | null
          total: number
        }
        Insert: {
          bayar?: number | null
          catatan?: string | null
          created_at?: string | null
          diskon?: number | null
          id?: string
          jenis_pembayaran: string
          kasir_id?: string | null
          kembalian?: number | null
          nomor_transaksi: string
          pajak?: number | null
          pelanggan_perorangan_id?: string | null
          pelanggan_unit_id?: string | null
          status?: string | null
          subtotal: number
          tanggal_transaksi?: string | null
          total: number
        }
        Update: {
          bayar?: number | null
          catatan?: string | null
          created_at?: string | null
          diskon?: number | null
          id?: string
          jenis_pembayaran?: string
          kasir_id?: string | null
          kembalian?: number | null
          nomor_transaksi?: string
          pajak?: number | null
          pelanggan_perorangan_id?: string | null
          pelanggan_unit_id?: string | null
          status?: string | null
          subtotal?: number
          tanggal_transaksi?: string | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "transaksi_penjualan_kasir_id_fkey"
            columns: ["kasir_id"]
            isOneToOne: false
            referencedRelation: "kasir"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaksi_penjualan_pelanggan_perorangan_id_fkey"
            columns: ["pelanggan_perorangan_id"]
            isOneToOne: false
            referencedRelation: "pelanggan_perorangan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaksi_penjualan_pelanggan_unit_id_fkey"
            columns: ["pelanggan_unit_id"]
            isOneToOne: false
            referencedRelation: "pelanggan_unit"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          is_active: boolean | null
          kasir_id: string | null
          role: string
          updated_at: string | null
          user_id: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          kasir_id?: string | null
          role: string
          updated_at?: string | null
          user_id?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          kasir_id?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_kasir_id_fkey"
            columns: ["kasir_id"]
            isOneToOne: false
            referencedRelation: "kasir"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      stock_opname_recap: {
        Row: {
          barang_id: string | null
          detail_input_pengguna: Json | null
          jumlah_pengguna_input: number | null
          nama_barang: string | null
          real_stok_total: number | null
          satuan: string | null
          selisih_stok: number | null
          stok_sistem: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_supplier_debt: {
        Args: {
          p_supplier_id: string
          p_transaksi_id: string
          p_jumlah: number
          p_jatuh_tempo: string
        }
        Returns: undefined
      }
      generate_barcode: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_kas_transaction_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_kasir_kas_transaction_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_pos_transaction_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_purchase_product_barcode: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_purchase_transaction_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_transaction_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_stock_opname_recap: {
        Args: { date_from?: string; date_to?: string }
        Returns: {
          barang_id: string
          nama_barang: string
          satuan: string
          stok_sistem: number
          real_stok_total: number
          jumlah_pengguna_input: number
          selisih_stok: number
          detail_input_pengguna: Json
          kategori_selisih: string
        }[]
      }
      increment_personal_debt: {
        Args: { person_id: string; amount: number }
        Returns: undefined
      }
      increment_unit_debt: {
        Args: { unit_id: string; amount: number }
        Returns: undefined
      }
      update_stok_barang: {
        Args: { barang_id: string; jumlah_keluar: number }
        Returns: undefined
      }
      update_stok_from_opname: {
        Args: {
          p_barang_id: string
          p_stok_fisik: number
          p_kasir_id: string
          p_keterangan?: string
        }
        Returns: undefined
      }
      update_stok_from_pembelian: {
        Args: { p_barang_id: string; p_jumlah: number; p_transaksi_id: string }
        Returns: undefined
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
