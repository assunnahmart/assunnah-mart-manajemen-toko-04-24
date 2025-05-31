
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type PelangganUnit = Tables<'pelanggan_unit'>;
type PelangganPerorangan = Tables<'pelanggan_perorangan'>;
type PelangganUnitInsert = TablesInsert<'pelanggan_unit'>;
type PelangganPeroranganInsert = TablesInsert<'pelanggan_perorangan'>;

export const usePelangganUnit = () => {
  return useQuery({
    queryKey: ['pelanggan_unit'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pelanggan_unit')
        .select('*')
        .order('nama_unit');
      
      if (error) throw error;
      return data as PelangganUnit[];
    },
  });
};

export const usePelangganPerorangan = () => {
  return useQuery({
    queryKey: ['pelanggan_perorangan'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pelanggan_perorangan')
        .select('*')
        .order('nama');
      
      if (error) throw error;
      return data as PelangganPerorangan[];
    },
  });
};

export const usePelangganKredit = () => {
  return useQuery({
    queryKey: ['pelanggan_kredit'],
    queryFn: async () => {
      const [unitResult, peroranganResult] = await Promise.all([
        supabase
          .from('pelanggan_unit')
          .select('*')
          .gt('total_tagihan', 0)
          .order('total_tagihan', { ascending: false }),
        supabase
          .from('pelanggan_perorangan')
          .select('*')
          .gt('sisa_piutang', 0)
          .order('sisa_piutang', { ascending: false })
      ]);
      
      if (unitResult.error) throw unitResult.error;
      if (peroranganResult.error) throw peroranganResult.error;
      
      return {
        unit: unitResult.data as PelangganUnit[],
        perorangan: peroranganResult.data as PelangganPerorangan[]
      };
    },
  });
};

export const useCreatePelangganUnit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (pelanggan: PelangganUnitInsert) => {
      const { data, error } = await supabase
        .from('pelanggan_unit')
        .insert(pelanggan)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pelanggan_unit'] });
      queryClient.invalidateQueries({ queryKey: ['pelanggan_kredit'] });
    },
  });
};

export const useCreatePelangganPerorangan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (pelanggan: PelangganPeroranganInsert) => {
      const { data, error } = await supabase
        .from('pelanggan_perorangan')
        .insert(pelanggan)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pelanggan_perorangan'] });
      queryClient.invalidateQueries({ queryKey: ['pelanggan_kredit'] });
    },
  });
};
