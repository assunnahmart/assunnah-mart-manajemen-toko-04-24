
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Filter } from 'lucide-react';

interface DashboardFilterProps {
  onPeriodChange: (period: string) => void;
  onCustomDateChange: (startDate: string, endDate: string) => void;
  selectedPeriod: string;
}

const DashboardFilter: React.FC<DashboardFilterProps> = ({
  onPeriodChange,
  onCustomDateChange,
  selectedPeriod
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleCustomFilter = () => {
    if (startDate && endDate) {
      onCustomDateChange(startDate, endDate);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Periode Laporan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Periode</label>
            <Select value={selectedPeriod} onValueChange={onPeriodChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hari Ini</SelectItem>
                <SelectItem value="7days">7 Hari Terakhir</SelectItem>
                <SelectItem value="30days">30 Hari Terakhir</SelectItem>
                <SelectItem value="thismonth">Bulan Ini</SelectItem>
                <SelectItem value="lastmonth">Bulan Lalu</SelectItem>
                <SelectItem value="custom">Pilih Tanggal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {selectedPeriod === 'custom' && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Tanggal Mulai</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tanggal Akhir</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <Button onClick={handleCustomFilter} className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Terapkan Filter
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardFilter;
