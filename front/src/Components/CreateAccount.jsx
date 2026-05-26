import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateAccount() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlelogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, lastName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Problème lors de la création de compte.');
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
        <p className="text-2xl font-medium text-center">Création de compte</p>
        <div className="mt-4">
          <input type="text" placeholder="Prénom" value={name} onChange={(e) => setName(e.target.value)} required className="border border-gray-200 rounded w-full p-2 mt-1 outline-lime-400" />
        </div>
        <div className="mt-4">
          <input type="text" placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="border border-gray-200 rounded w-full p-2 mt-1 outline-lime-400" />
        </div>
        <div className="mt-4">
          <input type="email" placeholder="Adresse email" value={email} onChange={(e) => setEmail(e.target.value)} required className="border border-gray-200 rounded w-full p-2 mt-1 outline-lime-400" />
        </div>
        <div className="mt-4">
          <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required className="border border-gray-200 rounded w-full p-2 mt-1 outline-lime-400" />
        </div>
        {error && <div className="mt-4 p-2 bg-red-100 text-red-600 rounded text-center">{error}</div>}
        <button type="submit" disabled={isLoading} className="bg-lime-300 hover:bg-lime-400 transition-all text-white w-full py-2 rounded-md mt-4 cursor-pointer">
          {isLoading ? 'Création...' : 'Créer le compte'}
        </button>
      </form>
    </div>
  );
}

export default CreateAccount;
