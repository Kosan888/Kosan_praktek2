import React, { useState, useEffect } from 'react';
import { Lock, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate } from 'react-router-dom';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Cek apakah user benar-benar mengakses lewat link reset (punya session)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login'); // Kalau tidak ada sesi, lempar balik ke login
      }
    });
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast({
        title: "Sukses!",
        description: "Password berhasil diperbarui. Silakan login kembali.",
      });

      // Logout user agar login ulang dengan password baru
      await supabase.auth.signOut();
      navigate('/login');

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
          <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Buat Password Baru</h2>
          <p className="text-gray-500 text-sm mt-2">
            Silakan masukkan kata sandi baru untuk akun Anda.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">Password Baru</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <Input
                id="password"
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 rounded-xl"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full h-12 rounded-xl bg-black hover:bg-gray-800 text-white font-bold"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Simpan Password Baru'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
