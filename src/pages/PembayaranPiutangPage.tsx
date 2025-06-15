
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

import { PaymentDialog } from './pembayaran-piutang/PaymentDialog';
import { MassPaymentDialog } from './pembayaran-piutang/MassPaymentDialog';

import { usePembayaranPiutangLogic } from './pembayaran-piutang/usePembayaranPiutangLogic';
import { PageHeader } from './pembayaran-piutang/PageHeader';
import { SummarySection } from './pembayaran-piutang/SummarySection';
import { OutstandingSection } from './pembayaran-piutang/OutstandingSection';
import { RecentPaymentsSection } from './pembayaran-piutang/RecentPaymentsSection';

const PembayaranPiutangPage = () => {
  const {
    state: {
      isPaymentDialogOpen, setIsPaymentDialogOpen, selectedCustomer, paymentForm, setPaymentForm,
      summary, summaryLoading, outstandingCustomers, selectedCustomers, setSelectedCustomers, allSelected,
      recentPayments, paymentsLoading, filterCustomer, setFilterCustomer, filterDate, setFilterDate,
      totalReceivables, totalCustomers, isProcessingMassPayment, setIsProcessingMassPayment,
      isMassPaymentDialogOpen, setIsMassPaymentDialogOpen, massPaymentForm, setMassPaymentForm,
    },
    handlers: {
      handleSelectCustomer,
      handleRecordPayment,
      handleSelectAll,
      handleSelectRow,
      handleMassPayment,
      handleRefresh,
    },
    recordPayment,
  } = usePembayaranPiutangLogic();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="p-6 space-y-6">
            <PageHeader onRefresh={handleRefresh} />

            <SummarySection
              totalReceivables={totalReceivables}
              totalCustomers={totalCustomers}
            />

            <OutstandingSection
              summary={summary || []}
              summaryLoading={summaryLoading}
              selectedCustomers={selectedCustomers}
              onSelectAll={handleSelectAll}
              onSelectRow={handleSelectRow}
              onClickPay={handleSelectCustomer}
              allSelected={allSelected}
              onOpenMassPayment={() => setIsMassPaymentDialogOpen(true)}
            />

            <RecentPaymentsSection
              payments={recentPayments || []}
              loading={paymentsLoading}
              filterCustomer={filterCustomer}
              setFilterCustomer={setFilterCustomer}
              filterDate={filterDate}
              setFilterDate={setFilterDate}
            />

            <PaymentDialog
              open={isPaymentDialogOpen}
              onOpenChange={setIsPaymentDialogOpen}
              selectedCustomer={selectedCustomer}
              paymentForm={paymentForm}
              setPaymentForm={setPaymentForm}
              onSave={handleRecordPayment}
              isPending={recordPayment.isPending}
            />

            <MassPaymentDialog
              open={isMassPaymentDialogOpen}
              onOpenChange={setIsMassPaymentDialogOpen}
              selectedCustomers={selectedCustomers}
              massPaymentForm={massPaymentForm}
              setMassPaymentForm={setMassPaymentForm}
              onSave={handleMassPayment}
              isProcessing={isProcessingMassPayment}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default PembayaranPiutangPage;
