import { useState } from 'react';
import { authApi } from '../api';
import { useAuthStore } from '../store';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore(s => s.setToken);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authApi.login({ email, password });
      if (res.data?.data?.token?.accessToken) {
        login(res.data.data.token.accessToken);
        navigate('/');
      }
    } catch { 
      alert('Login failed. Please check your credentials.'); 
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <input className="w-full border p-2 mb-4 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="w-full border p-2 mb-4 rounded" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">Login</button>
        <p className="mt-4 text-center">Don't have an account? <Link to="/signup" className="text-indigo-600 hover:underline">Sign up</Link></p>
      </form>
    </div>
  );
}