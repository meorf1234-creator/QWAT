
import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Search, X, Instagram, BookOpen, ArrowLeft, Heart, Sparkles, LayoutGrid, CreditCard, Smartphone, CheckCircle2, Copy, Plus, Trash2, Lock, ExternalLink, FileText } from 'lucide-react';

// --- Types ---
export interface Book {
  id: string;
  title: string;
  author: string;
  price: number | 'free';
  category: string;
  coverImage: string;
  description: string;
  link?: string;
  isPaymentRequired?: boolean;
}

// --- Initial Data ---
const INITIAL_BOOKS: Book[] = [
  {
    id: '1',
    title: 'دليل تخطيط المشاريع للمرافق الصحيه',
    author: 'إدارة وتخطيط',
    price: 'free',
    category: 'إدارة',
    coverImage: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=100&h=100',
    description: 'دليل شامل لتخطيط وإدارة المشاريع الصحية الحديثة.',
    link: 'https://files.fm/f/n7kxz7vf6n'
  },
  {
    id: '2',
    title: 'كتاب التسويق للمرافق الصحيه',
    author: 'تسويق طبي',
    price: 'free',
    category: 'تسويق',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=100&h=100',
    description: 'استراتيجيات التسويق الحديثة المخصصة للعيادات والمراكز الطبية.',
    link: 'https://files.fm/f/h63rceqxfg'
  },
  {
    id: '3',
    title: 'لن تصبح افضل مني',
    author: 'تطوير ذاتي',
    price: 5,
    category: 'تطوير',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=100&h=100',
    description: 'كتاب ملهم في تطوير الذات وبناء العقلية القيادية.',
    isPaymentRequired: true
  }
];

// --- Sub-Components ---
const Logo: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: 'w-10 h-10 text-xl border-2',
    md: 'w-16 h-16 text-3xl border-[4px]',
    lg: 'w-24 h-24 text-5xl border-[6px]'
  };
  return (
    <div className={`flex items-center ${className}`}>
      <div className={`relative flex items-center justify-center bg-white border-red-600 font-black text-black shadow-lg select-none ${sizes[size]}`}>
        4
      </div>
    </div>
  );
};

const BookCard: React.FC<{ book: Book; onAction: (book: Book) => void }> = ({ book, onAction }) => {
  const isBlue = book.isPaymentRequired || book.price !== 'free';
  return (
    <button 
      onClick={() => onAction(book)}
      className={`group w-full flex items-center gap-4 p-3 rounded-2xl border transition-all duration-300 text-right ${
        isBlue 
        ? 'bg-gradient-to-l from-blue-600 to-indigo-700 border-blue-400 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.01]' 
        : 'bg-white border-slate-100 text-slate-800 hover:border-red-200 hover:shadow-md'
      }`}
    >
      <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-colors duration-300 ${
        isBlue ? 'bg-white/20 text-white group-hover:bg-white/30' : 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white'
      }`}>
        {book.isPaymentRequired ? <CreditCard size={20} /> : <FileText size={20} />}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`text-sm font-bold truncate mb-0.5 ${isBlue ? 'text-white' : 'text-slate-800'}`}>{book.title}</h3>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${isBlue ? 'bg-white/20 text-white' : 'bg-red-50 text-red-500'}`}>
            {book.price === 'free' ? 'FREE' : `${book.price}$`}
          </span>
          <span className={`text-[10px] font-medium truncate ${isBlue ? 'text-blue-100' : 'text-slate-400'}`}>{book.author}</span>
        </div>
      </div>
      <div className={`${isBlue ? 'text-white/60 group-hover:text-white' : 'text-slate-300 group-hover:text-red-600'}`}>
        {book.isPaymentRequired ? <CreditCard size={16} /> : <ExternalLink size={16} />}
      </div>
    </button>
  );
};

