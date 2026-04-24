'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, UserPlus, Link2, Search, ChevronDown } from 'lucide-react';
import { useFamilyStore, PersonFormData, AddFamilyMemberPayload } from '../../lib/store';
import { Person, Union } from '../../lib/types';

const CY = new Date().getFullYear();
const EMPTY: PersonFormData = { fullName: '', birthYear: 1980, gender: 'female', isAlive: true };

// --- Tabs ---------------------------------------------------------------------
const TABS = ['בסיסי', 'פרטי קשר', 'ביוגרפיה'] as const;
type Tab = typeof TABS[number];

// --- Autocomplete -------------------------------------------------------------
function Autocomplete({ value, onChange, onSelect, onClear, persons, locked }: {
  value: string; onChange: (v: string) => void;
  onSelect: (p: Person) => void; onClear: () => void;
  persons: Person[]; locked: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const results = value.length >= 1 ? persons.filter(p => p.fullName.includes(value)).slice(0, 5) : [];

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
        <input
          className={`w-full h-9 pr-9 pl-3 border rounded-lg text-sm outline-none transition-all ${locked ? 'bg-slate-100 text-slate-500' : 'bg-white border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'}`}
          value={value} readOnly={locked} dir="rtl"
          placeholder="חפש שם קיים או הקלד חדש..."
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => !locked && setOpen(true)}
        />
        {locked && (
          <button onClick={onClear} className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-300">
            <X size={11} />
          </button>
        )}
      </div>
      {open && results.length > 0 && !locked && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {results.map(p => (
            <button key={p.id} onMouseDown={() => { onSelect(p); setOpen(false); }}
              className="w-full flex justify-between items-center px-3 py-2 text-sm hover:bg-indigo-50 border-b border-slate-100 last:border-0" dir="rtl">
              <span className="font-semibold text-slate-800">{p.fullName}</span>
              <span className="text-slate-400 text-xs">{p.birthYear}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Field Wrappers -----------------------------------------------------------
const Lbl = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">{children}</label>
);
const Inp = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`w-full h-9 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white ${props.className ?? ''}`} />
);
const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white resize-none" />
);

// --- Person Form --------------------------------------------------------------
function PersonForm({ form, onChange, persons, tab }: {
  form: PersonFormData;
  onChange: (f: PersonFormData) => void;
  persons: Person[];
  tab: Tab;
}) {
  const locked = !!form.existingPersonId;
  const set = <K extends keyof PersonFormData>(k: K, v: PersonFormData[K]) => onChange({ ...form, [k]: v });

  const handleSelect = (p: Person) => onChange({
    ...form, fullName: p.fullName, birthYear: p.birthYear,
    gender: p.gender, isAlive: p.isAlive, deathYear: p.deathYear, existingPersonId: p.id,
  });

  if (tab === 'בסיסי') return (
    <div className="flex flex-col gap-3">
      <div>
        <Lbl>שם מלא</Lbl>
        <Autocomplete value={form.fullName} onChange={v => set('fullName', v)}
          onSelect={handleSelect} onClear={() => set('existingPersonId', undefined)}
          persons={persons} locked={locked} />
        {locked && (
          <div className="flex items-center gap-1 mt-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
            <Link2 size={11} /> <span>קיים בעץ — יחובר בלבד</span>
          </div>
        )}
      </div>

      {!locked && (
        <>
          <div>
            <Lbl>שם נעורים</Lbl>
            <Inp value={form.maidenName ?? ''} onChange={e => set('maidenName', e.target.value)} placeholder="אופציונלי" dir="rtl" />
          </div>

          <div>
            <Lbl>מגדר</Lbl>
            <div className="flex gap-2">
              {(['male', 'female', 'other'] as const).map(g => (
                <button key={g} onClick={() => set('gender', g)}
                  className={`flex-1 h-9 rounded-lg text-sm font-medium border transition-all ${form.gender === g ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
                  {g === 'male' ? 'גבר' : g === 'female' ? 'אישה' : 'אחר'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Lbl>שנת לידה</Lbl>
              <Inp type="number" min={1900} max={CY} value={form.birthYear} onChange={e => set('birthYear', +e.target.value)} />
            </div>
            <div className="flex-1">
              <Lbl>תאריך לידה מלא</Lbl>
              <Inp type="date" value={form.birthDate ?? ''} onChange={e => set('birthDate', e.target.value)} />
            </div>
          </div>

          <div>
            <Lbl>מקום לידה</Lbl>
            <Inp value={form.birthPlace ?? ''} onChange={e => set('birthPlace', e.target.value)} placeholder="עיר, מדינה" dir="rtl" />
          </div>

          <div>
            <Lbl>סטטוס</Lbl>
            <button onClick={() => onChange({ ...form, isAlive: !form.isAlive, deathYear: undefined, deathDate: undefined })}
              className={`h-9 px-4 rounded-lg text-sm font-semibold border ${form.isAlive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
              {form.isAlive ? '✓ בחיים' : '† נפטר/ה'}
            </button>
          </div>

          {!form.isAlive && (
            <div className="flex gap-2">
              <div className="flex-1">
                <Lbl>שנת פטירה</Lbl>
                <Inp type="number" min={form.birthYear} max={CY} value={form.deathYear ?? CY} onChange={e => set('deathYear', +e.target.value)} />
              </div>
              <div className="flex-1">
                <Lbl>תאריך פטירה מלא</Lbl>
                <Inp type="date" value={form.deathDate ?? ''} onChange={e => set('deathDate', e.target.value)} />
              </div>
            </div>
          )}

          {!form.isAlive && (
            <div className="flex gap-2">
              <div className="flex-1">
                <Lbl>מקום פטירה</Lbl>
                <Inp value={form.deathPlace ?? ''} onChange={e => set('deathPlace', e.target.value)} placeholder="עיר" dir="rtl" />
              </div>
              <div className="flex-1">
                <Lbl>מקום קבורה</Lbl>
                <Inp value={form.burialPlace ?? ''} onChange={e => set('burialPlace', e.target.value)} placeholder="בית עלמין" dir="rtl" />
              </div>
            </div>
          )}

          <div>
            <Lbl>תמונה (URL)</Lbl>
            <Inp type="url" value={form.photoUrl ?? ''} onChange={e => set('photoUrl', e.target.value)} placeholder="https://..." dir="ltr" />
          </div>
        </>
      )}
    </div>
  );

  if (tab === 'פרטי קשר') return (
    <div className="flex flex-col gap-3">
      <div>
        <Lbl>טלפון</Lbl>
        <Inp type="tel" value={form.phoneNumber ?? ''} onChange={e => set('phoneNumber', e.target.value)} placeholder="050-0000000" dir="ltr" />
      </div>
      <div>
        <Lbl>אימייל</Lbl>
        <Inp type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value)} placeholder="example@mail.com" dir="ltr" />
      </div>
      <div>
        <Lbl>מדינה</Lbl>
        <Inp value={form.address?.country ?? ''} onChange={e => set('address', { ...form.address, country: e.target.value })} placeholder="ישראל" dir="rtl" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <Lbl>עיר</Lbl>
          <Inp value={form.address?.city ?? ''} onChange={e => set('address', { ...form.address, city: e.target.value })} placeholder="תל אביב" dir="rtl" />
        </div>
        <div className="flex-1">
          <Lbl>רחוב</Lbl>
          <Inp value={form.address?.street ?? ''} onChange={e => set('address', { ...form.address, street: e.target.value })} placeholder="רחוב הרצל 1" dir="rtl" />
        </div>
      </div>
      <div>
        <Lbl>פייסבוק</Lbl>
        <Inp value={form.socialLinks?.facebook ?? ''} onChange={e => set('socialLinks', { ...form.socialLinks, facebook: e.target.value })} placeholder="https://facebook.com/..." dir="ltr" />
      </div>
      <div>
        <Lbl>אינסטגרם</Lbl>
        <Inp value={form.socialLinks?.instagram ?? ''} onChange={e => set('socialLinks', { ...form.socialLinks, instagram: e.target.value })} placeholder="@username" dir="ltr" />
      </div>
      <div>
        <Lbl>לינקדאין</Lbl>
        <Inp value={form.socialLinks?.linkedin ?? ''} onChange={e => set('socialLinks', { ...form.socialLinks, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." dir="ltr" />
      </div>
    </div>
  );

  // --- Biography ---
  return (
    <div className="flex flex-col gap-3">
      <div>
        <Lbl>מקצוע / עיסוק</Lbl>
        <Inp value={form.occupation ?? ''} onChange={e => set('occupation', e.target.value)} placeholder="רופא, מורה, מהנדס..." dir="rtl" />
      </div>
      <div>
        <Lbl>סיפור חיים / הערות</Lbl>
        <Textarea rows={6} value={form.bio ?? ''} onChange={e => set('bio', e.target.value)} placeholder="כתוב כאן זיכרונות, עובדות מעניינות, סיפורים..." dir="rtl" />
      </div>
    </div>
  );
}

// --- Main Drawer --------------------------------------------------------------
export default function AddFamilyMemberDrawer() {
  const { addDrawerOpen, addContext, persons, unions, closeAddDrawer, addFamilyMember } = useFamilyStore();

  const sourcePerson = addContext && 'sourcePersonId' in addContext ? persons.find(p => p.id === addContext.sourcePersonId) : undefined;
  const sourceUnion  = addContext && 'sourceUnionId'  in addContext ? unions.find(u => u.id === addContext.sourceUnionId)   : undefined;

  const [tab, setTab] = useState<Tab>('בסיסי');
  const [primary, setPrimary] = useState<PersonFormData>({ ...EMPTY });
  const [secondParent, setSecondParent] = useState<PersonFormData>({ ...EMPTY, gender: 'male' });
  const [showSecond, setShowSecond] = useState(false);
  const [uStatus, setUStatus] = useState<Union['status']>('married');
  const [uYear, setUYear] = useState(CY);

  useEffect(() => {
    if (!addDrawerOpen) return;
    const g = sourcePerson ? (sourcePerson.gender === 'male' ? 'female' : 'male') : 'female';
    const by = sourcePerson?.birthYear ?? (sourceUnion?.marriageYear ? sourceUnion.marriageYear + 1 : 1980);
    setPrimary({ ...EMPTY, gender: g, birthYear: by });
    setSecondParent({ ...EMPTY, gender: g === 'male' ? 'female' : 'male' });
    setShowSecond(false);
    setTab('בסיסי');
    setUStatus('married');
    setUYear(sourceUnion?.marriageYear ?? CY);
  }, [addDrawerOpen, sourcePerson, sourceUnion]);

  const title = !addContext ? 'הוסף אדם' :
    addContext.action === 'add_partner' ? `הוסף בן/בת זוג ל${sourcePerson?.fullName ?? ''}` :
    addContext.action === 'add_child'   ? 'הוסף ילד/ה' :
    addContext.action === 'add_parent'  ? `הוסף הורה ל${sourcePerson?.fullName ?? ''}` : 'הוסף אדם';

  const showUnionFields = addContext?.action === 'add_partner' || addContext?.action === 'add_parent';

  const handleSubmit = () => {
    if (!primary.fullName?.trim() && !primary.existingPersonId) return;
    const payload: AddFamilyMemberPayload = {
      primary, unionStatus: uStatus, unionMarriageYear: uYear,
      ...(showSecond ? { secondParent } : {}),
    };
    addFamilyMember(payload);
  };

  if (!addDrawerOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[999]" onClick={closeAddDrawer} />
      <aside className="fixed top-0 right-0 bottom-0 w-[420px] max-w-[95vw] bg-white shadow-2xl z-[1000] flex flex-col rounded-l-2xl overflow-hidden"
        style={{ animation: 'slideIn .28s cubic-bezier(.32,1,.64,1)' }} dir="rtl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white flex-shrink-0">
          <h2 className="text-[15px] font-bold">{title}</h2>
          <button onClick={closeAddDrawer} className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50 flex-shrink-0">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-semibold transition-all border-b-2 ${tab === t ? 'border-indigo-500 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <PersonForm form={primary} onChange={setPrimary} persons={persons} tab={tab} />

          {/* Union fields */}
          {tab === 'בסיסי' && showUnionFields && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">פרטי הקשר</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Lbl>סטטוס</Lbl>
                  <div className="relative">
                    <select value={uStatus} onChange={e => setUStatus(e.target.value as Union['status'])}
                      className="w-full h-9 pr-3 pl-7 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-400 appearance-none">
                      <option value="married">נשוי/ה</option>
                      <option value="divorced">גרוש/ה</option>
                      <option value="partnered">ידוע בציבור</option>
                      <option value="separated">נפרד/ת</option>
                    </select>
                    <ChevronDown size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex-1">
                  <Lbl>שנת נישואים</Lbl>
                  <Inp type="number" min={1900} max={CY} value={uYear} onChange={e => setUYear(+e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Second parent */}
          {tab === 'בסיסי' && addContext?.action === 'add_parent' && (
            showSecond
              ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">הורה שני</p>
                    <button onClick={() => setShowSecond(false)} className="w-5 h-5 rounded-full bg-red-100 text-red-400 flex items-center justify-center hover:bg-red-200">
                      <X size={11} />
                    </button>
                  </div>
                  <PersonForm form={secondParent} onChange={setSecondParent} persons={persons} tab="בסיסי" />
                </div>
              )
              : (
                <button onClick={() => setShowSecond(true)}
                  className="flex items-center gap-2 py-3 px-4 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 font-semibold hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all">
                  <UserPlus size={15} /> + הוסף הורה שני (אופציונלי)
                </button>
              )
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
          <button onClick={closeAddDrawer} className="flex-1 h-10 rounded-xl text-sm font-semibold bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors">ביטול</button>
          <button onClick={handleSubmit}
            disabled={!primary.fullName?.trim() && !primary.existingPersonId}
            className="flex-1 h-10 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,.35)' }}>
            {primary.existingPersonId ? 'חבר לעץ' : 'צור והוסף לעץ'}
          </button>
        </div>
      </aside>

      <style>{`@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    </>
  );
}
