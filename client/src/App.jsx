//concet - HTTP - CLIENT SIDE ROUTING


import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import{Toaster} from 'react-hot-toast';
import {AuthProvider} from './context/AuthContext';
import useAuth from './hooks/useAuth';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

//login nhi hai toh /login pe bhejo
const ProtectedRoute = ({children}) => {
  const{user, loading} = useAuth();
  if(loading) return(
    <div className='flex items-center justify-center min-h-screen' style={{background: '#030d17'}}>
      <div className='text-center'>
        <div className='w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-3' style={{borderColor: '#10b981', borderTopColor: 'transparent'}}/>
        <p style={{color: '#94a3b8'}}>
        Loading...
        </p>
        </div>
      </div>  
  );
  if(!user) return <Navigate to="/login"/>;
  return children;
};

//phele se logged in hai toh dashboard pe bhejo
const PublicRoute = ({children}) =>  {
  const{user, loading} = useAuth();
  if(loading) return null;
  if(user) return <Navigate to='/dashboard'/>;
  return children;
};

const AppRoutes = () => {
  return(
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard"/>}/>

      <Route path ="/login" element={<PublicRoute><Login/></PublicRoute>} />
      <Route path ="/register" element={<PublicRoute><Register/></PublicRoute>} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
       <Route path="/customers" element={<ProtectedRoute><Customers/></ProtectedRoute>}/>
      <Route path="/transactions" element={<ProtectedRoute><Transactions/></ProtectedRoute>}/>
       <Route path="/analytics" element={<ProtectedRoute><Analytics/></ProtectedRoute>}/>
        <Route path="/settings" element={<ProtectedRoute><Settings/></ProtectedRoute>}/>
    </Routes>
  );
};


const App = () => {
  return(
    <BrowserRouter>
    <AuthProvider>
      <Toaster position='top-right' toastOptions={{style: {background: '#0d1c2d',color: '#ffffff',border:'1px solid #1e3448'}}}/>
      <AppRoutes/>
    </AuthProvider>
    </BrowserRouter>
  );
};
export default App;