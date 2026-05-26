import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function FileManager() {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const decodeToken = jwtDecode(token);

  const placeholderFiles = ['File1.txt', 'File2.txt', 'Image1.png', 'Pres1.pdf'];

  const disconnect = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('access_token');

      if (token) {
        await fetch('http://localhost:3000/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion côté serveur :', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.clear();
      navigate('/');
    }
  };

  const gotToCreateAccount = (e) => {
    e.preventDefault();
    navigate('/create-account');
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-200">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-700 border-b border-gray-100 pb-2">Documents</h2>
        <div className="flex flex-col gap-2">
          {placeholderFiles.map((file, index) => (
            <div key={index} className="cursor-pointer rounded-md bg-gray-50 p-2 text-sm text-gray-600 transition-colors hover:bg-lime-50 hover:text-lime-600">
              📄 {file}
            </div>
          ))}
        </div>
        {decodeToken.role == 'admin' ? (
          <button onClick={gotToCreateAccount} className="mt-4 w-full cursor-pointer rounded-md bg-lime-300 py-2 text-white transition-all hover:bg-lime-400">
            Créer un compte
          </button>
        ) : (
          ''
        )}
        <button onClick={disconnect} className="mt-4 w-full cursor-pointer rounded-md bg-lime-300 py-2 text-white transition-all hover:bg-lime-400">
          Déconnexion
        </button>
      </div>
    </div>
  );
}

export default FileManager;
