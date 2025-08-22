import React, { useState, useEffect } from 'react';

// You will need to replace this with your actual Render backend URL
// after you deploy it. For local development, this URL can point to
// your localhost server (e.g., http://localhost:5000).
const API_BASE_URL = 'https://your-render-app-name.onrender.com';

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/message`);
        
        // Check if the response is successful
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
          Vercel & Render Integration
        </h1>
        <p className="text-xl text-gray-300">
          A full-stack example with a React frontend on Vercel and a Node.js backend on Render.
        </p>
      </header>

      <main className="w-full max-w-2xl bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
        <h2 className="text-3xl font-semibold mb-6 text-center text-blue-300">
          Data from the Backend
        </h2>
        {loading && (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-4 text-lg text-gray-400">Fetching data...</p>
          </div>
        )}
        {error && (
          <div className="text-center p-4 bg-red-800 text-red-200 rounded-lg">
            <p className="font-bold">Error:</p>
            <p className="mt-2">{error}</p>
            <p className="mt-4 text-sm">
              Please check your backend URL and ensure the server is running on Render.
            </p>
          </div>
        )}
        {data && !loading && (
          <div className="text-center p-6 bg-gray-700 rounded-lg shadow-lg">
            <p className="text-lg font-medium text-gray-200">
              The backend responded with:
            </p>
            <p className="mt-4 text-4xl font-extrabold text-green-400">
              "{data.message}"
            </p>
          </div>
        )}
      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>
          Frontend powered by React on Vercel. Backend powered by Express on Render.
        </p>
      </footer>
    </div>
  );
};

export default App;
