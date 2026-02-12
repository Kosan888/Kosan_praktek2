import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, Loader2, Lock, Eye, EyeOff, ChevronDown, CheckCircle2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate, Link } from 'react-router-dom'; // Tambahkan Link disini

// Custom Checkbox
const CustomCheckbox = ({ id, checked, onCheckedChange, className }) => (
  <CheckboxPrimitive.Root
    id={id}
    checked={checked}
    onCheckedChange={onCheckedChange}
    className={`peer h-5 w-5 shrink-0 rounded-md border border-gray-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-black data-[state=checked]:text-white data-[state=checked]:border-black flex items-center justify-center ${className}`}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);

// Daftar Negara
const COUNTRIES = [
  { code: '+62', flag: '🇮🇩', name: 'ID' },
  { code: '+60', flag: '🇲🇾', name: 'MY' },
  { code: '+65', flag: '🇸🇬', name: 'SG' },
  { code: '+1',  flag: '🇺🇸', name: 'US' },
  { code: '+81', flag: '🇯🇵', name: 'JP' },
  { code: '+82', flag: '🇰🇷', name: 'KR' },
  { code: '+61', flag: '🇦🇺', name: 'AU' },
];

const AuthModal = ({ isOpen, onClose, initialView = 'login' }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [view, setView] = useState(initialView); 
  const [loading, setLoading] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState({ 
    firstName: '',
    lastName: '',
    phone: '',
    email: '', 
    password: '', 
    confirmPassword: '',
    otpCode: '',     // OTP Ponsel
    emailOtpCode: '' // OTP Email
  });

  // Country Code
  const [countryCode, setCountryCode] = useState('+62');
  
  // UI States
  const [verifiedCaptcha, setVerifiedCaptcha] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false); 
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP States
  const [isOtpSent, setIsOtpSent] = useState(false);           
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false); 

  // Reset state
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setVerifiedCaptcha(false);
      setAgreedToTerms(false);
      setIsOtpSent(false);
      setIsEmailOtpSent(false);
      setPhoneVerified(false);
      setEmailVerified(false);
      setFormData(prev => ({ ...prev, otpCode: '', emailOtpCode: '' }));
    }
  }, [isOpen, initialView]);

  // --- LOGIC 1: PHONE OTP (Create User as DRAFT) ---
  const handleSendOtp = async () => {
    if (!formData.phone || formData.phone.length < 8) return toast({ variant: "destructive", description: "Nomor ponsel tidak valid." });
    
    setLoading(true);
    try {
      const fullPhone = `${countryCode}${formData.phone.replace(/^0+/, '')}`;
      // Kirim status draft agar database tahu ini belum final
      const { error } = await supabase.auth.signInWithOtp({ 
        phone: fullPhone,
        options: { data: { account_status: 'draft' } }
      });
      
      if (error) throw error;
      
      setIsOtpSent(true); 
      toast({ title: "OTP Ponsel Terkirim", description: "Cek WhatsApp/SMS Anda." });
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal Mengirim OTP", description: error.message });
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (formData.otpCode.length < 6) return toast({ variant: "destructive", description: "Masukkan 6 digit kode OTP." });

    setLoading(true);
    try {
      const fullPhone = `${countryCode}${formData.phone.replace(/^0+/, '')}`;
      const { error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: formData.otpCode,
        type: 'sms',
      });

      if (error) throw error;

      setPhoneVerified(true);
      setIsOtpSent(false); 
      toast({ title: "Sukses", description: "Nomor ponsel terverifikasi." });
    } catch (error) {
      toast({ variant: "destructive", description: "Kode OTP salah atau kadaluwarsa." });
    } finally { setLoading(false); }
  };

  // --- LOGIC 2: EMAIL OTP (Link Email to User) ---
  const handleSendEmailOtp = async () => {
    if (!phoneVerified) return toast({ variant: "destructive", description: "Harap verifikasi nomor ponsel terlebih dahulu." });
    if (!formData.email.includes('@')) return toast({ variant: "destructive", description: "Email tidak valid." });

    setLoading(true);
    try {
      // Menggunakan updateUser akan memicu OTP Email Change pada user yang sedang login (via HP)
      const { error } = await supabase.auth.updateUser({ email: formData.email });
      
      if (error) throw error;
      
      setIsEmailOtpSent(true); 
      toast({ title: "OTP Email Terkirim", description: "Cek Inbox/Spam Email Anda." });
    } catch (error) {
      toast({ variant: "destructive", description: error.message });
    } finally { setLoading(false); }
  };

  const handleVerifyEmailOtp = async () => {
    if (formData.emailOtpCode.length < 6) return toast({ variant: "destructive", description: "Masukkan kode OTP Email." });

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: formData.emailOtpCode,
        type: 'email_change' // Tipe khusus karena kita mengupdate email user yang sudah ada
      });

      if (error) throw error;

      setEmailVerified(true);
      setIsEmailOtpSent(false);
      toast({ title: "Sukses", description: "Email terverifikasi." });
    } catch (error) {
      toast({ variant: "destructive", description: "Kode OTP Email salah." });
    } finally { setLoading(false); }
  };

  // --- LOGIC 3: FINAL ACTIONS ---

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!verifiedCaptcha) return toast({ variant: "destructive", description: "Mohon konfirmasi captcha." });
    
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
      if (error) throw error;
      
      // Cek status draft (akun hantu) - Keamanan Tambahan
      if (data.user?.user_metadata?.account_status === 'draft') {
        await supabase.auth.signOut();
        throw new Error("Pendaftaran akun ini belum selesai sebelumnya. Silakan daftar ulang.");
      }

      toast({ title: "Login Berhasil!", description: "Selamat datang kembali." });
      onClose();
      navigate('/profile');
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal Masuk", description: error.message || "Email/Password salah." });
    } finally { setLoading(false); }
  };

  // --- FUNGSI UTAMA YANG DIMINTA: handleSignup ---
  const handleSignup = async (e) => {
    e.preventDefault();
    
    // 1. Validasi Frontend
    if (!verifiedCaptcha) return toast({ variant: "destructive", description: "Cek captcha." });
    if (!agreedToTerms) return toast({ variant: "destructive", description: "Setujui syarat & ketentuan." });
    if (!phoneVerified) return toast({ variant: "destructive", description: "Verifikasi nomor ponsel wajib dilakukan." });
    if (!emailVerified) return toast({ variant: "destructive", description: "Verifikasi email wajib dilakukan." });
    if (formData.password !== formData.confirmPassword) return toast({ variant: "destructive", description: "Password tidak cocok." });

    setLoading(true);
    try {
      const fullPhone = `${countryCode}${formData.phone.replace(/^0+/, '')}`;
      
      // 2. Final Update ke Supabase
      // Ini akan memicu Trigger SQL 'on_auth_user_change' yang sudah kita buat
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone_number: fullPhone, // Backup data untuk trigger SQL
          account_status: 'active', // KUNCI UTAMA: Mengubah status dari draft ke active
          role: 'guest' // Default role
        }
      });

      if (error) throw error;

      // 3. Sukses
      toast({ title: "Pendaftaran Berhasil!", description: "Akun siap digunakan." });
      onClose();
      navigate('/profile');
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Gagal Daftar", description: error.message });
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[24px] max-h-[95vh] overflow-y-auto w-full md:max-w-[480px] md:left-1/2 md:-translate-x-1/2 md:rounded-[24px] md:bottom-6 shadow-2xl custom-scrollbar"
          >
            <div className="pt-3 pb-2 sticky top-0 bg-white z-20">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto" />
            </div>

            <div className="px-6 pb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">
                  {view === 'login' ? 'Selamat Datang' : 'Buat Akun Baru'}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors -mr-2">
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Tombol Google & Apple (Placeholder) */}
                <Button variant="outline" className="w-full h-12 flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl shadow-sm transition-all" onClick={() => toast({description: "Segera hadir!"})}>
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" /> {view === 'login' ? 'Masuk' : 'Daftar'} dengan Google
                </Button>
                <Button variant="outline" className="w-full h-12 flex items-center justify-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl shadow-sm transition-all" onClick={() => toast({description: "Segera hadir!"})}>
                  <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" className="w-5 h-5" /> {view === 'login' ? 'Masuk' : 'Daftar'} dengan Apple
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100" /></div>
                  <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-medium"><span className="bg-white px-3 text-gray-400">ATAU</span></div>
                </div>

                <form onSubmit={view === 'login' ? handleLogin : handleSignup} className="space-y-5">
                  
                  {view === 'signup' && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">Nama Depan</Label>
                          <Input id="firstName" placeholder="...." className="h-12 border-gray-200 focus:border-black rounded-xl bg-gray-50/30 px-4" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Nama Belakang</Label>
                          <Input id="lastName" placeholder="...." className="h-12 border-gray-200 focus:border-black rounded-xl bg-gray-50/30 px-4" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                        </div>
                      </div>

                      {/* --- VERIFIKASI NO PONSEL --- */}
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Nomor Ponsel</Label>
                        <div className="flex gap-3">
                          <div className="relative">
                            <select className="appearance-none bg-white border border-gray-200 rounded-xl h-12 pl-3 pr-8 min-w-[110px] focus:outline-none focus:border-black text-sm font-medium cursor-pointer" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} disabled={phoneVerified}>
                              {COUNTRIES.map((c) => (<option key={c.code} value={c.code}>{c.flag} {c.code}</option>))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-4 text-gray-400 pointer-events-none" />
                          </div>
                          <div className="relative w-full">
                            <Input id="phone" type="tel" placeholder="81..." className={`h-12 border-gray-200 focus:border-black rounded-xl bg-gray-50/30 font-medium px-4 ${phoneVerified ? 'border-green-500 bg-green-50 text-green-700' : ''}`} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} readOnly={phoneVerified} required />
                            {phoneVerified && <CheckCircle2 className="absolute right-3 top-3.5 text-green-600" size={20} />}
                          </div>
                        </div>

                        {!phoneVerified && (
                           <div className="pt-2">
                             {!isOtpSent ? (
                               <Button type="button" onClick={handleSendOtp} disabled={loading || formData.phone.length < 8} variant="ghost" className="w-full h-10 border border-dashed border-gray-300 text-gray-600 hover:text-black hover:border-black hover:bg-gray-50 rounded-xl text-xs font-medium">
                                 {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Kirim Kode Verifikasi (OTP)"}
                               </Button>
                             ) : (
                               <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-3">
                                 <div className="flex justify-between items-center text-xs">
                                   <span className="text-gray-500">Kode dikirim ke {countryCode}{formData.phone}</span>
                                   <button type="button" onClick={() => setIsOtpSent(false)} className="text-blue-600 hover:underline">Ubah Nomor</button>
                                 </div>
                                 <div className="flex gap-2">
                                   <Input className="h-10 text-center tracking-widest font-mono bg-white rounded-xl" placeholder="XXXXXX" maxLength={6} value={formData.otpCode} onChange={(e) => setFormData({...formData, otpCode: e.target.value.replace(/\D/g, '')})} />
                                   <Button type="button" onClick={handleVerifyOtp} disabled={loading || formData.otpCode.length < 6} className="bg-black text-white hover:bg-gray-800 h-10 px-6 rounded-xl">
                                     {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Verifikasi"}
                                   </Button>
                                 </div>
                                 <div className="text-center">
                                    <button type="button" onClick={handleSendOtp} disabled={loading} className="text-[10px] text-gray-400 hover:text-gray-600 underline">Kirim Ulang Kode</button>
                                 </div>
                               </motion.div>
                             )}
                           </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* --- VERIFIKASI EMAIL (FITUR OTP) --- */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Alamat Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                      <Input 
                        id="email" type="email" placeholder="...."
                        className={`pl-11 h-12 border-gray-200 focus:border-black rounded-xl bg-gray-50/30 ${emailVerified ? 'border-green-500 bg-green-50 text-green-700' : ''}`}
                        value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                        readOnly={view === 'signup' && emailVerified} 
                        required
                      />
                      {view === 'signup' && emailVerified && <CheckCircle2 className="absolute right-3 top-3.5 text-green-600" size={20} />}
                    </div>

                    {/* FITUR BARU: OTP EMAIL UI */}
                    {view === 'signup' && !emailVerified && (
                       <div className="pt-2">
                         {!isEmailOtpSent ? (
                           <Button type="button" onClick={handleSendEmailOtp} disabled={loading || !formData.email || !phoneVerified} variant="ghost" className="w-full h-10 border border-dashed border-gray-300 text-gray-600 hover:text-black hover:border-black hover:bg-gray-50 rounded-xl text-xs font-medium">
                             {loading ? <Loader2 className="animate-spin w-4 h-4" /> : (!phoneVerified ? "Verifikasi Ponsel Dulu" : "Kirim OTP Email")}
                           </Button>
                         ) : (
                           <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-3">
                             <div className="flex justify-between items-center text-xs">
                               <span className="text-gray-500">Kode dikirim ke {formData.email}</span>
                               <button type="button" onClick={() => setIsEmailOtpSent(false)} className="text-blue-600 hover:underline">Ubah Email</button>
                             </div>
                             <div className="flex gap-2">
                               <Input className="h-10 text-center tracking-widest font-mono bg-white rounded-xl" placeholder="XXXXXX" maxLength={6} value={formData.emailOtpCode} onChange={(e) => setFormData({...formData, emailOtpCode: e.target.value.replace(/\D/g, '')})} />
                               <Button type="button" onClick={handleVerifyEmailOtp} disabled={loading || formData.emailOtpCode.length < 6} className="bg-black text-white hover:bg-gray-800 h-10 px-6 rounded-xl">
                                 {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Verifikasi"}
                               </Button>
                             </div>
                             <div className="text-center">
                                <button type="button" onClick={handleSendEmailOtp} disabled={loading} className="text-[10px] text-gray-400 hover:text-gray-600 underline">Kirim Ulang Kode</button>
                             </div>
                           </motion.div>
                         )}
                       </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                      <Input 
                        id="password" type={showPassword ? "text" : "password"} placeholder="...."
                        className="pl-11 pr-11 h-12 border-gray-200 focus:border-black rounded-xl bg-gray-50/30"
                        value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* --- FITUR LUPA KATA SANDI (Hanya muncul di Login) --- */}
                    {view === 'login' && (
                        <div className="flex justify-end mt-1">
                          <Link 
                            to="/forgot-password" 
                            onClick={onClose} 
                            className="text-xs font-medium text-gray-500 hover:text-black hover:underline transition-colors"
                          >
                            Lupa kata sandi?
                          </Link>
                        </div>
                    )}
                  </div>

                  {view === 'signup' && (
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Konfirmasi Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                        <Input 
                          id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="...."
                          className="pl-11 pr-11 h-12 border-gray-200 focus:border-black rounded-xl bg-gray-50/30"
                          value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          required
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600">
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3 pt-2">
                    {view === 'signup' && (
                      <div className="flex items-start gap-3">
                        <CustomCheckbox id="terms" checked={agreedToTerms} onCheckedChange={setAgreedToTerms} className="mt-0.5" />
                        <Label htmlFor="terms" className="text-xs text-gray-500 leading-tight">
                          Setuju dengan <span className="underline font-medium text-gray-800 cursor-pointer">Syarat & Ketentuan</span> dan <span className="underline font-medium text-gray-800 cursor-pointer">Kebijakan Privasi</span>.
                        </Label>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <CustomCheckbox id="captcha-auth" checked={verifiedCaptcha} onCheckedChange={setVerifiedCaptcha} />
                      <Label htmlFor="captcha-auth" className="text-sm text-gray-600 cursor-pointer select-none">Saya bukan robot (reCAPTCHA)</Label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-xl font-semibold text-base shadow-lg shadow-gray-200 mt-2" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (view === 'login' ? 'Masuk' : 'Daftar')}
                  </Button>
                </form>

                <div className="text-center text-sm pt-2 pb-2">
                  <span className="text-gray-500">{view === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}</span>
                  <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="font-bold text-black hover:underline underline-offset-4">
                    {view === 'login' ? 'Daftar Sekarang' : 'Masuk Disini'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
