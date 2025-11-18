import React, { useState, useEffect } from 'react';
import { Sparkles, Mail, Bell } from 'lucide-react';

export default function ComingSoon() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const target = new Date('2025-12-31T23:59:59');
    
    const interval = setInterval(() => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();
      
      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);
      
      setDays(d);
      setHours(h);
      setMinutes(m);
      setSeconds(s);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8 animate-bounce">
          <div className="bg-white/20 backdrop-blur-lg p-6 rounded-full shadow-2xl">
            <Sparkles className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
            Coming Soon
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-4">
            Sesuatu yang luar biasa sedang dalam perjalanan
          </p>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Kami sedang mempersiapkan pengalaman yang menakjubkan untuk Anda. Daftarkan email Anda untuk mendapatkan notifikasi saat kami launch!
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="grid grid-cols-4 gap-4 md:gap-8 mb-12 max-w-3xl mx-auto">
          {[
            { label: 'Hari', value: days },
            { label: 'Jam', value: hours },
            { label: 'Menit', value: minutes },
            { label: 'Detik', value: seconds }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 md:p-6 shadow-xl transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl md:text-6xl font-bold text-white mb-2">
                {String(item.value).padStart(2, '0')}
              </div>
              <div className="text-sm md:text-base text-white/80 uppercase tracking-wider">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Email Subscription */}
        <div className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
          

          {/* Success Message */}
          {subscribed && (
            <div className="mt-4 p-4 bg-green-500/90 backdrop-blur-lg text-white rounded-xl shadow-lg animate-pulse">
              ✓ Terima kasih! Kami akan menghubungi Anda segera.
            </div>
          )}
        </div>

        {/* Social Links */}
        
      </div>
    </div>
  </div>
  );
};