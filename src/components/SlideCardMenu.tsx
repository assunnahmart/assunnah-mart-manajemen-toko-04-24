
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, TrendingUp, Calculator, Package, Store, ShoppingCart, CreditCard, Settings, Users, LogOut, Scan, History, ClipboardList, Wallet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SlideCardMenuProps {
  onQuickScan?: () => void;
  onTransactionHistory?: () => void;
  onKonsinyasi?: () => void;
  onStockOpname?: () => void;
  onKasirKas?: () => void;
  onDailyReport?: () => void;
}

const SlideCardMenu = ({
  onQuickScan,
  onTransactionHistory,
  onKonsinyasi,
  onStockOpname,
  onKasirKas,
  onDailyReport
}: SlideCardMenuProps) => {
  // Return null to hide the sidebar completely
  return null;
};

export default SlideCardMenu;
