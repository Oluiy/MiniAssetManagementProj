import { useState } from 'react';
import { authApi, storeAuthTokens } from '../api';
import { useAuthStore } from '../store';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore(s => s.setToken);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authApi.login({ email, password });
      const payload = (res.data?.data ?? {}) as Record<string, any>;
      const tokenPayload = (payload.token ?? payload) as Record<string, any>;

      const accessToken =
        tokenPayload.accessToken ??
        tokenPayload.AccessToken ??
        payload.accessToken ??
        payload.AccessToken ??
        payload.token;

      const refreshToken =
        tokenPayload.refreshToken ??
        tokenPayload.RefreshToken ??
        payload.refreshToken ??
        payload.RefreshToken ??
        '';

        const username = tokenPayload.username ??
        tokenPayload.user ??
        payload.username ??
        payload.user ??
        '';

       const user = typeof username === 'string' ? username : (username as Record<string, any>).name ?? 'User';
      if (accessToken) {
        storeAuthTokens(accessToken, refreshToken, user);
        login(accessToken);
        navigate('/');
      }
    } catch { 
      alert('Login failed. Please check your credentials.'); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <LayoutDashboard className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 text-sm mt-1">Please enter your details to sign in</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full border p-2 mb-4 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input className="w-full border p-2 mb-4 rounded" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Login</button>
          <p className="mt-4 text-center">Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link></p>
        </form>
      </div>
    </div>
  );
}