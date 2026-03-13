import { useState } from 'react';
import { authApi } from '../api';
import { useNavigate, Link } from 'react-router-dom';

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
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
        <input className="w-full border p-2 mb-4 rounded" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required />
        <input className="w-full border p-2 mb-4 rounded" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="w-full border p-2 mb-4 rounded" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">Sign Up</button>
        <p className="mt-4 text-center">Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Login</Link></p>
      </form>
    </div>
  );
}