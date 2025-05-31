
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface WelcomeScreenProps {
  userName: string;
  onComplete: () => void;
}

const WelcomeScreen = ({ userName, onComplete }: WelcomeScreenProps) => {
  const [showBismillah, setShowBismillah] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    // Sequence of animations
    const timer1 = setTimeout(() => setShowLogo(true), 200);
    const timer2 = setTimeout(() => setShowBismillah(true), 800);
    const timer3 = setTimeout(() => setShowWelcome(true), 1400);
    const timer4 = setTimeout(() => onComplete(), 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center gradient-assunnah p-4 overflow-hidden">
      <div className="text-center space-y-8 max-w-md w-full">
        {/* Logo Animation */}
        <div className={`transition-all duration-1000 transform ${
          showLogo 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-10 scale-95'
        }`}>
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img 
                src="/lovable-uploads/a2af9547-58f3-45de-b565-8283573a9b0e.png" 
                alt="Assunnah Mart Logo" 
                className="h-32 w-auto sm:h-40 md:h-48 drop-shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/20 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Bismillah Animation */}
        <div className={`transition-all duration-1000 transform ${
          showBismillah 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}>
          <Card className="p-8 bg-white/95 backdrop-blur-sm shadow-2xl border-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-white to-amber-50 opacity-50"></div>
            <div className="relative z-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-800 mb-4 animate-fade-in">
                بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
              </h1>
              <p className="text-lg text-gray-700 font-medium">
                Bismillahirrahmanirrahim
              </p>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-4 left-4 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
            <div className="absolute top-4 right-4 w-3 h-3 bg-amber-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-emerald-500 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          </Card>
        </div>

        {/* Welcome Message Animation */}
        <div className={`transition-all duration-1000 transform ${
          showWelcome 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-8 scale-95'
        }`}>
          <Card className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xl border-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"20\" cy=\"20\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 animate-fade-in">
                Selamat Datang di
              </h2>
              <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-amber-200 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                Assunnah Mart
              </h3>
              <p className="text-lg font-medium animate-fade-in" style={{ animationDelay: '0.6s' }}>
                Halo, <span className="font-bold text-amber-200">{userName}</span>! 
              </p>
              <p className="text-sm mt-2 opacity-90 animate-fade-in" style={{ animationDelay: '0.9s' }}>
                Semoga Allah memberkahi aktivitas Anda hari ini
              </p>
            </div>
          </Card>
        </div>

        {/* Loading indicator */}
        <div className={`transition-all duration-500 ${
          showWelcome ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex justify-center items-center space-x-2 mt-6">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-sm text-gray-600 mt-2 animate-fade-in">
            Memuat aplikasi...
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
