
import { OutstandingReceivablesTable } from './OutstandingReceivablesTable';

type Props = {
  summary: any[];
  summaryLoading: boolean;
  selectedCustomers: string[];
  onSelectAll: () => void;
  onSelectRow: (name: string) => void;
  onClickPay: (name: string, amount: number) => void;
  allSelected: boolean;
  onOpenMassPayment: () => void;
};

export function OutstandingSection(props: Props) {
  return (
    <OutstandingReceivablesTable 
      {...props}
    />
  );
}
