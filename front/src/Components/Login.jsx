import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlelogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Identifiants incorrects ou compte bloqué.');
      }

      if (response.status === 202 && data.message === 'MFA_REQUIRED') {
        sessionStorage.setItem('temp_2fa_token', data.temp_token);

        navigate('/verify-2fa');
        return;
      }

      localStorage.setItem('access_token', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }

      navigate('/files');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handlelogin} className="bg-white rounded-lg shadow-xl text-sm text-gray-500 border border-gray-200 p-8 py-12 w-80 sm:w-[352px]">
        <p className="text-2xl font-medium text-center">Connexion</p>
        <div className="mt-4">
          <input type="email" placeholder="Adresse email" value={email} onChange={(e) => setEmail(e.target.value)} required className="border border-gray-200 rounded w-full p-2 mt-1 outline-lime-400" />
        </div>
        <div className="mt-4">
          <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required className="border border-gray-200 rounded w-full p-2 mt-1 outline-lime-400" />
        </div>
        <p className="mt-4">
          Les compte sont créés par les <span className="text-lime-400">admins</span>
        </p>
        {error && <div className="mt-4 p-2 bg-red-100 text-red-600 rounded text-center">{error}</div>}
        <button type="submit" disabled={isLoading} className="bg-lime-300 hover:bg-lime-400 transition-all text-white w-full py-2 rounded-md mt-4 cursor-pointer">
          {isLoading ? 'Connexion...' : 'Connexion'}
        </button>
      </form>
    </div>
  );
}

export default Login;