// --- Main App ---
export default function App() {
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBookForPayment, setSelectedBookForPayment] = useState<Book | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const [newBook, setNewBook] = useState<Partial<Book>>({ title: '', author: '', price: 'free', category: 'أخرى', link: '', isPaymentRequired: false });

  useEffect(() => {
    const savedBooks = localStorage.getItem('qwat_books');
    if (savedBooks) { setBooks(JSON.parse(savedBooks)); } else { setBooks(INITIAL_BOOKS); }
  }, []);

  useEffect(() => { if (books.length > 0) localStorage.setItem('qwat_books', JSON.stringify(books)); }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesCategory = selectedCategory === 'الكل' || book.category === selectedCategory;
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || book.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, books]);

  const categories = useMemo(() => ['الكل', ...Array.from(new Set(books.map(b => b.category)))], [books]);

  const handleBookAction = (book: Book) => {
    if (book.isPaymentRequired) { setSelectedBookForPayment(book); setIsPaymentModalOpen(true); } 
    else if (book.link) { window.open(book.link, '_blank'); }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '122333') { setIsPasscodeModalOpen(false); setIsAdminOpen(true); setPasscode(''); setPasscodeError(false); } 
    else { setPasscodeError(true); setPasscode(''); setTimeout(() => setPasscodeError(false), 2000); }
  };

  const addNewReference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title) return;
    const bookToAdd: Book = {
      id: Date.now().toString(),
      title: newBook.title,
      author: newBook.author || 'إدارة المنصة',
      price: newBook.price === 'free' ? 'free' : Number(newBook.price) || 5,
      category: newBook.category || 'أخرى',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=100&h=100',
      description: '',
      link: newBook.link,
      isPaymentRequired: newBook.isPaymentRequired
    };
    setBooks(prev => [...prev, bookToAdd]);
    setNewBook({ title: '', author: '', price: 'free', category: 'أخرى', link: '', isPaymentRequired: false });
    setIsAdminOpen(false);
  };

  if (!isBrowsing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-[#ffffff] via-[#fcf0f0] to-[#f8f9fa]">
        <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] bg-red-100 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-slate-200 rounded-full blur-[100px] opacity-30"></div>
        
        <div className="max-w-3xl w-full text-center z-10 space-y-12">
          <Logo size="lg" className="justify-center mb-8" />
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/60 backdrop-blur-md rounded-full border border-red-100 shadow-sm">
            <span className="text-sm font-medium text-slate-600">(بإدارة الطالب؛ عبدالرحمن مرتضى)</span>
            <div className="w-px h-4 bg-red-200 mx-1"></div>
            <a href="https://instagram.com/dhf88_" target="_blank" className="text-sm font-bold text-red-600 flex items-center gap-1.5 hover:scale-105 transition-transform"><Instagram size={14}/> dhf88_</a>
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">أهلاً بك في منصة <span className="text-red-600">4</span></h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium">منصتكم الرائدة لعرض واقتناء مراجع طب الأسنان وتطوير الذات المهنية.</p>
          </div>
          <button onClick={() => setIsBrowsing(true)} className="red-btn-gradient text-white px-14 py-5 rounded-full text-xl font-black shadow-2xl shadow-red-500/20 flex items-center gap-3 mx-auto transition-all hover:scale-105 active:scale-95">
            تصفح المراجع <BookOpen />
          </button>
        </div>
        
        <div className="absolute bottom-8 text-slate-400 text-[10px] font-black tracking-[0.2em] uppercase">
           FOUR PLATFORM © 2024 - DENTAL EXCELLENCE
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#fcfcfc] via-[#fff5f5] to-[#fdfdfd]">
      <nav className="glass sticky top-0 z-50 border-b border-slate-200 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsBrowsing(false)} className="p-2 hover:bg-white/80 rounded-full transition-colors"><ArrowLeft size={24} /></button>
          <Logo size="sm" />
        </div>
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <input type="text" placeholder="ابحث عن مهارة..." className="w-full py-2.5 px-10 rounded-2xl bg-white border border-slate-200 text-right focus:ring-2 focus:ring-red-500/10 transition-all outline-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsPasscodeModalOpen(true)} className="p-2.5 bg-slate-900 text-white rounded-xl flex items-center gap-2 shadow-lg hover:bg-black transition-all">
            <Lock size={18} className="text-red-500" /> <span className="hidden sm:block text-xs font-bold">إدارة</span>
          </button>
          <button className="p-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"><ShoppingCart size={22} /></button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-10 flex-grow flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-72 shrink-0 space-y-6">
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-[2rem] border border-slate-200 shadow-sm sticky top-24">
            <h2 className="text-lg font-black mb-5 flex items-center gap-2 text-slate-900"><span className="w-1.5 h-6 bg-red-600 rounded-full"></span> التصنيفات</h2>
            <div className="flex flex-wrap lg:flex-col gap-2">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)} 
                  className={`px-5 py-3 text-right rounded-2xl text-sm font-bold transition-all ${
                    selectedCategory === cat 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' 
                    : 'bg-white/50 text-slate-500 border border-slate-100 hover:bg-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1 space-y-8">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3"><LayoutGrid className="text-red-600" /> المراجع المختارة</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBooks.map(book => (
              <div key={book.id} className="relative group/container">
                <BookCard book={book} onAction={handleBookAction} />
                <button onClick={() => { if(window.confirm('هل أنت متأكد من حذف هذا المرجع؟')) setBooks(prev => prev.filter(b => b.id !== book.id)) }} className="absolute -top-2 -left-2 bg-white p-1.5 rounded-full text-slate-300 hover:text-red-600 shadow-sm opacity-0 group-hover/container:opacity-100 transition-all z-10"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modals remain structurally same but with background updates for visual comfort */}
      {isPasscodeModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <form onSubmit={handlePasscodeSubmit} className="relative w-full max-w-xs bg-white rounded-[2.5rem] p-8 text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-900"><Lock size={32} /></div>
            <h2 className="text-xl font-black mb-2">رمز الدخول</h2>
            <p className="text-xs text-slate-400 mb-6 font-bold">يرجى إدخال رمز التحقق للإدارة</p>
            <input type="password" autoFocus maxLength={6} placeholder="••••••" className={`w-full text-center text-2xl font-black py-3 bg-slate-50 rounded-2xl border-2 mb-4 outline-none transition-all ${passcodeError ? 'border-red-500 animate-shake' : 'border-transparent focus:border-slate-100'}`} value={passcode} onChange={e => setPasscode(e.target.value)} />
            <button type="submit" className="w-full py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all">تحقق</button>
          </form>
        </div>
      )}

      {isAdminOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <form onSubmit={addNewReference} className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-900 p-8 text-white text-right flex items-center justify-between">
              <button type="button" onClick={() => setIsAdminOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X /></button>
              <h2 className="text-xl font-black">إضافة مرجع جديد</h2>
            </div>
            <div className="p-8 space-y-4 text-right">
              <input type="text" required placeholder="عنوان الكتاب" className="w-full p-3.5 bg-slate-50 rounded-2xl text-right outline-none focus:ring-2 focus:ring-red-500/10" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="التصنيف" className="w-full p-3.5 bg-slate-50 rounded-2xl text-right outline-none" value={newBook.category} onChange={e => setNewBook({...newBook, category: e.target.value})} />
                <input type="text" placeholder="السعر (0=مجاني)" className="w-full p-3.5 bg-slate-50 rounded-2xl text-right outline-none" value={newBook.price === 'free' ? '' : newBook.price} onChange={e => setNewBook({...newBook, price: e.target.value === '0' ? 'free' : e.target.value})} />
              </div>
              <input type="url" placeholder="الرابط المباشر" className="w-full p-3.5 bg-slate-50 rounded-2xl text-right outline-none" value={newBook.link} onChange={e => setNewBook({...newBook, link: e.target.value})} />
              <label className="flex items-center justify-end gap-3 p-4 bg-red-50/50 rounded-2xl cursor-pointer border border-red-100 transition-colors hover:bg-red-50">
                <span className="text-xs font-bold text-red-900">تفعيل نافذة الدفع لهذا المرجع</span>
                <input type="checkbox" className="w-5 h-5 accent-red-600" checked={newBook.isPaymentRequired} onChange={e => setNewBook({...newBook, isPaymentRequired: e.target.checked})} />
              </label>
              <button type="submit" className="w-full py-4 bg-red-600 text-white font-black rounded-[1.5rem] shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all">حفظ وإضافة للمنصة</button>
            </div>
          </form>
        </div>
      )}

      {isPaymentModalOpen && selectedBookForPayment && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white text-right">
              <button onClick={() => setIsPaymentModalOpen(false)} className="absolute left-6 top-6 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"><X /></button>
              <h2 className="text-2xl font-black mb-1">طريقة شراء الكتاب</h2>
              <p className="text-blue-100 text-sm font-medium">{selectedBookForPayment.title}</p>
            </div>
            <div className="p-8 space-y-6 text-right">
              <div className="text-center py-5 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                <div className="text-xs text-blue-400 font-black mb-1 uppercase tracking-widest">السعر المطلوب</div>
                <div className="text-5xl font-black text-blue-700">{selectedBookForPayment.price}$</div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-blue-200 transition-all">
                  <button onClick={() => navigator.clipboard.writeText('6042375417')} className="text-slate-300 hover:text-blue-600 transition-colors"><Copy size={16} /></button>
                  <div className="text-right">
                    <div className="font-bold text-[10px] text-slate-400 uppercase">الماستر كارد</div>
                    <div className="text-lg font-black text-blue-600 tracking-wider">6042375417</div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-blue-200 transition-all">
                  <button onClick={() => navigator.clipboard.writeText('07857095906')} className="text-slate-300 hover:text-blue-600 transition-colors"><Copy size={16} /></button>
                  <div className="text-right">
                    <div className="font-bold text-[10px] text-slate-400 uppercase">رصيد (آسيا/زين)</div>
                    <div className="text-lg font-black text-blue-600 tracking-wider">07857095906</div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 rounded-[1.5rem] p-5 text-white text-xs leading-relaxed space-y-2">
                <p>1. قم بتحويل المبلغ المذكور أعلاه</p>
                <p>2. أرسل لقطة شاشة للحساب الرسمي <a href="https://instagram.com/qwat__4" className="text-blue-400 underline font-black" target="_blank">qwat__4</a></p>
                <p>3. سيتم إرسال الرابط لك فوراً</p>
              </div>
              <button onClick={() => window.open('https://instagram.com/qwat__4', '_blank')} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all">إرسال سكرين الدفع الآن</button>
            </div>
          </div>
        </div>
      )}

      <footer className="py-12 border-t border-slate-100 mt-auto bg-white/40 text-center">
        <div className="container mx-auto px-4 flex flex-col items-center gap-4">
          <Logo size="sm" />
          <div className="text-slate-400 text-[9px] font-black tracking-[0.3em] uppercase opacity-60">
            4 Healthcare Design & Dev | (بإدارة عبدالرحمن مرتضى) | INSTA: dhf88_
          </div>
        </div>
      </footer>
    </div>
  );
}
