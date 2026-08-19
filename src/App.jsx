import React, { useState, useEffect } from 'react';
import { db, auth, googleProvider, storage } from './firebase';
import { 
  collection, getDocs, addDoc, updateDoc, doc, deleteDoc, onSnapshot, query, orderBy, increment, where 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import ReCAPTCHA from "react-google-recaptcha"; 

// ----------------------------------------------------
// MAIN SETTINGS (KUNCI RECAPTCHA BAHARU DIMASUKKAN)
// ----------------------------------------------------
const WHATSAPP_NUMBER = "60194155722"; 
const ADMIN_EMAILS = ['juscinta89@gmail.com']; 
const QR_PAYMENT_URL = "https://i.postimg.cc/wjk126Zs/qr-code.png"; 
const TELEGRAM_BOT_TOKEN = "8636588086:AAHTfHyVL5xCjBMG3R17oAaaeIzgwmodSEw"; 
const TELEGRAM_CHAT_ID = "-5504733427"; 

// INI KUNCI BARU ANDA
const RECAPTCHA_SITE_KEY = "6LdqCo4tAAAAAF_VE2TTRCIo41RARvKcoBRP-DoC"; 

const Icons = {
  Cart: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>,
  Menu: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  WhatsApp: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>,
  CheckCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
  Dashboard: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Minus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  ArrowLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
  Upload: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
  Printer: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>,
  Store: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
  Orders: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>,
  LogOut: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
  LogIn: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>,
  Truck: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
  Box: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  TrendingUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
  ClipboardList: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  FileUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><polyline points="9 15 12 12 15 15"></polyline></svg>,
  ShieldCheck: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>,
  MessageSquare: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
};

const MOCK_CATEGORIES = ['3D PRINT', 'ROBOT PARTS', 'ELECTRONICS', 'STEM / EDUCATION', 'CUSTOM 3D PRINT'];

export default function App() {
  const [view, setView] = useState('home'); 
  const [user, setUser] = useState(null); 
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customRequests, setCustomRequests] = useState([]); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const LOGO_URL = import.meta.env.BASE_URL + 'icon.png';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const role = ADMIN_EMAILS.includes(currentUser.email) ? 'admin' : 'customer';
        setUser({ uid: currentUser.uid, name: currentUser.displayName, email: currentUser.email, role });
      } else {
        setUser(null);
        if (view.includes('admin') || view === 'myorders') setView('home');
      }
    });
    return () => unsubscribe();
  }, [view]);

  // Fetch Products
  useEffect(() => {
    const q = query(collection(db, "products"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Orders & Custom Requests
  useEffect(() => {
    if (user) {
      let qOrders;
      if (user.role === 'admin') {
        qOrders = query(collection(db, "orders"), orderBy("date", "desc"));
        const qRequests = query(collection(db, "custom_requests"), orderBy("date", "desc"));
        onSnapshot(qRequests, (snapshot) => {
          setCustomRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
      } else {
        qOrders = query(collection(db, "orders"), where("email", "==", user.email));
      }
      const unsubscribe = onSnapshot(qOrders, (querySnapshot) => {
        let ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (user.role !== 'admin') {
          ordersData.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        setOrders(ordersData);
      });
      return () => unsubscribe();
    } else {
      setOrders([]);
      setCustomRequests([]);
    }
  }, [user]);

  const navigateTo = (newView, data = null) => {
    setView(newView);
    if (newView === 'product') setSelectedProduct(data);
    if (newView === 'receipt') setSelectedOrder(data);
    setIsSidebarOpen(false);
    window.scrollTo(0, 0);
  };

  const addToCart = (product, quantity, notes = '') => {
    const cartItemId = notes ? `${product.id}-${Date.now()}` : product.id;
    const existingItem = cart.find(item => item.cartItemId === cartItemId);
    
    if (existingItem) {
      setCart(cart.map(item => item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + quantity } : item));
    } else {
      setCart([...cart, { ...product, cartItemId, quantity, notes }]);
    }
  };

  const updateQuantity = (cartItemId, delta) => {
    setCart(cart.map(item => {
      if (item.cartItemId === cartItemId) return { ...item, quantity: Math.max(1, item.quantity + delta) };
      return item;
    }));
  };

  const removeFromCart = (cartItemId) => setCart(cart.filter(item => item.cartItemId !== cartItemId));
  
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTotalWeight = cart.reduce((sum, item) => sum + ((item.weight || 100) * item.quantity), 0);

  const handleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } 
    catch (error) { console.error("Login failed:", error); }
  };
  const handleLogout = () => { signOut(auth); };

  const Sidebar = () => (
    <>
      <div className="md:hidden bg-white shadow-sm border-b border-slate-200 flex justify-between items-center px-4 h-14 fixed top-0 w-full z-40 print:hidden">
        <div className="flex items-center gap-2">
          <img src={LOGO_URL} alt="Logo" className="w-8 h-8 object-contain" onError={(e) => e.target.style.display='none'} />
          <span className="text-xl font-black tracking-tighter text-blue-600">3D<span className="text-slate-900">STORE</span></span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 p-2"><Icons.Menu /></button>
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 z-40 md:hidden print:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      <div className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-out z-50 flex flex-col print:hidden shadow-2xl`}>
        
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950 gap-3">
          <img src={LOGO_URL} alt="Logo" className="w-8 h-8 object-contain drop-shadow-md" onError={(e) => e.target.style.display='none'} />
          <span className="text-2xl font-black tracking-tighter text-white">3D<span className="text-blue-500">STORE</span></span>
        </div>

        {user && (
          <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/50">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Welcome back,</p>
            <p className="text-sm font-bold text-white line-clamp-1">{user.name}</p>
            <p className="text-[10px] text-blue-400 mt-1 uppercase tracking-wider">{user.role}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-2">Main Menu</p>
          <button onClick={() => navigateTo('home')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium ${view === 'home' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Icons.Store /> Store</button>
          
          <button onClick={() => navigateTo('custom_print')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium ${view === 'custom_print' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Icons.FileUp /> Custom 3D Print
          </button>

          <button onClick={() => navigateTo('cart')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium relative ${view === 'cart' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Icons.Cart /> Cart
            {cart.length > 0 && <span className={`absolute right-4 text-xs font-bold px-2 py-0.5 rounded-full ${view === 'cart' ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'}`}>{cart.length}</span>}
          </button>
          
          {user && user.role !== 'admin' && (
            <button onClick={() => navigateTo('myorders')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium ${view === 'myorders' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Icons.Orders /> My Orders</button>
          )}

          <button onClick={() => navigateTo('policies')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium ${view === 'policies' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Icons.ShieldCheck /> Policies & FAQ
          </button>

          {user?.role === 'admin' && (
            <>
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-6">Administration</p>
              <button onClick={() => navigateTo('admin_dashboard')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium ${view === 'admin_dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Icons.TrendingUp /> Dashboard</button>
              <button onClick={() => navigateTo('admin_orders')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium ${view === 'admin_orders' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Icons.ClipboardList /> Manage Orders</button>
              
              <button onClick={() => navigateTo('admin_quotes')} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg font-medium ${view === 'admin_quotes' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                <div className="flex items-center gap-3"><Icons.MessageSquare /> Manage Quotes</div>
                {customRequests.filter(r=>r.status==='NEW').length > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{customRequests.filter(r=>r.status==='NEW').length}</span>}
              </button>

              <button onClick={() => navigateTo('admin_products')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium ${view === 'admin_products' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Icons.Box /> Manage Products</button>
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          {user ? (
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-red-400 hover:bg-slate-800 hover:text-red-300"><Icons.LogOut /> Logout</button>
          ) : (
            <button onClick={handleLogin} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-500"><Icons.LogIn /> Login</button>
          )}
        </div>
      </div>
    </>
  );

  const TopHeader = () => (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 h-14 flex items-center justify-between px-4 sm:px-6 print:hidden">
      <div className="flex items-center gap-3">
        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-600 p-2 -ml-2 rounded-lg hover:bg-slate-100"><Icons.Menu /></button>
        <div className="md:hidden flex items-center gap-2">
          <img src={LOGO_URL} alt="Logo" className="w-7 h-7 object-contain" onError={(e) => e.target.style.display='none'} />
          <span className="text-lg font-black tracking-tighter text-blue-600">3D<span className="text-slate-900">STORE</span></span>
        </div>
        <h2 className="hidden md:block text-lg font-black text-slate-800 capitalize tracking-wide">{view === 'home' ? 'Store' : view.replace('_', ' ')}</h2>
      </div>
      <div className="flex items-center gap-4">
         {user && <span className="hidden md:block text-sm font-bold text-slate-500">Hi, {user.name.split(' ')[0]}</span>}
         <button onClick={() => navigateTo('cart')} className="relative p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full">
           <Icons.Cart />
           {cart.length > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm">{cart.length}</span>}
         </button>
      </div>
    </div>
  );

  const HomeView = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-slate-900 text-white overflow-hidden relative rounded-2xl border border-slate-800 shadow-md h-64 md:h-80 flex items-center justify-center">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500 via-slate-900 to-slate-900"></div>
          <div className="absolute right-[-10%] top-[-20%] w-[350px] md:w-[500px] opacity-15 pointer-events-none mix-blend-screen">
            <img src={LOGO_URL} alt="Watermark" className="w-full h-full object-contain filter grayscale" onError={(e) => e.target.style.display='none'} />
          </div>
          <div className="absolute left-[-10%] bottom-[-20%] w-[250px] md:w-[350px] opacity-10 pointer-events-none mix-blend-screen">
            <img src={LOGO_URL} alt="Watermark" className="w-full h-full object-contain filter grayscale" onError={(e) => e.target.style.display='none'} />
          </div>
          <div className="max-w-3xl px-6 relative z-10 text-center mx-auto">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-4 drop-shadow-lg">PRINT • BUILD <br/><span className="text-blue-500">INNOVATE</span></h1>
            <p className="text-slate-300 max-w-xl mx-auto text-xs md:text-sm drop-shadow-md">Premium 3D printing services and robotics components for makers, schools, and STEM projects.</p>
          </div>
        </div>

        <div className="py-6 mt-2">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-lg font-black text-slate-900 w-full md:w-auto">All Products</h2>
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Icons.Search />
              </div>
              <input 
                type="text" 
                placeholder="Search parts, 3D prints..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
              />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded-xl text-slate-500 text-center">
              {searchTerm ? `Tiada produk dijumpai untuk carian "${searchTerm}".` : 'No products available at the moment.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className="relative aspect-square overflow-hidden bg-slate-50 flex items-center justify-center p-4 border-b border-slate-100">
                    <img src={product.image || 'https://placehold.co/400x400?text=No+Image'} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400?text=Error'; }} alt={product.name} className="w-full h-full object-contain" />
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur text-[9px] font-bold px-2 py-1 rounded text-slate-700 uppercase tracking-wide border border-slate-200">{product.category}</div>
                  </div>
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1 leading-tight text-sm">{product.name}</h3>
                      <p className="text-xs text-slate-500 mb-3 line-clamp-2">{product.description}</p>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-base font-black text-blue-600">RM {product.price.toFixed(2)}</span>
                        <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wide ${product.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{product.stock > 0 ? `Stock: ${product.stock}` : 'Sold Out'}</span>
                      </div>
                      <button onClick={() => navigateTo('product', product)} className="w-full py-2 bg-slate-900 text-white rounded-md font-bold text-xs flex justify-center items-center gap-2">View Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const ProductView = () => {
    const [qty, setQty] = useState(1);
    const [notes, setNotes] = useState('');

    if (!selectedProduct) return null;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => navigateTo('home')} className="flex items-center text-slate-500 font-bold mb-4 text-sm gap-1 w-fit">
          <Icons.ArrowLeft /> Back
        </button>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-slate-50 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-200">
            <img src={selectedProduct.image} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400?text=Error'; }} alt={selectedProduct.name} className="w-full max-w-xs rounded-xl object-contain drop-shadow-md" />
          </div>
          <div className="md:w-1/2 p-6 lg:p-10 flex flex-col justify-center">
            <span className="text-blue-600 font-bold text-[10px] tracking-widest uppercase mb-1">{selectedProduct.category}</span>
            <h1 className="text-2xl font-black text-slate-900 mb-3">{selectedProduct.name}</h1>
            <p className="text-slate-600 text-sm mb-6">{selectedProduct.description}</p>
            
            <div className="mb-6 border-b border-slate-100 pb-6 flex justify-between items-center">
              <div>
                <span className="text-3xl font-black text-slate-900 block">RM {selectedProduct.price.toFixed(2)}</span>
                <span className="text-xs text-slate-400 font-bold mt-1 block">Weight: {selectedProduct.weight || 100}g / unit</span>
              </div>
              <span className={`px-3 py-1 rounded font-bold text-xs uppercase tracking-wide ${selectedProduct.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{selectedProduct.stock > 0 ? `Stock: ${selectedProduct.stock}` : 'Sold Out'}</span>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Quantity</label>
                <div className="flex items-center border border-slate-200 rounded-lg w-28 bg-slate-50">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2.5 text-slate-500"><Icons.Minus /></button>
                  <span className="flex-1 text-center font-bold text-sm">{qty}</span>
                  <button onClick={() => setQty(Math.min(selectedProduct.stock, qty + 1))} className="p-2.5 text-slate-500"><Icons.Plus /></button>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="2" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none" placeholder="e.g. Senarai nama untuk nametag..."></textarea>
              </div>

              <button onClick={() => { addToCart(selectedProduct, qty, notes); navigateTo('cart'); }} disabled={selectedProduct.stock <= 0} className={`w-full py-3.5 rounded-lg font-bold text-sm uppercase tracking-wide flex justify-center items-center gap-2 ${selectedProduct.stock > 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}>
                <Icons.Cart /> {selectedProduct.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CartView = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-xl font-black mb-6 text-slate-900">Shopping Cart</h1>
      {cart.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center">
          <p className="text-slate-500 mb-4 text-sm">Your cart is currently empty.</p>
          <button onClick={() => navigateTo('home')} className="bg-blue-600 text-white px-6 py-2.5 rounded-md font-bold text-sm">Continue Shopping</button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            {cart.map((item) => (
              <div key={item.cartItemId} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img src={item.image} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400?text=Error'; }} alt={item.name} className="w-16 h-16 object-cover rounded bg-slate-50 border border-slate-100" />
                <div className="flex-1 w-full">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{item.name}</h3>
                  <div className="flex gap-3 items-center">
                    <p className="text-sm font-black text-blue-600">RM {item.price.toFixed(2)}</p>
                    <p className="text-[10px] font-bold text-slate-400">{((item.weight || 100) * item.quantity)}g</p>
                  </div>
                  {item.notes && (
                    <div className="mt-1.5 bg-slate-50 p-1.5 rounded text-[10px] text-slate-500 border border-slate-100 whitespace-pre-wrap">
                      <span className="font-bold block mb-0.5">Notes: </span>{item.notes}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto gap-4 mt-2 sm:mt-0">
                  <div className="flex items-center border border-slate-200 rounded-md bg-slate-50">
                    <button onClick={() => updateQuantity(item.cartItemId, -1)} className="p-2 text-slate-500"><Icons.Minus /></button>
                    <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartItemId, 1)} className="p-2 text-slate-500"><Icons.Plus /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.cartItemId)} className="p-2 text-red-500 bg-red-50 rounded-md"><Icons.Trash /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:w-72">
            <div className="bg-white p-5 rounded-xl border border-slate-200 sticky top-20">
              <div className="space-y-2 border-b border-slate-100 pb-3 mb-3">
                <div className="flex justify-between text-xs text-slate-500 font-medium"><span>Subtotal</span><span>RM {cartSubtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs text-slate-500 font-medium"><span>Total Weight</span><span>{(cartTotalWeight / 1000).toFixed(2)} KG</span></div>
              </div>
              <div className="flex justify-between mb-5 text-lg font-black text-slate-900"><span>Total</span><span>RM {cartSubtotal.toFixed(2)}</span></div>
              <button onClick={() => navigateTo('checkout')} className="w-full bg-blue-600 text-white py-3 rounded-md font-bold text-xs uppercase tracking-wide">Checkout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const CheckoutView = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [region, setRegion] = useState('');
    const [captchaValue, setCaptchaValue] = useState(null); 

    let shippingFee = 0;
    if (cartTotalWeight > 0 && region !== '') {
      const baseFee = region === 'Semenanjung' ? 8 : 15; 
      const extraFee = region === 'Semenanjung' ? 3 : 5; 
      if (cartTotalWeight <= 1000) { shippingFee = baseFee; } 
      else {
        const extraBlocks = Math.ceil((cartTotalWeight - 1000) / 500);
        shippingFee = baseFee + (extraBlocks * extraFee);
      }
    }
    const grandTotal = cartSubtotal + shippingFee;

    const handleCheckoutSubmit = async (e) => {
      e.preventDefault();
      
      if (!captchaValue) { 
        alert("Sila tandakan kotak 'I'm not a robot' (reCAPTCHA) terlebih dahulu untuk meneruskan."); 
        return; 
      }
      if (!region) { alert("Please select a shipping region."); return; }

      setIsSubmitting(true);
      const formData = new FormData(e.target);
      const orderId = `ORD-${Date.now().toString().slice(-6)}`;
      const receiptFile = formData.get('receipt');
      let receiptUrl = '';

      try {
        if (receiptFile && receiptFile.size > 0) {
          const storageRef = ref(storage, `receipts/${orderId}-${receiptFile.name}`);
          await uploadBytes(storageRef, receiptFile);
          receiptUrl = await getDownloadURL(storageRef);
        }

        const orderData = {
          orderId, date: new Date().toISOString(),
          customerName: formData.get('name'), phone: formData.get('phone'),
          email: user?.email || formData.get('email') || 'Guest',
          address: formData.get('address'), region, items: cart,
          totalWeight: cartTotalWeight, subtotal: cartSubtotal,
          shippingFee, total: grandTotal, receiptUrl, status: 'PENDING'
        };
        
        await addDoc(collection(db, "orders"), orderData);

        for (const item of cart) {
          await updateDoc(doc(db, "products", item.id), { stock: increment(-item.quantity) });
        }
        
        if (TELEGRAM_BOT_TOKEN !== "LETAK_TOKEN_BOT_DI_SINI" && TELEGRAM_CHAT_ID !== "LETAK_CHAT_ID_DI_SINI") {
          const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
          const telegramMessage = `🚨 *ORDER BARU MASUK!*\n\n*ID:* \`${orderId}\`\n*Pelanggan:* ${orderData.customerName}\n*Lokasi:* ${orderData.region}\n*Total:* RM ${grandTotal.toFixed(2)}\n\nSila semak Papan Pemuka Admin segera!`;
          
          try {
            await fetch(telegramUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: telegramMessage, parse_mode: 'Markdown' })
            });
          } catch (err) { console.log("Telegram Notif Error: ", err); }
        }

        let waText = `*NEW ORDER (3D STORE)*\n\n`;
        waText += `*Order ID:* ${orderId}\n*Name:* ${orderData.customerName}\n*Phone:* ${orderData.phone}\n`;
        waText += `*Address:* ${orderData.address}\n*Region:* ${orderData.region}\n\n*Items:*\n`;
        cart.forEach(item => {
           waText += `- ${item.quantity}x ${item.name} (RM ${item.price.toFixed(2)})\n`;
           if (item.notes) waText += `  _Notes:\n${item.notes}_\n`;
        });
        waText += `\n*Subtotal:* RM ${cartSubtotal.toFixed(2)}\n*Shipping:* RM ${shippingFee.toFixed(2)}\n*TOTAL:* RM ${grandTotal.toFixed(2)}`;
        
        const waLink = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(waText)}`;
        setCompletedOrder({ ...orderData, waLink });
        
        setTimeout(() => { try { window.open(waLink, '_blank'); } catch(err) {} }, 100);
        setCart([]); setView('success'); window.scrollTo(0,0);
      } catch (error) {
        alert(`Failed to place order!\nError: ${error.message}`);
      }
      setIsSubmitting(false);
    };

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-xl font-black mb-6 text-slate-900">Checkout</h1>
        <form onSubmit={handleCheckoutSubmit} className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 h-fit">
            <h2 className="text-sm font-bold mb-4 border-b border-slate-100 pb-3">Shipping Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Full Name *</label><input required name="name" defaultValue={user?.name || ''} className="w-full border border-slate-200 rounded p-2 text-sm outline-none" /></div>
                <div><label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Phone No *</label><input required name="phone" type="tel" className="w-full border border-slate-200 rounded p-2 text-sm outline-none" placeholder="0194155722" /></div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Region *</label>
                <select required value={region} onChange={(e) => setRegion(e.target.value)} className="w-full border border-slate-200 rounded p-2 text-sm outline-none font-medium">
                  <option value="" disabled>Select Region...</option>
                  <option value="Semenanjung">Peninsular Malaysia</option>
                  <option value="Sabah / Sarawak">Sabah & Sarawak</option>
                </select>
              </div>
              <div><label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Full Address *</label><textarea required name="address" rows="3" className="w-full border border-slate-200 rounded p-2 text-sm outline-none"></textarea></div>
            </div>
          </div>
          <div className="lg:w-[350px]">
            <div className="bg-slate-900 p-5 rounded-2xl text-white sticky top-20 border border-slate-800 shadow-md">
              <h2 className="text-sm font-bold mb-4 border-b border-slate-800 pb-2">Payment Summary</h2>
              <div className="space-y-2 mb-4 text-xs text-slate-400">
                <div className="flex justify-between"><span>Subtotal</span><span>RM {cartSubtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Weight</span><span>{(cartTotalWeight / 1000).toFixed(2)} KG</span></div>
                <div className="flex justify-between font-bold text-blue-400"><span>Shipping ({region || '...'})</span><span>{region ? `RM ${shippingFee.toFixed(2)}` : '-'}</span></div>
              </div>
              <div className="flex justify-between items-center mb-5 pb-5 border-b border-slate-800">
                <span className="font-bold text-sm">Total Pay</span><span className="text-2xl font-black text-white">RM {grandTotal.toFixed(2)}</span>
              </div>
              <div className="bg-white p-3 rounded-lg mb-5 text-center text-slate-900">
                <p className="text-[9px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Scan to Pay</p>
                <img src={QR_PAYMENT_URL} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400?text=No+QR'; }} className="w-32 h-32 mx-auto object-contain mb-1 rounded" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-800">Maybank MAE</p>
              </div>
              <div className="mb-5">
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Upload Receipt *</label>
                <input required type="file" name="receipt" accept="image/*,application/pdf" className="w-full border border-slate-700 rounded p-1.5 bg-slate-800 text-[10px] text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-blue-600 file:text-white" />
              </div>

              <div className="mb-4 flex justify-center">
                <ReCAPTCHA sitekey={RECAPTCHA_SITE_KEY} onChange={(value) => setCaptchaValue(value)} theme="dark" />
              </div>

              <button disabled={isSubmitting || region === '' || !captchaValue} type="submit" className={`w-full py-3 rounded-md font-bold text-xs uppercase tracking-wide flex justify-center items-center gap-2 ${(region !== '' && captchaValue) ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                {isSubmitting ? 'Processing...' : `Confirm Order`}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  };

  const CustomPrintView = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [captchaValue, setCaptchaValue] = useState(null);

    const handleCustomSubmit = async (e) => {
      e.preventDefault();
      if (!captchaValue) {
        alert("Sila tandakan kotak reCAPTCHA.");
        return;
      }

      setIsSubmitting(true);
      const formData = new FormData(e.target);
      const requestId = `QTE-${Date.now().toString().slice(-6)}`;
      const file = formData.get('file');
      let fileUrl = '';

      try {
        if (file && file.size > 0) {
          const storageRef = ref(storage, `custom_quotes/${requestId}-${file.name}`);
          await uploadBytes(storageRef, file);
          fileUrl = await getDownloadURL(storageRef);
        }

        const requestData = {
          requestId,
          date: new Date().toISOString(),
          customerName: formData.get('name'),
          phone: formData.get('phone'),
          email: formData.get('email'),
          description: formData.get('description'),
          fileUrl,
          status: 'NEW'
        };

        await addDoc(collection(db, "custom_requests"), requestData);

        if (TELEGRAM_BOT_TOKEN !== "LETAK_TOKEN_BOT_DI_SINI") {
          const telegramMessage = `🛠️ *TEMPAHAN CUSTOM 3D BARU!*\n\n*ID:* \`${requestId}\`\n*Nama:* ${requestData.customerName}\n*No HP:* ${requestData.phone}\n*Detail:* ${requestData.description}`;
          try {
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: telegramMessage, parse_mode: 'Markdown' })
            });
          } catch (err) {}
        }

        alert("Permintaan Custom 3D Print berjaya dihantar! Kami akan hubungi anda tidak lama lagi melalui WhatsApp.");
        navigateTo('home');
      } catch (error) {
        alert("Ralat menghantar borang: " + error.message);
      }
      setIsSubmitting(false);
    };

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-black mb-2 text-slate-900">Custom 3D Print Request</h1>
        <p className="text-sm text-slate-500 mb-6">Ada fail STL sendiri atau idea rekaan khas? Muat naik di sini dan kami akan berikan sebut harga (quotation) percuma!</p>
        
        <form onSubmit={handleCustomSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className="block text-xs font-bold text-slate-700 mb-1">Nama Penuh *</label><input required name="name" className="w-full border border-slate-200 rounded p-2.5 outline-none" /></div>
            <div><label className="block text-xs font-bold text-slate-700 mb-1">No. Telefon *</label><input required name="phone" className="w-full border border-slate-200 rounded p-2.5 outline-none" /></div>
          </div>
          <div><label className="block text-xs font-bold text-slate-700 mb-1">Email (Pilihan)</label><input type="email" name="email" className="w-full border border-slate-200 rounded p-2.5 outline-none" /></div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan / Detail Rekaan *</label>
            <textarea required name="description" rows="4" placeholder="Cth: Saya nak print kotak untuk Arduino, warna hitam, material PETG..." className="w-full border border-slate-200 rounded p-2.5 outline-none whitespace-pre-wrap"></textarea>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Muat Naik Fail (STL / OBJ / Gambar)</label>
            <input type="file" name="file" accept=".stl,.obj,.png,.jpg,.jpeg,.pdf,.zip" className="w-full border border-slate-200 rounded p-2 text-sm bg-slate-50" />
            <p className="text-[10px] text-slate-400 mt-1">Saiz maksimum: 10MB</p>
          </div>

          <div className="py-2">
             <ReCAPTCHA sitekey={RECAPTCHA_SITE_KEY} onChange={(value) => setCaptchaValue(value)} />
          </div>

          <button disabled={isSubmitting || !captchaValue} type="submit" className={`w-full py-3.5 rounded-lg font-bold text-sm text-white transition-colors ${!captchaValue ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {isSubmitting ? 'Menghantar...' : 'Hantar Permintaan (Request Quote)'}
          </button>
        </form>
      </div>
    );
  };

  const PoliciesView = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <h1 className="text-2xl font-black text-slate-900 mb-4">Policies & FAQ</h1>
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"><Icons.Truck /> Polisi Penghantaran (Shipping)</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
          <li>Semua pesanan sedia ada (Ready Stock) akan diproses dan dipos dalam masa <strong>1-3 hari bekerja</strong>.</li>
          <li>Untuk pesanan <em>Custom 3D Print</em>, masa memproses bergantung kepada saiz dan kuantiti cetakan (biasanya 3-7 hari).</li>
          <li>Kami menggunakan kurier utama seperti J&T, PosLaju, dan NinjaVan.</li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"><Icons.ShieldCheck /> Polisi Pemulangan (Returns & Refunds)</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
          <li>Barang yang rosak semasa penghantaran boleh dituntut untuk pertukaran dalam tempoh <strong>3 hari</strong> selepas bungkusan diterima.</li>
          <li>Sila ambil video <em>unboxing</em> sebagai bukti bagi sebarang tuntutan.</li>
          <li>Wang tidak boleh dikembalikan untuk barang Custom Print sekiranya kesalahan berpunca daripada fail STL yang diberikan oleh pelanggan.</li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"><Icons.MessageSquare /> Soalan Lazim (FAQ)</h2>
        <div className="space-y-4 text-sm text-slate-600">
          <div>
            <p className="font-bold text-slate-800">Q: Material apa yang digunakan untuk 3D Print?</p>
            <p>A: Secara asasnya kami menggunakan PLA+ dan PETG yang tahan lasak. Untuk material khas seperti TPU atau ABS, sila hubungi kami melalui borang Custom Print.</p>
          </div>
          <div>
            <p className="font-bold text-slate-800">Q: Adakah kedai fizikal (Walk-in) disediakan?</p>
            <p>A: Buat masa ini kami beroperasi 100% secara dalam talian. Pengambilan sendiri (Self-pickup) hanya dibenarkan jika ada perjanjian awal.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const SuccessView = () => (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><Icons.CheckCircle /></div>
      <h1 className="text-xl font-black text-slate-900 mb-1">Order Confirmed!</h1>
      <p className="text-xs text-slate-500 mb-6">Your order has been recorded. Please notify the admin via WhatsApp.</p>
      {completedOrder?.waLink && (
        <a href={completedOrder.waLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-3 rounded-md font-bold text-xs uppercase tracking-wide mb-2"><Icons.WhatsApp /> Send WhatsApp Message</a>
      )}
      <button onClick={() => navigateTo(user ? 'myorders' : 'home')} className="w-full bg-slate-900 text-white py-3 rounded-md font-bold text-xs uppercase tracking-wide mb-2">
        {user ? 'View My Orders' : 'Back to Home'}
      </button>
    </div>
  );

  const MyOrdersView = () => {
    if (!user || user.role === 'admin') return null;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-xl font-black mb-5 text-slate-900">My Orders</h1>
        {orders.length === 0 ? (
          <div className="bg-white p-10 rounded-xl border border-slate-200 text-center"><p className="text-slate-500 text-sm">No orders found.</p></div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-3 mb-3 gap-3">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Order ID</p>
                    <p className="font-black text-blue-600 text-sm">{order.orderId}</p>
                    <p className="text-[10px] text-slate-400">{new Date(order.date).toLocaleString('en-GB')}</p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : order.status === 'POSTED' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{order.status}</span>
                    <button onClick={() => navigateTo('receipt', order)} className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><Icons.Printer /> Print Receipt</button>
                  </div>
                </div>
                
                <div className="mb-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-2 text-xs text-slate-700 mb-1">
                      <span className="font-black text-blue-600 w-5">{item.quantity}x</span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 p-3 rounded-lg flex flex-col md:flex-row justify-between items-center gap-3 border border-slate-100">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Delivery Status</p>
                    {order.trackingNumber ? (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Icons.Truck />
                        <span className="font-bold text-slate-900">Tracking: {order.trackingNumber}</span>
                        {order.deliveryProofUrl && (
                          <a href={order.deliveryProofUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">View Proof</a>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] font-medium text-slate-500 italic">Processing...</p>
                    )}
                  </div>
                  <div className="text-right w-full md:w-auto">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total</p>
                    <p className="text-base font-black text-slate-900">RM {order.total.toFixed(2)}</p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const AdminDashboardView = () => {
    const today = new Date();
    const dailySales = orders.filter(o => new Date(o.date).toDateString() === today.toDateString()).reduce((sum, o) => sum + o.total, 0);
    const monthlySales = orders.filter(o => { const d = new Date(o.date); return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear(); }).reduce((sum, o) => sum + o.total, 0);
    const yearlySales = orders.filter(o => new Date(o.date).getFullYear() === today.getFullYear()).reduce((sum, o) => sum + o.total, 0);
    const pendingCount = orders.filter(o => o.status === 'PENDING').length;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-xl font-black text-slate-900 mb-5">Dashboard Overview</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Today's Sales</p>
            <p className="text-xl font-black text-blue-600 mt-1">RM {dailySales.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">This Month</p>
            <p className="text-xl font-black text-green-600 mt-1">RM {monthlySales.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">This Year</p>
            <p className="text-xl font-black text-slate-800 mt-1">RM {yearlySales.toFixed(2)}</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-white">
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Pending Orders</p>
            <p className="text-xl font-black text-white mt-1">{pendingCount}</p>
            <button onClick={()=>navigateTo('admin_orders')} className="mt-2 text-[10px] font-bold bg-white/10 px-2 py-1 rounded w-full">Manage</button>
          </div>
        </div>
      </div>
    );
  };

  const AdminOrdersView = () => {
    const [editingDelivery, setEditingDelivery] = useState(null);
    const [viewingOrder, setViewingOrder] = useState(null); 

    const updateOrderStatus = async (docId, newStatus) => {
      await updateDoc(doc(db, "orders", docId), { status: newStatus });
    };

    const handleDeliverySubmit = async (e, orderId) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const trackingNo = formData.get('trackingNumber');
      const file = formData.get('deliveryProof');
      let proofUrl = '';
      try {
        if (file && file.size > 0) {
          const storageRef = ref(storage, `deliveries/${orderId}-${file.name}`);
          await uploadBytes(storageRef, file);
          proofUrl = await getDownloadURL(storageRef);
        }
        await updateDoc(doc(db, "orders", orderId), { trackingNumber: trackingNo, deliveryProofUrl: proofUrl, status: 'POSTED' });
        alert("Delivery info updated!");
        setEditingDelivery(null);
      } catch (error) { alert("Upload failed: " + error.message); }
    };

    const handleDeleteOrder = async (id) => {
      if(window.confirm("DELETE this order? Cannot be undone.")) await deleteDoc(doc(db, "orders", id));
    };

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 relative">
        <h1 className="text-xl font-black text-slate-900 mb-5">Manage Orders</h1>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[9px] tracking-wider border-b border-slate-100">
                  <tr><th className="p-3">Order Info</th><th className="p-3">Customer</th><th className="p-3">Items</th><th className="p-3">Delivery Proof</th><th className="p-3">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="p-3 align-top">
                        <span className="font-bold text-blue-600 block mb-0.5">{order.orderId}</span>
                        <span className="text-[10px] text-slate-400 block mb-1.5">{new Date(order.date).toLocaleDateString('en-GB')}</span>
                        {order.receiptUrl ? <a href={order.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Receipt</a> : <span className="text-[9px] text-slate-400 italic">No Receipt</span>}
                      </td>
                      <td className="p-3 align-top">
                        <p className="font-bold text-slate-900">{order.customerName}</p>
                        <p className="text-[10px] text-slate-500">{order.phone}</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{order.region}</p>
                      </td>
                      <td className="p-3 align-top">
                        <ul className="space-y-0.5 mb-1.5">
                          {order.items?.map((item, idx) => (
                            <li key={idx}><span className="font-bold text-slate-900">{item.quantity}x</span> {item.name}</li>
                          ))}
                        </ul>
                        <p className="font-black text-blue-600 text-xs">RM {order.total.toFixed(2)}</p>
                        <button onClick={() => setViewingOrder(order)} className="mt-2 text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded w-full hover:bg-blue-100">
                          Lihat Detail & Nota
                        </button>
                      </td>
                      
                      <td className="p-3 align-top">
                        {editingDelivery === order.id ? (
                          <form onSubmit={(e) => handleDeliverySubmit(e, order.id)} className="space-y-1.5 bg-slate-50 p-1.5 rounded border border-slate-100 w-36">
                            <input required name="trackingNumber" placeholder="Tracking No." defaultValue={order.trackingNumber||''} className="w-full text-[10px] p-1 border rounded outline-none" />
                            <input type="file" name="deliveryProof" accept="image/*,application/pdf" className="w-full text-[9px]" />
                            <div className="flex gap-1">
                              <button type="submit" className="flex-1 bg-blue-600 text-white py-0.5 rounded text-[9px] font-bold">Save</button>
                              <button type="button" onClick={()=>setEditingDelivery(null)} className="flex-1 bg-slate-200 text-slate-700 py-0.5 rounded text-[9px] font-bold">Cancel</button>
                            </div>
                          </form>
                        ) : (
                          <div>
                            {order.trackingNumber ? (
                              <>
                                <p className="text-[10px] font-bold text-slate-800 mb-0.5">{order.trackingNumber}</p>
                                {order.deliveryProofUrl && <a href={order.deliveryProofUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold mb-1 inline-block">View</a>}
                              </>
                            ) : <p className="text-[9px] text-slate-400 italic mb-1">Not shipped</p>}
                            <button onClick={()=>setEditingDelivery(order.id)} className="text-[9px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-600"><Icons.Truck /> Update</button>
                          </div>
                        )}
                      </td>

                      <td className="p-3 align-top">
                        <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} className="w-24 mb-1.5 bg-slate-50 border border-slate-200 rounded p-1 text-[10px] font-bold outline-none cursor-pointer">
                          <option value="PENDING">PENDING</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="POSTED">POSTED</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                        <div className="flex gap-1 w-24">
                          <button onClick={() => navigateTo('receipt', order)} className="flex-1 bg-white border border-slate-200 text-slate-600 p-1 rounded flex justify-center"><Icons.Printer /></button>
                          <button onClick={() => handleDeleteOrder(order.id)} className="flex-1 bg-red-50 border border-red-100 text-red-500 p-1 rounded flex justify-center"><Icons.Trash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {viewingOrder && (
            <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                  <h2 className="font-black text-lg text-slate-900">Detail Pesanan: {viewingOrder.orderId}</h2>
                  <button onClick={() => setViewingOrder(null)} className="p-1 text-slate-400 hover:bg-slate-200 hover:text-red-500 rounded"><Icons.X /></button>
                </div>
                
                <div className="p-5 overflow-y-auto space-y-6 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Maklumat Pelanggan</p>
                      <p className="font-black text-slate-900">{viewingOrder.customerName}</p>
                      <p className="text-slate-600 text-xs mt-0.5 font-medium">{viewingOrder.phone}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Alamat Penghantaran</p>
                      <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase tracking-widest">{viewingOrder.region}</span>
                      <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">{viewingOrder.address}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Senarai Barang & Nota</p>
                    <div className="space-y-3">
                      {viewingOrder.items?.map((item, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                          <div className="flex justify-between items-start mb-2 border-b border-slate-50 pb-2">
                            <p className="font-bold text-slate-900 text-sm">
                              <span className="text-blue-600 mr-1">{item.quantity}x</span> {item.name}
                            </p>
                            <p className="font-black text-slate-900 text-sm">RM {(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          {item.notes ? (
                            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded text-xs text-amber-900">
                              <span className="font-black uppercase tracking-wider block mb-1">💬 Nota Pelanggan:</span> 
                              <div className="whitespace-pre-wrap font-medium">{item.notes}</div>
                            </div>
                          ) : (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Tiada nota tambahan</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 text-white p-5 rounded-lg flex flex-col md:flex-row justify-between items-center gap-3">
                    <div className="text-center md:text-left">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jumlah Perlu Dibayar</p>
                      <p className="text-[10px] text-slate-400 mt-1">Termasuk kos pos RM {viewingOrder.shippingFee?.toFixed(2)}</p>
                    </div>
                    <p className="text-3xl font-black text-blue-400">RM {viewingOrder.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    );
  };

  const AdminQuotesView = () => {
    const updateQuoteStatus = async (id, status) => {
      await updateDoc(doc(db, "custom_requests", id), { status });
    };

    const deleteQuote = async (id) => {
      if (window.confirm("Padam permintaan ini?")) await deleteDoc(doc(db, "custom_requests", id));
    };

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-xl font-black text-slate-900 mb-5">Manage Custom Quotes</h1>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[9px] tracking-wider border-b border-slate-100">
                <tr><th className="p-3">ID & Tarikh</th><th className="p-3">Pelanggan</th><th className="p-3 w-1/3">Keterangan</th><th className="p-3">Fail</th><th className="p-3">Tindakan</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {customRequests.length === 0 && <tr><td colSpan="5" className="p-5 text-center text-slate-500">Tiada permintaan baharu.</td></tr>}
                {customRequests.map((req) => (
                  <tr key={req.id}>
                    <td className="p-3 align-top">
                      <span className="font-bold text-blue-600 block mb-0.5">{req.requestId}</span>
                      <span className="text-[10px] text-slate-400">{new Date(req.date).toLocaleDateString('en-GB')}</span>
                    </td>
                    <td className="p-3 align-top">
                      <p className="font-bold text-slate-900">{req.customerName}</p>
                      <p className="text-[10px] text-slate-500">{req.phone}</p>
                    </td>
                    <td className="p-3 align-top whitespace-pre-wrap">
                      <div className="max-h-24 overflow-y-auto pr-2 text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                        {req.description}
                      </div>
                    </td>
                    <td className="p-3 align-top">
                      {req.fileUrl ? (
                         <a href={req.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1 w-fit"><Icons.FileUp /> Buka Fail</a>
                      ) : <span className="text-[9px] text-slate-400 italic">Tiada Fail</span>}
                    </td>
                    <td className="p-3 align-top">
                      <select value={req.status} onChange={(e) => updateQuoteStatus(req.id, e.target.value)} className={`w-28 mb-1.5 border rounded p-1.5 text-[10px] font-bold outline-none cursor-pointer ${req.status === 'NEW' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                        <option value="NEW">NEW (Baru)</option>
                        <option value="CONTACTED">DIHUBUNGI</option>
                        <option value="CLOSED">SELESAI</option>
                      </select>
                      <br/>
                      <button onClick={() => deleteQuote(req.id)} className="text-[10px] text-red-500 font-bold hover:underline">Padam</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const AdminProductsView = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const handleAddOrUpdateProduct = async (e) => {
      e.preventDefault();
      setIsAdding(true);
      const formData = new FormData(e.target);
      const productData = {
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock')),
        weight: parseInt(formData.get('weight')) || 100, 
        description: formData.get('description'),
        image: formData.get('image') || 'https://placehold.co/400x400?text=No+Image',
        dateAdded: new Date().toISOString()
      };
      
      try {
        if (editingProduct) {
          await updateDoc(doc(db, "products", editingProduct.id), productData);
          alert("Product Updated!");
          setEditingProduct(null);
        } else {
          await addDoc(collection(db, "products"), productData);
          alert("Product Added!");
        }
        e.target.reset();
      } catch (error) { alert("Failed: " + error.message); }
      setIsAdding(false);
    };

    const handleDeleteProduct = async (id) => {
      if(window.confirm("DELETE this product?")) {
        await deleteDoc(doc(db, "products", id));
        if (editingProduct?.id === id) setEditingProduct(null);
      }
    };

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-xl font-black text-slate-900 mb-5">Manage Products</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 h-fit">
              <h2 className="font-bold text-sm mb-4 text-slate-800">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              
              <form key={editingProduct ? editingProduct.id : 'new'} onSubmit={handleAddOrUpdateProduct} className="space-y-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Item Name</label>
                  <input required name="name" defaultValue={editingProduct?.name || ''} className="w-full border border-slate-200 rounded p-1.5 text-xs outline-none" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                  <select name="category" defaultValue={editingProduct?.category || MOCK_CATEGORIES[0]} className="w-full border border-slate-200 rounded p-1.5 text-xs outline-none">
                    {MOCK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Price</label>
                    <input required type="number" step="0.01" name="price" defaultValue={editingProduct?.price || ''} className="w-full border border-slate-200 rounded p-1.5 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Stock</label>
                    <input required type="number" name="stock" defaultValue={editingProduct?.stock || ''} className="w-full border border-slate-200 rounded p-1.5 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Weight (g)</label>
                    <input required type="number" name="weight" placeholder="100" defaultValue={editingProduct?.weight || 100} className="w-full border border-slate-200 rounded p-1.5 text-xs outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Image URL</label>
                  <input required name="image" defaultValue={editingProduct?.image || ''} placeholder="https://..." className="w-full border border-slate-200 rounded p-1.5 text-xs outline-none" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                  <textarea required name="description" defaultValue={editingProduct?.description || ''} rows="2" className="w-full border border-slate-200 rounded p-1.5 text-xs outline-none"></textarea>
                </div>
                <div className="flex gap-2 pt-1">
                  <button disabled={isAdding} type="submit" className="flex-1 bg-blue-600 text-white font-bold py-2 rounded text-xs">
                    {isAdding ? 'Saving...' : (editingProduct ? 'Update' : 'Save')}
                  </button>
                  {editingProduct && (
                    <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 bg-slate-100 border border-slate-200 text-slate-600 font-bold py-2 rounded text-xs">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[9px] tracking-wider border-b border-slate-100">
                  <tr><th className="p-3">Product</th><th className="p-3">Price & Weight</th><th className="p-3">Stock</th><th className="p-3">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {products.map(p => (
                    <tr key={p.id}>
                      <td className="p-3 flex items-center gap-2">
                        <img src={p.image} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400?text=Error'; }} className="w-8 h-8 rounded object-cover bg-slate-50 border border-slate-100" />
                        <div><p className="font-bold text-slate-900">{p.name}</p><p className="text-[9px] font-bold uppercase text-slate-400">{p.category}</p></div>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-blue-600 block">RM {p.price.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-500">{p.weight || 100}g</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${p.stock > 10 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1 w-16">
                          <button onClick={() => setEditingProduct(p)} className="flex-1 bg-white border border-slate-200 text-slate-500 p-1 rounded"><Icons.Edit /></button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="flex-1 bg-red-50 border border-red-100 text-red-500 p-1 rounded"><Icons.Trash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      </div>
    );
  }

  const ReceiptView = () => {
    if (!selectedOrder) return null;
    return (
      <div className="min-h-screen bg-slate-50 py-8 print:p-0 print:bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4 px-4 print:hidden">
            <button onClick={() => navigateTo(user?.role === 'admin' ? 'admin_orders' : 'myorders')} className="flex items-center text-slate-500 font-bold gap-1 text-xs"><Icons.ArrowLeft /> Back</button>
            <button onClick={() => window.print()} className="bg-slate-900 text-white px-4 py-1.5 rounded-md font-bold text-xs flex items-center gap-1"><Icons.Printer /> Print</button>
          </div>
          <div className="bg-white p-6 sm:p-10 border border-slate-200 print:border-none mx-4">
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
              <div>
                <h1 className="text-2xl font-black tracking-tighter text-blue-600">3D<span className="text-slate-900">STORE</span></h1>
                <p className="text-slate-500 text-[10px] mt-0.5 uppercase tracking-widest">Official Receipt</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Order No</p>
                <p className="text-sm font-black text-slate-900">{selectedOrder.orderId}</p>
                <p className="text-[10px] text-slate-500">{new Date(selectedOrder.date).toLocaleString('en-GB')}</p>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Billed To:</h3>
              <p className="font-bold text-sm text-slate-900">{selectedOrder.customerName}</p>
              <p className="text-xs text-slate-600">{selectedOrder.phone}</p>
              <p className="text-xs text-slate-600 mt-0.5">{selectedOrder.address}</p>
            </div>
            <table className="w-full text-left mb-6 text-xs">
              <thead className="border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-wide">
                <tr><th className="py-2">Description</th><th className="py-2 text-center">Qty</th><th className="py-2 text-right">Price</th><th className="py-2 text-right">Amount</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedOrder.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2"><p className="font-bold text-slate-900">{item.name}</p></td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">RM {item.price.toFixed(2)}</td>
                    <td className="py-2 text-right font-bold">RM {(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end border-t border-slate-200 pt-3">
              <div className="w-48 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500"><span>Subtotal:</span><span>RM {selectedOrder.subtotal?.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-500 pb-1.5 border-b border-slate-100"><span>Shipping ({selectedOrder.region}):</span><span>RM {selectedOrder.shippingFee?.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-0.5"><span>Total:</span><span>RM {selectedOrder.total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row">
      {view !== 'receipt' && <Sidebar />}
      <main className={`flex-1 min-h-screen ${view !== 'receipt' ? 'md:ml-64 pb-24' : ''}`}>
        {view !== 'receipt' && <TopHeader />}
        {view === 'home' && <HomeView />}
        {view === 'product' && <ProductView />}
        {view === 'cart' && <CartView />}
        {view === 'checkout' && <CheckoutView />}
        {view === 'success' && <SuccessView />}
        {view === 'myorders' && <MyOrdersView />}
        {view === 'custom_print' && <CustomPrintView />}
        {view === 'policies' && <PoliciesView />}
        {view === 'admin_dashboard' && <AdminDashboardView />}
        {view === 'admin_orders' && <AdminOrdersView />}
        {view === 'admin_quotes' && <AdminQuotesView />}
        {view === 'admin_products' && <AdminProductsView />}
        {view === 'receipt' && <ReceiptView />}
      </main>
    </div>
  );
}