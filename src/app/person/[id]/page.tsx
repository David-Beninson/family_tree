'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFamilyStore } from '../../../lib/store';
import { Person } from '../../../lib/types';
import {
  ArrowRight,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Home,
  Briefcase,
  Globe,
  Camera,
  Network,
  BookOpen,
  Activity,
  Heart,
  Skull,
  Edit2,
  Save,
  X,
  User,
  MessageCircle,
  Share2,
  Check
} from 'lucide-react';

export default function PersonPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { persons, updatePersons } = useFamilyStore();

  const person = persons.find(p => p.id === id);

  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Person | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!person) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fdfbf7]" dir="rtl">
        <div className="text-center p-8 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100">
          <h2 className="text-2xl font-bold text-[#2c1e14] mb-4">האדם לא נמצא</h2>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-[#2c1e14] text-white rounded-xl hover:bg-[#433422] transition-colors"
          >
            חזרה לעץ
          </button>
        </div>
      </div>
    );
  }

  const initials = person.fullName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleBack = () => router.push('/');

  const handleSave = () => {
    if (formData) {
      const updatedPersons = persons.map(p => p.id === person.id ? formData : p);
      updatePersons(updatedPersons);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(null);
  };

  const openEditConfirm = () => setIsEditConfirmOpen(true);
  const closeEditConfirm = () => setIsEditConfirmOpen(false);

  const confirmEdit = () => {
    setFormData(person);
    setIsEditConfirmOpen(false);
    setIsEditing(true);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: `הכרטיס של ${person.fullName} - עץ משפחה`,
      text: `צפו בכרטיס המלא של ${person.fullName}`,
      url: url,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.log('Share failed or cancelled', err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData!, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const isMale = person.gender === 'male';

  // Elegant gender-based theme
  const theme = isMale ? {
    pageBg: 'bg-slate-50',
    lightBg: 'bg-blue-50/50',
    accent: 'text-blue-600',
    accentBg: 'bg-blue-50',
    accentBorder: 'border-blue-100',
    ring: 'focus:ring-blue-500/20',
    focusBorder: 'focus:border-blue-400',
    btnPrimary: 'bg-blue-600 hover:bg-blue-700',
    btnSecondary: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
    ambientLight: 'bg-blue-400/5'
  } : {
    pageBg: 'bg-rose-50/30',
    lightBg: 'bg-rose-50/50',
    accent: 'text-rose-600',
    accentBg: 'bg-rose-50',
    accentBorder: 'border-rose-100',
    ring: 'focus:ring-rose-500/20',
    focusBorder: 'focus:border-rose-400',
    btnPrimary: 'bg-rose-600 hover:bg-rose-700',
    btnSecondary: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200',
    ambientLight: 'bg-rose-400/5'
  };

  const renderInput = (
    field: keyof Person,
    placeholder: string,
    type: string = 'text',
    className: string = `bg-white border border-stone-200 rounded-xl px-4 py-2.5 w-full outline-none ${theme.focusBorder} focus:ring-2 ${theme.ring} transition-all text-stone-800 shadow-sm`
  ) => {
    return (
      <input
        type={type}
        placeholder={placeholder}
        value={(formData?.[field] as string) || ''}
        onChange={e => setFormData({ ...formData!, [field]: type === 'number' ? Number(e.target.value) : e.target.value })}
        className={className}
      />
    );
  };

  const renderNestedInput = (
    parentField: 'address' | 'socialLinks',
    field: string,
    placeholder: string,
    className: string = `bg-white border border-stone-200 rounded-xl px-4 py-2.5 w-full outline-none ${theme.focusBorder} focus:ring-2 ${theme.ring} transition-all text-stone-800 shadow-sm`
  ) => {
    return (
      <input
        type="text"
        placeholder={placeholder}
        value={((formData?.[parentField] as any)?.[field] as string) || ''}
        onChange={e => setFormData({
          ...formData!,
          [parentField]: { ...(formData?.[parentField] as any), [field]: e.target.value }
        })}
        className={className}
        dir={parentField === 'socialLinks' ? 'ltr' : 'rtl'}
      />
    );
  };

  const hasBirthEvents = person.birthYear || person.birthDate || person.birthPlace;
  const hasDeathEvents = !person.isAlive && (person.deathYear || person.deathDate || person.deathPlace || person.burialPlace);
  const showPersonalDetails = hasBirthEvents || hasDeathEvents || isEditing;

  // Correct date logic for display
  const dateDisplay = person.isAlive
    ? (person.birthYear ? String(person.birthYear) : '')
    : (person.birthYear || person.deathYear)
      ? `${person.birthYear || '?'} - ${person.deathYear || '?'}`
      : '';

  return (
    <div className={`h-screen overflow-y-auto ${theme.pageBg} font-sans selection:bg-stone-300/30 transition-colors duration-500`} dir="rtl">

      {/* Confirmation Modal */}
      {isEditConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200 border border-stone-100">
            <div className={`w-12 h-12 rounded-full ${theme.accentBg} ${theme.accent} flex items-center justify-center mb-5`}>
              <Edit2 className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-[#2c1e14] mb-3">מצב עריכה</h3>
            <p className="text-stone-600 mb-8 text-[15px] leading-relaxed">
              האם ברצונך לערוך את פרטיו של <strong>{person.fullName}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeEditConfirm}
                className="px-5 py-2.5 text-stone-600 hover:bg-stone-50 font-medium rounded-xl transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={confirmEdit}
                className={`px-5 py-2.5 ${theme.btnPrimary} text-white font-medium rounded-xl shadow-md transition-all`}
              >
                מעבר לעריכה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className={`sticky top-0 z-40 ${theme.pageBg} backdrop-blur-xl border-b border-stone-200/60 px-6 py-4 flex justify-between items-center bg-opacity-80`}>
        {!isEditing ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-stone-600 hover:text-[#2c1e14] bg-white hover:bg-stone-50 border border-stone-200 rounded-full transition-all group shadow-sm"
          >
            <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">חזרה לעץ משפחה</span>
          </button>
        ) : (
          <div className="text-[#2c1e14] font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            מצב עריכה
          </div>
        )}

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-medium shadow-md transition-all hover:-translate-y-0.5 text-sm">
                <Save className="w-4 h-4" /> שמירת שינויים
              </button>
              <button onClick={handleCancelEdit} className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 rounded-full font-medium transition-all text-sm shadow-sm">
                <X className="w-4 h-4" /> ביטול
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleShare}
                className={`flex items-center justify-center gap-2 px-5 py-2 bg-white text-stone-600 hover:text-[#2c1e14] border border-stone-200 rounded-full shadow-sm transition-all hover:bg-stone-50 font-medium text-sm w-[130px]`}
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                {isCopied ? 'הקישור הועתק!' : 'שתף כרטיס'}
              </button>
              <button 
                onClick={openEditConfirm}
                className={`flex items-center justify-center gap-2 px-6 py-2 ${theme.btnPrimary} text-white rounded-full shadow-md transition-all hover:-translate-y-0.5 font-medium text-sm`}
              >
                <Edit2 className="w-4 h-4" /> ערוך כרטיס
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">

        <div className={`absolute top-20 right-10 w-[500px] h-[500px] ${theme.ambientLight} rounded-full blur-3xl pointer-events-none -z-10`}></div>
        <div className={`absolute bottom-0 left-10 w-[600px] h-[600px] ${theme.ambientLight} rounded-full blur-3xl pointer-events-none -z-10`}></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column (Main Info & Bio) */}
          <div className="lg:col-span-8 space-y-8 order-2 lg:order-1">

            {/* Header/Title Area */}
            <div className={`bg-white/80 backdrop-blur-sm rounded-[2rem] p-8 sm:p-10 shadow-sm border ${isEditing ? `border-[${theme.accent}] ring-4 ${theme.ring}` : 'border-stone-100'}`}>
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">

                <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-[2rem] shadow-xl overflow-hidden bg-stone-100 flex items-center justify-center relative group border-4 border-white">
                  {isEditing ? (
                    <label className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm text-white p-2 cursor-pointer hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100">
                      <Camera className="w-8 h-8 mb-2 opacity-90" />
                      <span className="text-sm font-medium">העלאת תמונה</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  ) : null}

                  {(isEditing ? formData?.photoUrl : person.photoUrl) ? (
                    <img src={(isEditing ? formData?.photoUrl : person.photoUrl)!} alt={person.fullName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <span className={`text-5xl font-serif ${theme.accent} opacity-50`}>{initials}</span>
                  )}
                  {!(isEditing ? formData?.isAlive : person.isAlive) && (
                    <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded-lg text-xs font-medium z-0">ז"ל</div>
                  )}
                </div>

                <div className="flex-grow w-full">
                  {isEditing ? (
                    <div className="space-y-4 max-w-xl">
                      <div>
                        <label className="text-xs font-bold text-stone-500 mb-1.5 block">שם מלא</label>
                        {renderInput('fullName', 'שם מלא', 'text', `text-2xl sm:text-4xl font-bold text-[#2c1e14] bg-white border border-stone-200 rounded-xl px-4 py-3 w-full outline-none ${theme.focusBorder} focus:ring-2 ${theme.ring} transition-all`)}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-500 mb-1.5 block">שם נעורים (אופציונלי)</label>
                        {renderInput('maidenName', 'לדוגמה: לוי')}
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-4xl sm:text-5xl font-bold text-[#2c1e14] tracking-tight mb-2">
                        {person.fullName}
                      </h1>
                      {person.maidenName && (
                        <p className="text-lg text-stone-500 font-medium">
                          (לשעבר {person.maidenName})
                        </p>
                      )}
                    </>
                  )}

                  <div className="flex flex-wrap gap-3 mt-6 items-center">
                    {isEditing ? (
                      <>
                        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50/50 text-emerald-700 text-sm font-medium border border-emerald-200 cursor-pointer hover:bg-emerald-50 transition-colors">
                          <input type="checkbox" checked={formData?.isAlive || false} onChange={e => setFormData({ ...formData!, isAlive: e.target.checked })} className="w-4 h-4 accent-emerald-500 rounded" />
                          האדם בחיים
                        </label>
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                          {renderInput('occupation', 'מקצוע', 'text', `bg-white border border-stone-200 rounded-xl px-4 py-2.5 sm:w-64 text-sm outline-none ${theme.focusBorder} focus:ring-2 ${theme.ring}`)}
                        </div>
                      </>
                    ) : (
                      <>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${person.isAlive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-stone-100 text-stone-600 border border-stone-200'}`}>
                          <Activity className="w-4 h-4" />
                          {person.isAlive ? 'בחיים' : 'נפטר/ה'}
                        </span>

                        {dateDisplay && (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${theme.accentBg} ${theme.accent} text-sm font-medium border ${theme.accentBorder}`}>
                            <Calendar className="w-4 h-4" />
                            <span dir="ltr">{dateDisplay}</span>
                          </span>
                        )}

                        {person.occupation && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 text-sm font-medium border border-stone-200">
                            <Briefcase className="w-4 h-4" />
                            {person.occupation}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {(person.bio || isEditing) && (
              <section className={`bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm border ${isEditing ? `border-[${theme.accent}] ring-2 ${theme.ring}` : 'border-stone-100'}`}>
                <h3 className="text-xl font-bold text-[#2c1e14] mb-6 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${theme.accentBg} ${theme.accentBorder} flex items-center justify-center ${theme.accent}`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  סיפור חיים
                </h3>
                {isEditing ? (
                  <textarea
                    value={formData?.bio || ''}
                    onChange={e => setFormData({ ...formData!, bio: e.target.value })}
                    placeholder="כאן אפשר לספר את סיפור חייו של האדם, תחביבים מיוחדים, הישגים חשובים..."
                    className={`w-full min-h-[200px] bg-white border border-stone-200 rounded-2xl p-5 outline-none ${theme.focusBorder} focus:ring-2 ${theme.ring} transition-all resize-y text-stone-800 leading-relaxed shadow-sm`}
                  />
                ) : (
                  <p className="text-stone-700 leading-relaxed whitespace-pre-wrap text-[16px]">
                    {person.bio}
                  </p>
                )}
              </section>
            )}

            {/* Personal Details Section (replaces timeline) */}
            {showPersonalDetails && (
              <section className={`bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm border ${isEditing ? `border-[${theme.accent}] ring-2 ${theme.ring}` : 'border-stone-100'}`}>
                <h3 className="text-xl font-bold text-[#2c1e14] mb-8 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${theme.accentBg} ${theme.accentBorder} flex items-center justify-center ${theme.accent}`}>
                    <User className="w-5 h-5" />
                  </div>
                  פרטים אישיים
                </h3>

                {isEditing ? (
                  <div className="space-y-8">
                    <div className="bg-stone-50/50 p-6 rounded-2xl border border-stone-100">
                      <h4 className="font-bold text-[#2c1e14] mb-5 flex items-center gap-2"><Heart className="w-4 h-4 text-rose-400" /> לידה</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                          <label className="text-xs text-stone-500 mb-1.5 block">שנת לידה</label>
                          {renderInput('birthYear', 'YYYY', 'number')}
                        </div>
                        <div>
                          <label className="text-xs text-stone-500 mb-1.5 block">תאריך מלא (אופציונלי)</label>
                          {renderInput('birthDate', 'DD/MM/YYYY', 'text')}
                        </div>
                        <div>
                          <label className="text-xs text-stone-500 mb-1.5 block">עיר / מדינה</label>
                          {renderInput('birthPlace', 'מיקום', 'text')}
                        </div>
                      </div>
                    </div>

                    {!formData?.isAlive && (
                      <div className="bg-stone-50/50 p-6 rounded-2xl border border-stone-100">
                        <h4 className="font-bold text-[#2c1e14] mb-5 flex items-center gap-2"><Skull className="w-4 h-4 text-stone-400" /> פטירה וקבורה</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                          <div>
                            <label className="text-xs text-stone-500 mb-1.5 block">שנת פטירה</label>
                            {renderInput('deathYear', 'YYYY', 'number')}
                          </div>
                          <div>
                            <label className="text-xs text-stone-500 mb-1.5 block">תאריך מדויק</label>
                            {renderInput('deathDate', 'DD/MM/YYYY', 'text')}
                          </div>
                          <div>
                            <label className="text-xs text-stone-500 mb-1.5 block">מקום פטירה</label>
                            {renderInput('deathPlace', 'מיקום', 'text')}
                          </div>
                          <div>
                            <label className="text-xs text-stone-500 mb-1.5 block">בית עלמין</label>
                            {renderInput('burialPlace', 'מיקום קבורה', 'text')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {hasBirthEvents && (
                      <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-rose-400 shrink-0 shadow-sm">
                          <Heart className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#2c1e14] mb-2">מידע לידה</h4>
                          <div className="text-sm text-stone-600 flex flex-col gap-2">
                            {(person.birthDate || person.birthYear) && (
                              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-stone-400" />{person.birthDate || person.birthYear}</span>
                            )}
                            {person.birthPlace && (
                              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-stone-400" />{person.birthPlace}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {hasDeathEvents && (
                      <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-400 shrink-0 shadow-sm">
                          <Skull className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#2c1e14] mb-2">מידע פטירה</h4>
                          <div className="text-sm text-stone-600 flex flex-col gap-2">
                            {(person.deathDate || person.deathYear) && (
                              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-stone-400" />{person.deathDate || person.deathYear}</span>
                            )}
                            {person.deathPlace && (
                              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-stone-400" />{person.deathPlace}</span>
                            )}
                            {person.burialPlace && (
                              <span className="flex items-center gap-2"><Home className="w-4 h-4 text-stone-400" />קבורה: {person.burialPlace}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Right Column (Contact & Social) */}
          <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">

            {/* Contact Info Card */}
            {(person.phoneNumber || person.email || person.address || isEditing) && (
              <section className={`bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 shadow-sm border ${isEditing ? `border-[${theme.accent}] ring-2 ${theme.ring}` : 'border-stone-100'}`}>
                <h3 className="text-lg font-bold text-[#2c1e14] mb-6 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${theme.accentBg} ${theme.accentBorder} flex items-center justify-center ${theme.accent}`}>
                    <Phone className="w-5 h-5" />
                  </div>
                  פרטי קשר
                </h3>

                {isEditing ? (
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-bold text-stone-500 mb-1.5 block">מספר טלפון</label>
                      {renderInput('phoneNumber', 'טלפון', 'tel', `bg-white border border-stone-200 rounded-xl px-4 py-2.5 w-full outline-none ${theme.focusBorder} focus:ring-2 ${theme.ring} text-left transition-all shadow-sm`)}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 mb-1.5 block">כתובת אימייל</label>
                      {renderInput('email', 'דוא"ל', 'email', `bg-white border border-stone-200 rounded-xl px-4 py-2.5 w-full outline-none ${theme.focusBorder} focus:ring-2 ${theme.ring} text-left transition-all shadow-sm`)}
                    </div>
                    <div className="pt-3 border-t border-stone-100">
                      <label className="text-sm font-bold text-[#2c1e14] mb-3 block flex items-center gap-2"><MapPin className="w-4 h-4 text-stone-400" /> כתובת מלאה</label>
                      <div className="space-y-3">
                        {renderNestedInput('address', 'country', 'ארץ')}
                        {renderNestedInput('address', 'city', 'עיר')}
                        {renderNestedInput('address', 'street', 'רחוב ומספר')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {person.phoneNumber && (
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-4 items-start">
                          <div className={`w-10 h-10 rounded-full ${theme.accentBg} flex items-center justify-center ${theme.accent} shrink-0 border ${theme.accentBorder}`}>
                            <Phone className="w-4 h-4" />
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-xs text-stone-400 font-medium mb-1">טלפון נייד</div>
                            <a href={`tel:${person.phoneNumber}`} className="text-[#2c1e14] font-medium hover:text-[#d4a373] transition-colors block truncate" dir="ltr" title={person.phoneNumber}>{person.phoneNumber}</a>
                          </div>
                        </div>
                        {/* WhatsApp Button */}
                        <a
                          href={`https://wa.me/${person.phoneNumber.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 rounded-xl text-sm font-bold transition-colors border border-[#25D366]/20"
                        >
                          <MessageCircle className="w-4 h-4" />
                          שלח הודעת WhatsApp
                        </a>
                      </div>
                    )}
                    {person.email && (
                      <div className="flex gap-4 items-start">
                        <div className={`w-10 h-10 rounded-full ${theme.accentBg} flex items-center justify-center ${theme.accent} shrink-0 border ${theme.accentBorder}`}>
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden min-w-0 w-full">
                          <div className="text-xs text-stone-400 font-medium mb-1">דואר אלקטרוני</div>
                          <a href={`mailto:${person.email}`} className="text-[#2c1e14] font-medium hover:text-[#d4a373] transition-colors block truncate" title={person.email}>{person.email}</a>
                        </div>
                      </div>
                    )}
                    {person.address && (Object.values(person.address).some(Boolean)) && (
                      <div className="flex gap-4 items-start">
                        <div className={`w-10 h-10 rounded-full ${theme.accentBg} flex items-center justify-center ${theme.accent} shrink-0 border ${theme.accentBorder}`}>
                          <Home className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs text-stone-400 font-medium mb-1">כתובת מגורים נוכחי</div>
                          <div className="text-[#2c1e14] font-medium leading-relaxed">
                            {[person.address.street, person.address.city, person.address.country].filter(Boolean).join(', ')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Social Links Card */}
            {((person.socialLinks && Object.values(person.socialLinks).some(Boolean)) || isEditing) && (
              <section className={`bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 shadow-sm border ${isEditing ? `border-[${theme.accent}] ring-2 ${theme.ring}` : 'border-stone-100'}`}>
                <h3 className="text-lg font-bold text-[#2c1e14] mb-6 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${theme.accentBg} ${theme.accentBorder} flex items-center justify-center ${theme.accent}`}>
                    <Globe className="w-5 h-5" />
                  </div>
                  נוכחות ברשת
                </h3>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute left-4 top-3 text-blue-500"><Globe className="w-4 h-4" /></div>
                      {renderNestedInput('socialLinks', 'facebook', 'קישור לפייסבוק', "bg-white border border-stone-200 rounded-xl pl-11 pr-4 py-2.5 w-full outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-left text-sm transition-all shadow-sm")}
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-3 text-pink-500"><Camera className="w-4 h-4" /></div>
                      {renderNestedInput('socialLinks', 'instagram', 'קישור לאינסטגרם', "bg-white border border-stone-200 rounded-xl pl-11 pr-4 py-2.5 w-full outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 text-left text-sm transition-all shadow-sm")}
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-3 text-sky-500"><Network className="w-4 h-4" /></div>
                      {renderNestedInput('socialLinks', 'linkedin', 'קישור ללינקדאין', "bg-white border border-stone-200 rounded-xl pl-11 pr-4 py-2.5 w-full outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 text-left text-sm transition-all shadow-sm")}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {person.socialLinks?.facebook && (
                      <a href={person.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-stone-50 border border-transparent hover:border-stone-100 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-blue-50/50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                          <Globe className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-[#2c1e14]">פייסבוק</span>
                      </a>
                    )}
                    {person.socialLinks?.instagram && (
                      <a href={person.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-stone-50 border border-transparent hover:border-stone-100 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-pink-50/50 text-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                          <Camera className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-[#2c1e14]">אינסטגרם</span>
                      </a>
                    )}
                    {person.socialLinks?.linkedin && (
                      <a href={person.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-stone-50 border border-transparent hover:border-stone-100 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-sky-50/50 text-sky-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                          <Network className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-[#2c1e14]">לינקדאין</span>
                      </a>
                    )}
                  </div>
                )}
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
