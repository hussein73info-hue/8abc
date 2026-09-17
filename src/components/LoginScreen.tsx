/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { rosterService } from '../services/rosterService';
import { Trainee } from '../types';
import { BookOpen, UserCheck, AlertCircle, UserPlus, ListFilter, Sparkles, Check } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: Trainee) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [loginMode, setLoginMode] = useState<'select' | 'custom'>('select');
  const [roster, setRoster] = useState<Trainee[]>([]);

  // Selection mode state
  const [selectedId, setSelectedId] = useState('');
  const [enteredId, setEnteredId] = useState('');

  // Custom manual entry state
  const [customName, setCustomName] = useState('');
  const [customId, setCustomId] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const list = rosterService.getRoster();
    const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    setRoster(sorted);
  }, []);

  const handleSelectChange = (id: string) => {
    setSelectedId(id);
    setEnteredId(id); // Auto-fill corresponding ID to eliminate frustration
    setErrorMessage('');
  };

  const handleQuickDemoLogin = () => {
    if (roster.length > 0) {
      const demoTrainee = roster[0];
      onLogin(demoTrainee);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (loginMode === 'select') {
      const trimmedId = enteredId.trim();

      if (!selectedId) {
        setErrorMessage('يرجى اختيار اسمك من قائمة المتدربين.');
        return;
      }

      if (!trimmedId) {
        setErrorMessage('يرجى إدخال الرقم الوزاري للتحقق.');
        return;
      }

      const match = roster.find((r) => r.id === selectedId);

      if (!match) {
        setErrorMessage('الاسم المختار غير موجود في القائمة.');
        return;
      }

      // If the user modified the ID, verify or allow match
      if (match.id !== trimmedId) {
        // Check if there is another student with this ID or allow if valid
        const idMatch = roster.find((r) => r.id === trimmedId && r.name === match.name);
        if (!idMatch) {
          setErrorMessage(`الرقم الوزاري غير مطابق للاسم المختار (الرقم المعتمد هو: ${match.id}).`);
          return;
        }
      }

      onLogin(match);
    } else {
      // Custom manual entry
      const trimmedName = customName.trim();
      const trimmedCustomId = customId.trim();

      if (!trimmedName) {
        setErrorMessage('يرجى كتابة اسم المتدرب/ة الرباعي أو الثلاثي.');
        return;
      }

      if (!trimmedCustomId) {
        setErrorMessage('يرجى إدخال الرقم الوزاري أو الرقم التعريفي.');
        return;
      }

      const newTrainee: Trainee = {
        id: trimmedCustomId,
        name: trimmedName,
      };

      // Add to roster for future sessions
      rosterService.addTrainee(newTrainee);
      onLogin(newTrainee);
    }
  };

  return (
    <div className="w-full max-w-[820px] mx-auto min-h-screen pb-10">
      {/* Hero Header */}
      <header className="bg-[#1B3A3D] text-white rounded-b-[28px] px-6 pt-10 pb-8 text-center shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 text-white mb-3 text-3xl shadow-inner">
          <BookOpen className="w-8 h-8 text-[#C99A2E]" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          كتاب الثقافة المالية
        </h1>
        <p className="text-[#cfe0de] mt-2 text-base md:text-lg font-medium">
          الصف الثامن — الفصل الدراسي الأول
        </p>
      </header>

      {/* Main Login Screen */}
      <main className="p-4 md:p-6 max-w-lg mx-auto">
        <div className="bg-white border-[1.5px] border-[#D9CFB4] rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#1B3A3D]" />
              <h2 className="text-xl font-bold text-[#1B3A3D]">تسجيل دخول المتدرب/ة</h2>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="text-xs font-bold text-[#1B3A3D] bg-[#F6F1E7] hover:bg-[#ebdcc0] px-2.5 py-1.5 rounded-lg border border-[#D9CFB4] flex items-center gap-1 transition-colors cursor-pointer"
              title="دخول فوري مباشر لأول متدرب للتجربة السريعة"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C99A2E]" />
              <span>دخول تجريبي سريع</span>
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F6F1E7] rounded-xl mb-5 border border-[#D9CFB4]/60">
            <button
              type="button"
              onClick={() => {
                setLoginMode('select');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                loginMode === 'select'
                  ? 'bg-[#1B3A3D] text-white shadow-xs'
                  : 'text-[#1B3A3D]/70 hover:text-[#1B3A3D]'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>قائمة الأسماء المعتمدة</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginMode('custom');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                loginMode === 'custom'
                  ? 'bg-[#1B3A3D] text-white shadow-xs'
                  : 'text-[#1B3A3D]/70 hover:text-[#1B3A3D]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>كتابة اسم جديد</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {loginMode === 'select' ? (
              <>
                {/* Name Selection */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="loginNameSelect" className="font-bold text-sm text-[#1B3A3D]">
                      اختر الاسم من القائمة
                    </label>
                    <span className="text-[11px] text-[#1B3A3D]/60 font-medium">
                      ({roster.length} متدرب/ة مسجل)
                    </span>
                  </div>
                  <select
                    id="loginNameSelect"
                    value={selectedId}
                    onChange={(e) => handleSelectChange(e.target.value)}
                    className="rounded-xl border-[1.5px] border-[#D9CFB4] p-3 text-base bg-white text-[#1B3A3D] w-full focus-visible:outline-[#C99A2E] focus-visible:outline-[3px]"
                  >
                    <option value="">-- اضغط لاختيار اسمك من القائمة --</option>
                    {roster.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} — (الرقم الوزاري: {r.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ministry ID */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="loginIdInput" className="font-bold text-sm text-[#1B3A3D]">
                      الرقم الوزاري
                    </label>
                    {selectedId && (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        تمت المطابقة تلقائياً
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    id="loginIdInput"
                    placeholder="الرقم الوزاري المعتمد"
                    inputMode="numeric"
                    value={enteredId}
                    onChange={(e) => {
                      setEnteredId(e.target.value);
                      setErrorMessage('');
                    }}
                    className="rounded-xl border-[1.5px] border-[#D9CFB4] p-3 text-base bg-white text-[#1B3A3D] w-full focus-visible:outline-[#C99A2E] focus-visible:outline-[3px]"
                  />
                  <p className="text-[11px] text-[#1B3A3D]/60">
                    💡 عند اختيار الاسم من القائمة يتم إدراج الرقم الوزاري تلقائياً لتسهيل الدخول.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Custom Name Entry */}
                <div className="bg-[#FAF7F0] border border-[#D9CFB4] p-3 rounded-xl text-xs text-[#1B3A3D]/80">
                  ✨ يمكنك تسجيل الدخول بأي اسم ورقم وزاري بحرية، وسيتم تسجيل المتدرب وحفظ نتائجه باسمه المدخل.
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="customNameInput" className="font-bold text-sm text-[#1B3A3D]">
                    اسم المتدرب / الطالب كاملاً
                  </label>
                  <input
                    type="text"
                    id="customNameInput"
                    placeholder="مثال: يزن عادل الصالح"
                    value={customName}
                    onChange={(e) => {
                      setCustomName(e.target.value);
                      setErrorMessage('');
                    }}
                    className="rounded-xl border-[1.5px] border-[#D9CFB4] p-3 text-base bg-white text-[#1B3A3D] w-full focus-visible:outline-[#C99A2E] focus-visible:outline-[3px]"
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="customIdInput" className="font-bold text-sm text-[#1B3A3D]">
                    الرقم الوزاري أو رقم الهوية / الجلوس
                  </label>
                  <input
                    type="text"
                    id="customIdInput"
                    placeholder="مثال: 1026 أو 202401"
                    inputMode="numeric"
                    value={customId}
                    onChange={(e) => {
                      setCustomId(e.target.value);
                      setErrorMessage('');
                    }}
                    className="rounded-xl border-[1.5px] border-[#D9CFB4] p-3 text-base bg-white text-[#1B3A3D] w-full focus-visible:outline-[#C99A2E] focus-visible:outline-[3px]"
                  />
                </div>
              </>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div
                id="loginErrorBox"
                className="flex items-start gap-2.5 bg-[#fdeceb] border-[1.5px] border-[#A8432E] text-[#A8432E] rounded-xl p-3 text-sm font-medium animate-fadeIn"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              id="doLoginBtn"
              className="w-full bg-[#1B3A3D] hover:bg-[#152e30] active:scale-[0.98] transition-transform text-white font-bold py-3.5 px-5 rounded-xl text-base shadow-sm mt-2 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{loginMode === 'select' ? 'دخول التطبيق' : 'تسجيل ودخول التطبيق'}</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
