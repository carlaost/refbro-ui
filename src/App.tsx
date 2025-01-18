import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
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
  const [zoteroConnected, setZoteroConnected] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      let currentSession = null;
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session && !error) {
        console.log("Using Supabase session");
        currentSession = session;
      } else {
        console.log("No Supabase session, checking localStorage");
        const localSession = localStorage.getItem('sb-wyrflssqbzxklzeowjjn-auth-token');
        if (localSession) {
          try {
            currentSession = JSON.parse(localSession);
            console.log("Using localStorage session");
          } catch (e) {
            console.error("Error parsing localStorage session:", e);
          }
        }
      }
      setSession(currentSession);
      if (currentSession) {
        setShowAuth(false);
        checkZoteroConnection(currentSession);
      }
    };
  
    fetchSession();
  
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed, new session:", session);
      setSession(session);
      if (session) {
        setShowAuth(false);
        checkZoteroConnection(session);
      }
    });
  
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  

  const handleSignInClick = () => {
    setShowAuth(true);
  };

  const checkZoteroConnection = async (session: Session) => {
    try {
      const response = await fetch(`${API_URL}/v1/profile`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: session.user.email
        })
    });
      
      if (response.ok) {
        const profile = await response.json();
        setZoteroConnected(profile.zotero_user_id ? true : false);
      } else {
        console.error("Failed to fetch profile:", await response.text());
      }
    } catch (error) {
      console.error("Error checking Zotero connection:", error);
    }
  };

  const handleSignOutClick = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setZoteroConnected(false);
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
          <Auth 
            supabaseClient={supabase} 
            appearance={{ theme: ThemeSupa }} 
            providers={[]} 
            redirectTo={window.location.origin}
          />
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="light min-h-screen">
        <nav className="flex flex-row w-screen py-2 px-6 justify-between items-center">
          <Link to="/" className="text-black hover:text-gray-500 ">Oshima</Link>
          <LocationButtons 
            session={session} 
            onSignInClick={handleSignInClick} 
            onConnectZoteroClick={handleConnectZoteroClick} 
            zoteroConnected={zoteroConnected}
            onSignOutClick={handleSignOutClick}
          />
        </nav>
        <Routes>
          <Route path="/" element={<Search apiEndpoint="v1/colab" session={session} zoteroConnected={zoteroConnected} handleConnectZoteroClick={handleConnectZoteroClick}/>} />
          <Route path="/colab" element={<Search apiEndpoint="v1/colab"/>} />
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

function LocationButtons({ session, onSignInClick, onConnectZoteroClick, zoteroConnected, onSignOutClick }: { session: any, onSignInClick: any, onConnectZoteroClick: any, zoteroConnected: any, onSignOutClick: any }) {
  // const location = useLocation();

  return (
    <div className="flex flex-row gap-2">
      {/* {location.pathname === '/zotero' && ( */}
      <>
        {session && !zoteroConnected && <Button onClick={onConnectZoteroClick}>Connect Zotero</Button>}
        {session && zoteroConnected && <Link to="/zotero"><Button>Zotero Collections</Button></Link>}
        {session ? <Button variant="outline" onClick={onSignOutClick}>Sign Out</Button> : <Button variant="outline" onClick={onSignInClick}>Sign In</Button>}
        
        
      </>
      {/* )} */}
    </div>
  );
}

export default App
