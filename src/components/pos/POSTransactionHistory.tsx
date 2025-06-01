
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import POSCashierTransactionHistory from './POSCashierTransactionHistory';

const POSTransactionHistory = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Riwayat Transaksi Kasir
        </CardTitle>
      </CardHeader>
      <CardContent>
        <POSCashierTransactionHistory />
      </CardContent>
    </Card>
  );
};

export default POSTransactionHistory;
