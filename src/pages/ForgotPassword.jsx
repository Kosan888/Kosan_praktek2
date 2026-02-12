import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mengirim link reset ke email
      // redirectTo diarahkan ke halaman UpdatePassword yang akan kita buat di Langkah 2
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      toast({
        title: "Email Terkirim!",
        description: "Cek inbox/spam email Anda untuk link reset password.",
      });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Lupa Kata Sandi?</h2>
          <p className="text-gray-500 text-sm mt-2">
            Masukkan email yang terdaftar, kami akan mengirimkan link untuk mereset password Anda.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Terdaftar</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 rounded-xl"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full h-12 rounded-xl bg-black hover:bg-gray-800 text-white font-bold"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Kirim Link Reset'}
          </Button>

          <div className="text-center mt-4">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-black flex items-center justify-center gap-2">
              <ArrowLeft size={16} /> Kembali ke Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
