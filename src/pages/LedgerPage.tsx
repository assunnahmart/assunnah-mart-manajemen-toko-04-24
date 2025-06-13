
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, FileText, TrendingUp } from 'lucide-react';
import CustomerReceivablesLedger from '@/components/ledgers/CustomerReceivablesLedger';
import SupplierPayablesLedger from '@/components/ledgers/SupplierPayablesLedger';

const LedgerPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Buku Besar Piutang & Hutang</h1>
          <p className="text-gray-600">Kelola piutang pelanggan dan hutang supplier secara terintegrasi</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Piutang</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">-</div>
            <p className="text-xs text-gray-500 mt-1">Dari semua pelanggan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hutang</CardTitle>
            <Building className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">-</div>
            <p className="text-xs text-gray-500 mt-1">Dari semua supplier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transaksi Hari Ini</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">-</div>
            <p className="text-xs text-gray-500 mt-1">Pembayaran & penjualan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Position</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">-</div>
            <p className="text-xs text-gray-500 mt-1">Piutang - Hutang</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="receivables" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="receivables" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Piutang Pelanggan
          </TabsTrigger>
          <TabsTrigger value="payables" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Hutang Supplier
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="receivables">
          <CustomerReceivablesLedger />
        </TabsContent>
        
        <TabsContent value="payables">
          <SupplierPayablesLedger />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LedgerPage;
