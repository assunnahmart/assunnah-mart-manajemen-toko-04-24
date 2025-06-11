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
          created_at: string
          harga_beli: number
          harga_jual: number
          id: string
          kategori: string | null
          nama: string
          satuan: string
          status: string
          stok_minimal: number
          stok_saat_ini: number
          supplier: string | null
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          created_at?: string
          harga_beli?: number
          harga_jual?: number
          id?: string
          kategori?: string | null
          nama: string
          satuan?: string
          status?: string
          stok_minimal?: number
          stok_saat_ini?: number
          supplier?: string | null
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          created_at?: string
          harga_beli?: number
          harga_jual?: number
          id?: string
          kategori?: string | null
          nama?: string
          satuan?: string
          status?: string
          stok_minimal?: number
          stok_saat_ini?: number
          supplier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bills: {
        Row: {
          buku: number | null
          created_at: string
          ekstrakurikuler_bulanan: number | null
          eskul_agustus: number | null
          eskul_april: number | null
          eskul_desember: number | null
          eskul_februari: number | null
          eskul_januari: number | null
          eskul_juli: number | null
          eskul_juni: number | null
          eskul_maret: number | null
          eskul_mei: number | null
          eskul_november: number | null
          eskul_oktober: number | null
          eskul_september: number | null
          id: string
          kegiatan: number | null
          pmb: number | null
          spp_agustus: number | null
          spp_april: number | null
          spp_bulanan: number | null
          spp_desember: number | null
          spp_februari: number | null
          spp_januari: number | null
          spp_juli: number | null
          spp_juni: number | null
          spp_maret: number | null
          spp_mei: number | null
          spp_november: number | null
          spp_oktober: number | null
          spp_september: number | null
          student_id: string
          tagihan_lama: number | null
          updated_at: string
        }
        Insert: {
          buku?: number | null
          created_at?: string
          ekstrakurikuler_bulanan?: number | null
          eskul_agustus?: number | null
          eskul_april?: number | null
          eskul_desember?: number | null
          eskul_februari?: number | null
          eskul_januari?: number | null
          eskul_juli?: number | null
          eskul_juni?: number | null
          eskul_maret?: number | null
          eskul_mei?: number | null
          eskul_november?: number | null
          eskul_oktober?: number | null
          eskul_september?: number | null
          id?: string
          kegiatan?: number | null
          pmb?: number | null
          spp_agustus?: number | null
          spp_april?: number | null
          spp_bulanan?: number | null
          spp_desember?: number | null
          spp_februari?: number | null
          spp_januari?: number | null
          spp_juli?: number | null
          spp_juni?: number | null
          spp_maret?: number | null
          spp_mei?: number | null
          spp_november?: number | null
          spp_oktober?: number | null
          spp_september?: number | null
          student_id: string
          tagihan_lama?: number | null
          updated_at?: string
        }
        Update: {
          buku?: number | null
          created_at?: string
          ekstrakurikuler_bulanan?: number | null
          eskul_agustus?: number | null
          eskul_april?: number | null
          eskul_desember?: number | null
          eskul_februari?: number | null
          eskul_januari?: number | null
          eskul_juli?: number | null
          eskul_juni?: number | null
          eskul_maret?: number | null
          eskul_mei?: number | null
          eskul_november?: number | null
          eskul_oktober?: number | null
          eskul_september?: number | null
          id?: string
          kegiatan?: number | null
          pmb?: number | null
          spp_agustus?: number | null
          spp_april?: number | null
          spp_bulanan?: number | null
          spp_desember?: number | null
          spp_februari?: number | null
          spp_januari?: number | null
          spp_juli?: number | null
          spp_juni?: number | null
          spp_maret?: number | null
          spp_mei?: number | null
          spp_november?: number | null
          spp_oktober?: number | null
          spp_september?: number | null
          student_id?: string
          tagihan_lama?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      jenis_rekening: {
        Row: {
          created_at: string
          id: string
          jenis_tagihan: string | null
          kategori: string
          kode_rekening: string
          nama_rekening: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jenis_tagihan?: string | null
          kategori: string
          kode_rekening: string
          nama_rekening: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jenis_tagihan?: string | null
          kategori?: string
          kode_rekening?: string
          nama_rekening?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      jurnal_umum: {
        Row: {
          created_at: string
          debet: number
          id: string
          jenis_transaksi: string
          keterangan: string
          kode_akun: string
          kredit: number
          nama_akun: string
          referensi: string | null
          tanggal: string
          transaksi_id: string | null
        }
        Insert: {
          created_at?: string
          debet?: number
          id?: string
          jenis_transaksi: string
          keterangan: string
          kode_akun: string
          kredit?: number
          nama_akun: string
          referensi?: string | null
          tanggal: string
          transaksi_id?: string | null
        }
        Update: {
          created_at?: string
          debet?: number
          id?: string
          jenis_transaksi?: string
          keterangan?: string
          kode_akun?: string
          kredit?: number
          nama_akun?: string
          referensi?: string | null
          tanggal?: string
          transaksi_id?: string | null
        }
        Relationships: []
      }
      kas_pengeluaran: {
        Row: {
          bukti_pengeluaran_url: string | null
          created_at: string
          id: string
          jumlah: number
          kategori_pengeluaran: string
          keterangan: string | null
          metode_pembayaran: string
          tanggal: string
          updated_at: string
        }
        Insert: {
          bukti_pengeluaran_url?: string | null
          created_at?: string
          id?: string
          jumlah: number
          kategori_pengeluaran: string
          keterangan?: string | null
          metode_pembayaran?: string
          tanggal?: string
          updated_at?: string
        }
        Update: {
          bukti_pengeluaran_url?: string | null
          created_at?: string
          id?: string
          jumlah?: number
          kategori_pengeluaran?: string
          keterangan?: string | null
          metode_pembayaran?: string
          tanggal?: string
          updated_at?: string
        }
        Relationships: []
      }
      new_student_registrations: {
        Row: {
          alamat: string
          asal_sekolah: string
          bukti_transfer_url: string | null
          created_at: string
          id: string
          jenjang: string
          jumlah_bayar: number
          jumlah_transfer: number
          nama_ayah: string
          nama_ibu: string
          nama_siswa: string
          no_hp: string
          nomor_pendaftaran: string
          photo_siswa_url: string | null
          status_pendaftaran: string
          tanggal_lahir: string
          tempat_lahir: string
          updated_at: string
        }
        Insert: {
          alamat: string
          asal_sekolah: string
          bukti_transfer_url?: string | null
          created_at?: string
          id?: string
          jenjang?: string
          jumlah_bayar?: number
          jumlah_transfer?: number
          nama_ayah: string
          nama_ibu: string
          nama_siswa: string
          no_hp: string
          nomor_pendaftaran: string
          photo_siswa_url?: string | null
          status_pendaftaran?: string
          tanggal_lahir: string
          tempat_lahir: string
          updated_at?: string
        }
        Update: {
          alamat?: string
          asal_sekolah?: string
          bukti_transfer_url?: string | null
          created_at?: string
          id?: string
          jenjang?: string
          jumlah_bayar?: number
          jumlah_transfer?: number
          nama_ayah?: string
          nama_ibu?: string
          nama_siswa?: string
          no_hp?: string
          nomor_pendaftaran?: string
          photo_siswa_url?: string | null
          status_pendaftaran?: string
          tanggal_lahir?: string
          tempat_lahir?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          cara_bayar: string | null
          created_at: string
          id: string
          jenis_tagihan: string
          jumlah_dibayar: number
          kategori_penerimaan: string | null
          keterangan: string | null
          student_id: string
          tanggal_pembayaran: string
        }
        Insert: {
          cara_bayar?: string | null
          created_at?: string
          id?: string
          jenis_tagihan: string
          jumlah_dibayar: number
          kategori_penerimaan?: string | null
          keterangan?: string | null
          student_id: string
          tanggal_pembayaran?: string
        }
        Update: {
          cara_bayar?: string | null
          created_at?: string
          id?: string
          jenis_tagihan?: string
          jumlah_dibayar?: number
          kategori_penerimaan?: string | null
          keterangan?: string | null
          student_id?: string
          tanggal_pembayaran?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      pelanggan: {
        Row: {
          alamat: string | null
          created_at: string
          id: string
          jabatan: string | null
          jenis_pembayaran: string | null
          limit_kredit: number | null
          nama: string
          nama_unit: string | null
          phone: string | null
          sisa_piutang: number | null
          status: string
          total_tagihan: number | null
          updated_at: string
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          id?: string
          jabatan?: string | null
          jenis_pembayaran?: string | null
          limit_kredit?: number | null
          nama: string
          nama_unit?: string | null
          phone?: string | null
          sisa_piutang?: number | null
          status?: string
          total_tagihan?: number | null
          updated_at?: string
        }
        Update: {
          alamat?: string | null
          created_at?: string
          id?: string
          jabatan?: string | null
          jenis_pembayaran?: string | null
          limit_kredit?: number | null
          nama?: string
          nama_unit?: string | null
          phone?: string | null
          sisa_piutang?: number | null
          status?: string
          total_tagihan?: number | null
          updated_at?: string
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
          transaction_number: string | null
        }
        Insert: {
          amount_paid: number
          change_amount?: number
          created_at?: string
          id?: string
          items_count?: number
          kasir_name: string
          kasir_username: string
          notes?: string | null
          payment_method?: string
          status?: string
          total_amount: number
          transaction_number?: string | null
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
          transaction_number?: string | null
        }
        Relationships: []
      }
      registration_fees: {
        Row: {
          created_at: string
          id: string
          jenjang: string | null
          jumlah: number
          keterangan: string | null
          nama_biaya: string
          updated_at: string
          wajib: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          jenjang?: string | null
          jumlah?: number
          keterangan?: string | null
          nama_biaya: string
          updated_at?: string
          wajib?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          jenjang?: string | null
          jumlah?: number
          keterangan?: string | null
          nama_biaya?: string
          updated_at?: string
          wajib?: boolean
        }
        Relationships: []
      }
      rekap_penerimaan: {
        Row: {
          created_at: string
          id: string
          jenis_tagihan: string | null
          jenjang: string | null
          jumlah_transaksi: number
          kelas: string | null
          tanggal_mulai: string
          tanggal_selesai: string
          total_penerimaan: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jenis_tagihan?: string | null
          jenjang?: string | null
          jumlah_transaksi?: number
          kelas?: string | null
          tanggal_mulai: string
          tanggal_selesai: string
          total_penerimaan?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jenis_tagihan?: string | null
          jenjang?: string | null
          jumlah_transaksi?: number
          kelas?: string | null
          tanggal_mulai?: string
          tanggal_selesai?: string
          total_penerimaan?: number
          updated_at?: string
        }
        Relationships: []
      }
      spp_automation_log: {
        Row: {
          created_at: string
          execution_date: string
          id: string
          students_affected: number | null
          total_amount_added: number | null
        }
        Insert: {
          created_at?: string
          execution_date?: string
          id?: string
          students_affected?: number | null
          total_amount_added?: number | null
        }
        Update: {
          created_at?: string
          execution_date?: string
          id?: string
          students_affected?: number | null
          total_amount_added?: number | null
        }
        Relationships: []
      }
      spp_config: {
        Row: {
          biaya_per_bulan: number
          created_at: string
          id: string
          kelas: string
          updated_at: string
        }
        Insert: {
          biaya_per_bulan: number
          created_at?: string
          id?: string
          kelas: string
          updated_at?: string
        }
        Update: {
          biaya_per_bulan?: number
          created_at?: string
          id?: string
          kelas?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_registration_fees: {
        Row: {
          created_at: string
          id: string
          jumlah: number
          registration_fee_id: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jumlah?: number
          registration_fee_id: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jumlah?: number
          registration_fee_id?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_student_registration_fee"
            columns: ["registration_fee_id"]
            isOneToOne: false
            referencedRelation: "registration_fees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_student_registration_student"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          beban_ekstrakurikuler_perbulan: number | null
          beban_spp_perbulan: number | null
          created_at: string
          email: string | null
          id: string
          jenjang: string | null
          kelas: string
          nama: string
          nama_ekstrakurikuler: string | null
          nisn: string | null
          nomor_hp: string | null
          nomor_induk: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          beban_ekstrakurikuler_perbulan?: number | null
          beban_spp_perbulan?: number | null
          created_at?: string
          email?: string | null
          id?: string
          jenjang?: string | null
          kelas: string
          nama: string
          nama_ekstrakurikuler?: string | null
          nisn?: string | null
          nomor_hp?: string | null
          nomor_induk?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          beban_ekstrakurikuler_perbulan?: number | null
          beban_spp_perbulan?: number | null
          created_at?: string
          email?: string | null
          id?: string
          jenjang?: string | null
          kelas?: string
          nama?: string
          nama_ekstrakurikuler?: string | null
          nisn?: string | null
          nomor_hp?: string | null
          nomor_induk?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tagihan_auto_send: {
        Row: {
          created_at: string
          email_enabled: boolean
          id: string
          is_enabled: boolean
          last_sent_date: string | null
          updated_at: string
          whatsapp_enabled: boolean
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          is_enabled?: boolean
          last_sent_date?: string | null
          updated_at?: string
          whatsapp_enabled?: boolean
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          is_enabled?: boolean
          last_sent_date?: string | null
          updated_at?: string
          whatsapp_enabled?: boolean
        }
        Relationships: []
      }
      transaksi_admin: {
        Row: {
          cara_bayar: string
          created_at: string
          id: string
          jenis_rekening_id: string
          jumlah: number
          keterangan: string | null
          nama_penerima: string
          tanggal: string
          tipe_transaksi: string
          updated_at: string
        }
        Insert: {
          cara_bayar?: string
          created_at?: string
          id?: string
          jenis_rekening_id: string
          jumlah: number
          keterangan?: string | null
          nama_penerima: string
          tanggal?: string
          tipe_transaksi: string
          updated_at?: string
        }
        Update: {
          cara_bayar?: string
          created_at?: string
          id?: string
          jenis_rekening_id?: string
          jumlah?: number
          keterangan?: string | null
          nama_penerima?: string
          tanggal?: string
          tipe_transaksi?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaksi_admin_jenis_rekening_id_fkey"
            columns: ["jenis_rekening_id"]
            isOneToOne: false
            referencedRelation: "jenis_rekening"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_add_monthly_ekstrakurikuler: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      auto_add_monthly_spp: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      auto_add_monthly_spp_and_ekstrakurikuler: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      auto_add_monthly_spp_with_log: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_monthly_spp: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_pos_transaction_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_registration_number: {
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
      process_payment: {
        Args: {
          p_student_id: string
          p_jenis_tagihan: string
          p_jumlah_dibayar: number
          p_keterangan?: string
        }
        Returns: boolean
      }
      process_payment_with_reduction: {
        Args: {
          p_student_id: string
          p_jenis_tagihan: string
          p_jumlah_dibayar: number
          p_keterangan?: string
        }
        Returns: boolean
      }
      update_stok_barang: {
        Args: { barang_id: string; jumlah_keluar: number }
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
