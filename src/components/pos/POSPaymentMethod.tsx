
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Banknote, Receipt } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface POSPaymentMethodProps {
  selectedMethod: string;
  onMethodSelect: (methodId: string) => void;
}

const POSPaymentMethod = ({ selectedMethod, onMethodSelect }: POSPaymentMethodProps) => {
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'cash',
      name: 'Tunai',
      icon: <Banknote className="h-4 w-4" />
    },
    {
      id: 'credit',
      name: 'Kredit',
      icon: <Receipt className="h-4 w-4" />
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Cara Bayar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {paymentMethods.map((method) => (
            <Button
              key={method.id}
              variant={selectedMethod === method.id ? "default" : "outline"}
              className="flex flex-col items-center gap-1 h-auto py-3"
              onClick={() => onMethodSelect(method.id)}
            >
              {method.icon}
              <span className="text-xs">{method.name}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default POSPaymentMethod;
