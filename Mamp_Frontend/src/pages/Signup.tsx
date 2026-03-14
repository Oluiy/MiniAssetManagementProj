import { useState } from 'react';
import { authApi } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.register({ username, email, password });
      alert('Signup successful! Please login.');
      navigate('/login');
    } catch { 
      alert('Signup failed'); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <LayoutDashboard className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1">Join MAMP Asset Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full border p-2 mb-4 rounded" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required />
          <input className="w-full border p-2 mb-4 rounded" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input className="w-full border p-2 mb-4 rounded" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Sign Up</button>
          <p className="mt-4 text-center">Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link></p>
        </form>
      </div>
    </div>
  );
}