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
            foreignKeyName: "detail_transaksi_penjualan_transaksi_id_fkey"
            columns: ["transaksi_id"]
            isOneToOne: false
            referencedRelation: "transaksi_penjualan"
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
        ]
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
      [_ in never]: never
    }
    Functions: {
      generate_pos_transaction_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_transaction_number: {
        Args: Record<PropertyKey, never>
        Returns: string
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
