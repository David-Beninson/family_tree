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
  Award,
  Heart,
  Skull,
  Edit2,
  Save,
  X
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

  if (!person) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fdfbf7]" dir="rtl">
        <div className="text-center p-8 bg-white/50 backdrop-blur-md rounded-2xl shadow-xl border border-stone-200">
          <h2 className="text-2xl font-bold text-[#2c1e14] mb-4">האדם לא נמצא</h2>
          <button 
            onClick={() => router.push('/')} 
            className="px-6 py-2 bg-[#2c1e14] text-white rounded-xl hover:bg-[#433422] transition-colors"
          >
            חזרה לעץ
          </button>
        </div>
      </div>
    );
  }

  const isMale = person.gender === 'male';
  const theme = isMale 
    ? { gradient: 'from-blue-900 via-slate-800 to-[#2c1e14]', iconBg: 'bg-blue-100', iconText: 'text-blue-700' }
    : { gradient: 'from-rose-900 via-pink-800 to-[#2c1e14]', iconBg: 'bg-pink-100', iconText: 'text-rose-700' };

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

  // Helper for text inputs
  const renderInput = (
    field: keyof Person,
    placeholder: string,
    type: string = 'text',
    className: string = "bg-white border border-stone-200 rounded-lg px-3 py-2 w-full outline-none focus:border-[#d4a373] focus:ring-1 focus:ring-[#d4a373] transition-all"
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

  // Helper for nested address/social inputs
  const renderNestedInput = (
    parentField: 'address' | 'socialLinks',
    field: string,
    placeholder: string,
    className: string = "bg-white border border-stone-200 rounded-lg px-3 py-2 w-full outline-none focus:border-[#d4a373] focus:ring-1 focus:ring-[#d4a373] transition-all"
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

  return (
    <div className="h-screen overflow-y-auto bg-[#fdfbf7] font-sans selection:bg-[#d4a373]/30 pb-20" dir="rtl">
      
      {/* Confirmation Modal */}
      {isEditConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-[#2c1e14] mb-3">עריכת פרטי אדם</h3>
            <p className="text-stone-600 mb-8 text-lg">
              האם אתה בטוח שברצונך לערוך את הפרטים של <strong>{person.fullName}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={closeEditConfirm} 
                className="px-5 py-2.5 text-stone-600 hover:bg-stone-100 font-medium rounded-xl transition-colors"
              >
                ביטול
              </button>
              <button 
                onClick={confirmEdit} 
                className="px-5 py-2.5 bg-[#d4a373] hover:bg-[#c29161] text-white font-medium rounded-xl shadow-sm transition-colors"
              >
                אישור, ערוך
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className={`relative w-full h-[35vh] min-h-[250px] bg-gradient-to-br ${theme.gradient} overflow-hidden shadow-xl`}>
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-white/5 rotate-12 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[120%] bg-[#d4a373]/10 -rotate-12 blur-2xl rounded-full pointer-events-none"></div>
        
        {/* Top bar */}
        <div className="absolute top-0 w-full p-6 flex flex-wrap justify-between items-center z-10 gap-4">
          <div className="flex items-center gap-3">
            {!isEditing && (
              <button 
                onClick={handleBack}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all group"
              >
                <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">חזרה לעץ</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 border border-emerald-400 text-white rounded-full font-medium shadow-lg transition-all hover:-translate-y-0.5">
                  <Save className="w-4 h-4" /> שמירה
                </button>
                <button onClick={handleCancelEdit} className="flex items-center gap-2 px-5 py-2 bg-slate-500/80 hover:bg-slate-600/90 backdrop-blur-md border border-slate-400 text-white rounded-full font-medium transition-all">
                  <X className="w-4 h-4" /> ביטול
                </button>
              </>
            ) : (
              <button 
                onClick={openEditConfirm}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-[#d4a373] hover:bg-[#c29161] text-white rounded-full shadow-lg transition-all hover:-translate-y-0.5 font-medium border border-[#c29161]"
              >
                <Edit2 className="w-4 h-4" /> עריכה
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Card Overlay */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24 z-20">
        <div className={`bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border flex flex-col md:flex-row gap-8 items-start md:items-center ${isEditing ? 'border-[#d4a373] ring-2 ring-[#d4a373]/20' : 'border-white'}`}>
          
          {/* Avatar */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center relative group">
            {isEditing ? (
              <label className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 text-white p-2 cursor-pointer hover:bg-black/70 transition-colors">
                <Camera className="w-6 h-6 mb-1 opacity-80" />
                <span className="text-xs text-center font-medium">החלף תמונה</span>
                <input 
                  type="file" 
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            ) : null}
            
            {(isEditing ? formData?.photoUrl : person.photoUrl) ? (
              <img src={(isEditing ? formData?.photoUrl : person.photoUrl)!} alt={person.fullName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <span className="text-5xl font-bold text-slate-300">{initials}</span>
            )}
            {!(isEditing ? formData?.isAlive : person.isAlive) && (
              <div className="absolute bottom-0 w-full bg-slate-900/60 text-white text-xs text-center py-1 font-medium backdrop-blur-sm z-0">ז"ל</div>
            )}
          </div>

          {/* Title & Basics */}
          <div className="flex-grow w-full">
            {isEditing ? (
              <div className="space-y-3 max-w-xl">
                <div>
                  <label className="text-xs font-bold text-stone-500 ml-1">שם מלא</label>
                  {renderInput('fullName', 'שם מלא', 'text', 'text-2xl sm:text-3xl font-bold text-[#2c1e14] bg-white border border-stone-200 rounded-lg px-3 py-2 w-full outline-none focus:border-[#d4a373]')}
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 ml-1">שם נעורים</label>
                  {renderInput('maidenName', 'שם נעורים (אופציונלי)')}
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-4xl sm:text-5xl font-bold text-[#2c1e14] tracking-tight mb-2">
                  {person.fullName}
                </h1>
                {person.maidenName && (
                  <p className="text-lg text-slate-500 mb-3 font-medium">
                    (לשעבר {person.maidenName})
                  </p>
                )}
              </>
            )}
            
            <div className="flex flex-wrap gap-3 mt-4 items-center">
              {isEditing ? (
                <>
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={formData?.isAlive || false} 
                      onChange={e => setFormData({...formData!, isAlive: e.target.checked})} 
                      className="w-4 h-4 accent-emerald-500" 
                    />
                    האדם בחיים
                  </label>
                  <div className="flex items-center gap-2">
                    {renderInput('occupation', 'מקצוע', 'text', 'bg-white border border-stone-200 rounded-lg px-3 py-1.5 w-40 text-sm outline-none focus:border-blue-400')}
                  </div>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-sm font-medium border border-stone-200">
                    <Activity className={`w-4 h-4 ${person.isAlive ? 'text-emerald-500' : 'text-slate-400'}`} />
                    {person.isAlive ? 'בחיים' : 'נפטר/ה'}
                  </span>
                  
                  {(person.birthYear || person.deathYear) && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-sm font-medium border border-stone-200">
                      <Calendar className="w-4 h-4 text-[#d4a373]" />
                      <span dir="ltr">
                        {person.birthYear || '?'} {person.deathYear ? `- ${person.deathYear}` : (person.isAlive ? '' : '- ?')}
                      </span>
                    </span>
                  )}

                  {person.occupation && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-sm font-medium border border-stone-200">
                      <Briefcase className="w-4 h-4 text-blue-500" />
                      {person.occupation}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          
          {/* Main Content Column (Bio & Life Events) */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Bio Section */}
            {(person.bio || isEditing) && (
              <section className={`bg-white/60 backdrop-blur-lg rounded-3xl p-8 shadow-sm transition-shadow ${isEditing ? 'border-2 border-[#d4a373]/50' : 'border border-white hover:shadow-md'}`}>
                <h3 className="text-xl font-bold text-[#2c1e14] mb-4 flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${theme.iconBg} ${theme.iconText}`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  תקציר חיים
                </h3>
                {isEditing ? (
                  <textarea
                    value={formData?.bio || ''}
                    onChange={e => setFormData({...formData!, bio: e.target.value})}
                    placeholder="ספר קצת על האדם, קורות חייו, אירועים מיוחדים..."
                    className="w-full h-32 bg-white border border-stone-200 rounded-xl p-4 outline-none focus:border-[#d4a373] focus:ring-1 focus:ring-[#d4a373] transition-all resize-y"
                  />
                ) : (
                  <p className="text-stone-700 leading-relaxed whitespace-pre-wrap text-[16px]">
                    {person.bio}
                  </p>
                )}
              </section>
            )}

            {/* Life Events Section */}
            {(person.birthYear || person.birthDate || person.birthPlace || (!person.isAlive && (person.deathYear || person.deathDate || person.deathPlace || person.burialPlace)) || isEditing) && (
              <section className={`bg-white/60 backdrop-blur-lg rounded-3xl p-8 shadow-sm transition-shadow ${isEditing ? 'border-2 border-[#d4a373]/50' : 'border border-white hover:shadow-md'}`}>
                <h3 className="text-xl font-bold text-[#2c1e14] mb-6 flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${theme.iconBg} ${theme.iconText}`}>
                    <Award className="w-5 h-5" />
                  </div>
                  ציוני דרך
                </h3>
                
                {isEditing ? (
                  <div className="space-y-6 bg-white p-6 rounded-2xl border border-stone-100">
                    <div>
                      <h4 className="font-bold text-[#2c1e14] border-b pb-2 mb-4 flex items-center gap-2"><Heart className="w-4 h-4 text-[#d4a373]"/> פרטי לידה</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-stone-500 mb-1 block">שנת לידה</label>
                          {renderInput('birthYear', 'YYYY', 'number')}
                        </div>
                        <div>
                          <label className="text-xs text-stone-500 mb-1 block">תאריך מדויק</label>
                          {renderInput('birthDate', 'DD/MM/YYYY')}
                        </div>
                        <div>
                          <label className="text-xs text-stone-500 mb-1 block">עיר/ארץ לידה</label>
                          {renderInput('birthPlace', 'לדוגמה: ירושלים, ישראל')}
                        </div>
                      </div>
                    </div>
                    
                    {!formData?.isAlive && (
                      <div className="pt-4 border-t border-stone-100">
                        <h4 className="font-bold text-[#2c1e14] border-b pb-2 mb-4 flex items-center gap-2"><Skull className="w-4 h-4 text-slate-400"/> פרטי פטירה וקבורה</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="text-xs text-stone-500 mb-1 block">שנת פטירה</label>
                            {renderInput('deathYear', 'YYYY', 'number')}
                          </div>
                          <div>
                            <label className="text-xs text-stone-500 mb-1 block">תאריך מדויק</label>
                            {renderInput('deathDate', 'DD/MM/YYYY')}
                          </div>
                          <div>
                            <label className="text-xs text-stone-500 mb-1 block">מקום פטירה</label>
                            {renderInput('deathPlace', 'מקום פטירה')}
                          </div>
                          <div>
                            <label className="text-xs text-stone-500 mb-1 block">מקום קבורה</label>
                            {renderInput('burialPlace', 'בית עלמין')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-200 before:to-transparent">
                    {/* Birth Event */}
                    {(person.birthYear || person.birthDate || person.birthPlace) && (
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#d4a373] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                          <Heart className="w-4 h-4" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-2xl shadow-sm border border-stone-100 group-hover:shadow-md transition-all group-hover:-translate-y-1">
                          <div className="font-bold text-[#2c1e14] mb-1">לידה</div>
                          <div className="text-sm text-stone-500 flex flex-col gap-1">
                            {(person.birthDate || person.birthYear) && (
                              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{person.birthDate || person.birthYear}</span>
                            )}
                            {person.birthPlace && (
                              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{person.birthPlace}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Death Event */}
                    {!person.isAlive && (person.deathYear || person.deathDate || person.deathPlace || person.burialPlace) && (
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-400 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                          <Skull className="w-4 h-4" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-2xl shadow-sm border border-stone-100 group-hover:shadow-md transition-all group-hover:-translate-y-1">
                          <div className="font-bold text-[#2c1e14] mb-1">פטירה</div>
                          <div className="text-sm text-stone-500 flex flex-col gap-1">
                            {(person.deathDate || person.deathYear) && (
                              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{person.deathDate || person.deathYear}</span>
                            )}
                            {person.deathPlace && (
                              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{person.deathPlace}</span>
                            )}
                            {person.burialPlace && (
                              <span className="flex items-center gap-1.5"><Home className="w-3.5 h-3.5" />קבורה: {person.burialPlace}</span>
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

          {/* Sidebar (Contact & Social) */}
          <div className="space-y-8">
            
            {/* Contact Info */}
            {(person.phoneNumber || person.email || person.address || isEditing) && (
              <section className={`bg-white/60 backdrop-blur-lg rounded-3xl p-6 shadow-sm transition-shadow ${isEditing ? 'border-2 border-[#d4a373]/50' : 'border border-white hover:shadow-md'}`}>
                <h3 className="text-lg font-bold text-[#2c1e14] mb-5 flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${theme.iconBg} ${theme.iconText}`}>
                    <Phone className="w-4 h-4" />
                  </div>
                  פרטי קשר
                </h3>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-stone-500 mb-1 block">טלפון</label>
                      {renderInput('phoneNumber', 'מספר טלפון', 'tel', "bg-white border border-stone-200 rounded-lg px-3 py-2 w-full outline-none focus:border-[#d4a373] text-left")}
                    </div>
                    <div>
                      <label className="text-xs text-stone-500 mb-1 block">אימייל</label>
                      {renderInput('email', 'כתובת אימייל', 'email', "bg-white border border-stone-200 rounded-lg px-3 py-2 w-full outline-none focus:border-[#d4a373] text-left")}
                    </div>
                    <div className="pt-2">
                      <label className="text-xs font-bold text-[#2c1e14] mb-2 block border-b pb-1">כתובת</label>
                      <div className="space-y-2">
                        {renderNestedInput('address', 'country', 'ארץ')}
                        {renderNestedInput('address', 'city', 'עיר')}
                        {renderNestedInput('address', 'street', 'רחוב ומספר')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {person.phoneNumber && (
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 shrink-0">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs text-stone-400 font-medium mb-0.5">טלפון</div>
                          <a href={`tel:${person.phoneNumber}`} className="text-[#2c1e14] font-medium hover:text-[#d4a373] transition-colors" dir="ltr">{person.phoneNumber}</a>
                        </div>
                      </div>
                    )}
                    {person.email && (
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 shrink-0">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs text-stone-400 font-medium mb-0.5">אימייל</div>
                          <a href={`mailto:${person.email}`} className="text-[#2c1e14] font-medium hover:text-[#d4a373] transition-colors break-all">{person.email}</a>
                        </div>
                      </div>
                    )}
                    {person.address && (Object.values(person.address).some(Boolean)) && (
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 shrink-0">
                          <Home className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs text-stone-400 font-medium mb-0.5">כתובת</div>
                          <div className="text-[#2c1e14] font-medium leading-tight">
                            {[person.address.street, person.address.city, person.address.country].filter(Boolean).join(', ')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Social Links */}
            {((person.socialLinks && Object.values(person.socialLinks).some(Boolean)) || isEditing) && (
              <section className={`bg-white/60 backdrop-blur-lg rounded-3xl p-6 shadow-sm transition-shadow ${isEditing ? 'border-2 border-[#d4a373]/50' : 'border border-white hover:shadow-md'}`}>
                <h3 className="text-lg font-bold text-[#2c1e14] mb-5 flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${theme.iconBg} ${theme.iconText}`}>
                    <Globe className="w-4 h-4" />
                  </div>
                  רשתות חברתיות
                </h3>
                
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute left-3 top-2.5 text-blue-500"><Globe className="w-4 h-4"/></div>
                      {renderNestedInput('socialLinks', 'facebook', 'קישור לפייסבוק', "bg-white border border-stone-200 rounded-lg pl-9 pr-3 py-2 w-full outline-none focus:border-blue-400 text-left text-sm")}
                    </div>
                    <div className="relative">
                      <div className="absolute left-3 top-2.5 text-pink-500"><Camera className="w-4 h-4"/></div>
                      {renderNestedInput('socialLinks', 'instagram', 'קישור לאינסטגרם', "bg-white border border-stone-200 rounded-lg pl-9 pr-3 py-2 w-full outline-none focus:border-pink-400 text-left text-sm")}
                    </div>
                    <div className="relative">
                      <div className="absolute left-3 top-2.5 text-sky-500"><Network className="w-4 h-4"/></div>
                      {renderNestedInput('socialLinks', 'linkedin', 'קישור ללינקדאין', "bg-white border border-stone-200 rounded-lg pl-9 pr-3 py-2 w-full outline-none focus:border-sky-400 text-left text-sm")}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {person.socialLinks?.facebook && (
                      <a href={person.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-100 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Globe className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-stone-700">פייסבוק</span>
                      </a>
                    )}
                    {person.socialLinks?.instagram && (
                      <a href={person.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-100 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Camera className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-stone-700">אינסטגרם</span>
                      </a>
                    )}
                    {person.socialLinks?.linkedin && (
                      <a href={person.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-100 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Network className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-stone-700">לינקדאין</span>
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
