
import { CustomerReceivablesSummary } from './CustomerReceivablesSummary';

type Props = {
  totalReceivables: number;
  totalCustomers: number;
};

export function SummarySection({ totalReceivables, totalCustomers }: Props) {
  return (
    <CustomerReceivablesSummary
      totalReceivables={totalReceivables}
      totalCustomers={totalCustomers}
    />
  );
}
