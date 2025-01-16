import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Search from './components/pages/SearchSimple'
import Results from './components/pages/Results'

import Faq from './components/pages/Faq'
import { Analytics } from '@vercel/analytics/react'
// import { useState, useEffect } from 'react'
// import { createClient, Session } from '@supabase/supabase-js'
// import { Button } from './components/ui/button'
// import { Auth } from '@supabase/auth-ui-react'
// import { ThemeSupa } from '@supabase/auth-ui-shared'
// import ZoteroSuccess from './components/pages/ZoteroSuccess'
// import Data from './components/pages/Data'


// Initialize Supabase client
// export const supabase = createClient('https://wyrflssqbzxklzeowjjn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5cmZsc3NxYnp4a2x6ZW93ampuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4ODEzNTQsImV4cCI6MjA1MjQ1NzM1NH0.ffQli-xxRUPFsNO8nk2wndpY-ShatAeCmAfD2uHRZcA')
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

function App() {
  // const [session, setSession] = useState<Session | null>(null);
  // const [showAuth, setShowAuth] = useState(false);

  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     setSession(session)
  //   })

  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange((_event, session) => {
  //     setSession(session)
  //   })

  //   return () => subscription.unsubscribe()
  // }, [])

  // const handleSignInClick = () => {
  //   setShowAuth(true);
  // };

  // if (!session && showAuth) {
  //   return (
  //     <div className="flex w-full justify-center">
  //       <div className="w-[400px] mx-auto">
  //         <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={['google']} />
  //       </div>
  //     </div>
  //   )
  // }

  // const handleConnectZoteroClick = async () => {
  //   try {
  //     console.log('Connecting to Zotero...');
  
  //     // Call your backend endpoint
  //     const response = await fetch(`${API_URL}/zotero/request-token`, {
  //       method: 'GET',
  //     });
  
  //     if (response.ok) {
  //       const data = await response.json();
  //       // Redirect the user to Zotero's authorization URL
  //       window.location.href = data.authorization_url;
  //     } else {
  //       console.error('Failed to get Zotero authorization URL:', await response.json());
  //     }
  //   } catch (error) {
  //     console.error('Error connecting to Zotero:', error);
  //   }
  // };

  return (
    <Router>
      <div className="light min-h-screen">
        <nav className="flex flex-row w-screen py-2 px-6 justify-between items-center">
          <Link to="/" className="text-black hover:text-gray-500 ">Oshima</Link>
          {/* <div className="flex flex-row gap-2">
            <Button disabled={!session} onClick={handleConnectZoteroClick}>{session ? 'Connect Zotero' : 'Login to Connect Zotero'}</Button>
            {!session && <Button onClick={handleSignInClick}>Sign In</Button>}
          </div> */}
          {/* <a href="https://docs.google.com/forms/d/e/1FAIpQLScFQH7VteSZsI0l36M7FSqZJ8SmOScVcWWNYhnrccMDX0K8pQ/viewform?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-500">
            <Button variant="outline">Beta</Button>
          </a> */}
        </nav>
        <Routes>
          <Route path="/" element={<Search apiEndpoint="v1/colab" />} />
          <Route path="/colab" element={<Search apiEndpoint="v1/colab" />} />
          <Route path="/queries" element={<Search apiEndpoint="queries" />} />
          <Route path="/results" element={<Results />} />
          <Route path="/faq" element={<Faq />} />
          {/* <Route path="/zotero-success" element={<ZoteroSuccess />} /> */}
          {/* <Route path="/data" element={<Data session={session}/>} /> */}
        </Routes>
      </div>
      <Analytics />
    </Router>
  )
}

export default App
