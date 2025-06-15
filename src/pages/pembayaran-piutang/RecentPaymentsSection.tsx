
import { RecentPaymentsTable } from './RecentPaymentsTable';

type Props = {
  payments: any[];
  loading: boolean;
  filterCustomer: string;
  setFilterCustomer: (s: string) => void;
  filterDate: string;
  setFilterDate: (s: string) => void;
};

export function RecentPaymentsSection(props: Props) {
  return (
    <RecentPaymentsTable {...props} />
  );
}
