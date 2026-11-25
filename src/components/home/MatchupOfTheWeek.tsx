import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Scale, ArrowRight, Check, Sparkles, ThumbsUp } from 'lucide-react';

export const MatchupOfTheWeek: React.FC = () => {
  const { navigate, addToCompare } = useApp();

  const [votes, setVotes] = useState<{ p1: number; p2: number }>({ p1: 1640, p2: 1290 });
  const [userVoted, setUserVoted] = useState<'p1' | 'p2' | null>(() => {
    return (localStorage.getItem('nn_duel_voted') as 'p1' | 'p2') || null;
  });

  const totalVotes = votes.p1 + votes.p2;
  const p1Percent = Math.round((votes.p1 / totalVotes) * 100);
  const p2Percent = 100 - p1Percent;

  const handleVote = (choice: 'p1' | 'p2') => {
    if (userVoted) return;
    setUserVoted(choice);
    localStorage.setItem('nn_duel_voted', choice);
    setVotes((prev) => ({
      ...prev,
      [choice]: prev[choice] + 1,
    }));
  };

  const handleLaunchDuelCompare = () => {
    addToCompare('iphone-17-pro');
    addToCompare('galaxy-s26-ultra');
    navigate('/karsilastir');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-br from-[#0B0F14] via-[#111827] to-[#0B0F14] text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#14B8A6]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>Haftanın Düellosu & Zirve Kıyaslaması</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Apple iPhone 17 Pro <span className="text-[#14B8A6]">VS</span> Samsung Galaxy S26 Ultra
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Platformumuzda kullanıcıların en çok kıyasladığı amiral gemisi kapışması
            </p>
          </div>

          <div className="self-start sm:self-auto">
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#14B8A6]/20 text-[#2dd4bf] border border-[#14B8A6]/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{totalVotes.toLocaleString('tr-TR')} Topluluk Oyu</span>
            </span>
          </div>
        </div>

        {/* Head-to-Head Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-8">
          {/* Left Fighter: iPhone 17 Pro (5 cols) */}
          <div className="lg:col-span-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 p-5 sm:p-6 transition-all flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-white/10 p-2 flex items-center justify-center shrink-0 border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80"
                  alt="Apple iPhone 17 Pro"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Apple
                </span>
                <h3 className="text-lg font-bold text-white">iPhone 17 Pro</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-md bg-[#14B8A6]/20 text-[#2dd4bf] text-xs font-bold border border-[#14B8A6]/30">
                    89 Puan
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">79.999 TL</span>
                </div>
              </div>
            </div>

            {/* Spec highlights */}
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-white/10">
              <li className="flex items-center gap-1.5">
                <span className="text-[#14B8A6]">✓</span>
                <span><strong>İşlemci:</strong> Apple A19 Pro (Sektör lideri tek çekirdek)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#14B8A6]">✓</span>
                <span><strong>Ekran:</strong> 3000 nit Super Retina XDR (Kompakt 199g)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#14B8A6]">✓</span>
                <span><strong>Kamera:</strong> 48 MP 5x Telefoto & ProRes Log</span>
              </li>
            </ul>

            {/* Vote button */}
            <button
              onClick={() => handleVote('p1')}
              disabled={!!userVoted}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                userVoted === 'p1'
                  ? 'bg-[#14B8A6] text-white shadow-lg'
                  : userVoted
                  ? 'bg-white/5 text-slate-400 cursor-default'
                  : 'bg-white/10 hover:bg-[#14B8A6] text-white hover:shadow-md'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{userVoted === 'p1' ? 'Oyunuz Kaydedildi' : 'iPhone 17 Pro\'ya Oy Ver'}</span>
              <span className="ml-auto font-black text-xs">%{p1Percent}</span>
            </button>
          </div>

          {/* Center VS & Progress Indicator (2 cols) */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center py-2 space-y-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#14B8A6] to-cyan-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[#14B8A6]/20">
              VS
            </div>

            {/* Distribution Bar */}
            <div className="w-full space-y-1 text-center">
              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden flex">
                <div
                  className="bg-[#14B8A6] h-full transition-all duration-700"
                  style={{ width: `${p1Percent}%` }}
                />
                <div
                  className="bg-amber-400 h-full transition-all duration-700"
                  style={{ width: `${p2Percent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-bold px-1">
                <span className="text-[#2dd4bf]">%{p1Percent} Apple</span>
                <span className="text-amber-400">%{p2Percent} Samsung</span>
              </div>
            </div>
          </div>

          {/* Right Fighter: Galaxy S26 Ultra (5 cols) */}
          <div className="lg:col-span-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 p-5 sm:p-6 transition-all flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-white/10 p-2 flex items-center justify-center shrink-0 border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80"
                  alt="Samsung Galaxy S26 Ultra"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Samsung
                </span>
                <h3 className="text-lg font-bold text-white">Galaxy S26 Ultra</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                    92 Puan
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">84.999 TL</span>
                </div>
              </div>
            </div>

            {/* Spec highlights */}
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-white/10">
              <li className="flex items-center gap-1.5">
                <span className="text-amber-400">✓</span>
                <span><strong>Kamera:</strong> 200 MP Ana Kamera & 100x Space Zoom</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-amber-400">✓</span>
                <span><strong>Aksesuar:</strong> Entegre S-Pen Kalem Desteği</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-amber-400">✓</span>
                <span><strong>Batarya:</strong> 5200 mAh Pil & 45W Hızlı Şarj</span>
              </li>
            </ul>

            {/* Vote button */}
            <button
              onClick={() => handleVote('p2')}
              disabled={!!userVoted}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                userVoted === 'p2'
                  ? 'bg-amber-500 text-slate-950 shadow-lg'
                  : userVoted
                  ? 'bg-white/5 text-slate-400 cursor-default'
                  : 'bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white hover:shadow-md'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{userVoted === 'p2' ? 'Oyunuz Kaydedildi' : 'S26 Ultra\'ya Oy Ver'}</span>
              <span className="ml-auto font-black text-xs">%{p2Percent}</span>
            </button>
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            Her iki modelin 50+ doğrulanmış teknik parametresi üretici dokümanlarıyla eşleştirilmiştir.
          </p>

          <button
            onClick={handleLaunchDuelCompare}
            className="w-full sm:w-auto px-6 py-3 bg-[#14B8A6] hover:bg-[#0d9488] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Scale className="w-4 h-4" />
            <span>Kapsamlı Karşılaştırmayı Başlat</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
