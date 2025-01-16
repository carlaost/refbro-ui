import './App.css'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Search from './components/pages/SearchSimple'
import Results from './components/pages/Results'

import Faq from './components/pages/Faq'
import { Analytics } from '@vercel/analytics/react'
import Zotero from './components/pages/Zotero'
import { useState, useEffect } from 'react'
import { createClient, Session } from '@supabase/supabase-js'
import { Button } from './components/ui/button'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import ZoteroSuccess from './components/pages/ZoteroSuccess'
// import Data from './components/pages/Data'


// Initialize Supabase client
export const supabase = createClient('https://wyrflssqbzxklzeowjjn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5cmZsc3NxYnp4a2x6ZW93ampuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4ODEzNTQsImV4cCI6MjA1MjQ1NzM1NH0.ffQli-xxRUPFsNO8nk2wndpY-ShatAeCmAfD2uHRZcA')
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
      } else {
        console.log("Fetched session:", session);
        setSession(session);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed, new session:", session);
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignInClick = () => {
    setShowAuth(true);
  };

  const handleConnectZoteroClick = async () => {
    try {
      console.log('Connecting to Zotero...');
  
      const response = await fetch(`${API_URL}/zotero/request-token`, {
        method: 'GET',
      });
  
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authorization_url;
      } else {
        console.error('Failed to get Zotero authorization URL:', await response.json());
      }
    } catch (error) {
      console.error('Error connecting to Zotero:', error);
    }
  };

  if (showAuth) {
    return (
      <div className="flex w-full justify-center">
        <div className="w-[400px] mx-auto">
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={['google']} />
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="light min-h-screen">
        <nav className="flex flex-row w-screen py-2 px-6 justify-between items-center">
          <Link to="/" className="text-black hover:text-gray-500 ">Oshima</Link>
          <LocationButtons session={session} onSignInClick={handleSignInClick} onConnectZoteroClick={handleConnectZoteroClick} />
        </nav>
        <Routes>
          <Route path="/" element={<Search apiEndpoint="v1/colab" />} />
          <Route path="/colab" element={<Search apiEndpoint="v1/colab" />} />
          <Route path="/queries" element={<Search apiEndpoint="queries" />} />
          <Route path="/results" element={<Results />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/zotero" element={<Zotero session={session} />} />
          <Route path="/zotero-success" element={<ZoteroSuccess />} /> 
        </Routes>
      </div>
      <Analytics />
    </Router>
  )
}

function LocationButtons({ session, onSignInClick, onConnectZoteroClick }: { session: any, onSignInClick: any, onConnectZoteroClick: any }) {
  const location = useLocation();

  return (
    <div className="flex flex-row gap-2">
      {location.pathname === '/zotero' && (
        <>
          {!session && <Button onClick={onSignInClick}>Sign In</Button>}
          {session && <Button onClick={onConnectZoteroClick}>Connect Zotero</Button>}
        </>
      )}
    </div>
  );
}

export default App
