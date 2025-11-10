import React, { useState, useEffect, useContext, createContext } from 'react';
import { LogIn, LogOut, Calendar, PlusCircle, Trash2, Clock, MapPin, User, Mail, Lock } from 'lucide-react';


const API_BASE_URL = 'http://localhost:5000/api';
const TOKEN_KEY = 'authToken';


const api = async (endpoint, { body, method = 'GET', isAuth = true } = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {
    'Content-Type': 'application/json',
    ...(isAuth && token && { 'Authorization': `Bearer ${token}` }),
  };

  const config = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  };

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};


const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
      
        setUser({ username: 'Authenticated User' }); 
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api('auth/login', { method: 'POST', body: { email, password }, isAuth: false });
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser({ username: data.username || 'Authenticated User' });
    return data;
  };

  const signup = async (username, email, password) => {
    const data = await api('auth/signup', { method: 'POST', body: { username, email, password }, isAuth: false });
    return data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const value = { user, loading, login, signup, logout, isLoggedIn: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};



const AuthForm = ({ type }) => {
  const { login, signup } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isLogin = type === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        const response = await signup(username, email, password);
        console.log(response.message + " You can now log in.");
        
        window.location.hash = '#/login';
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-white shadow-2xl rounded-2xl border-t-4 border-indigo-600 transform transition-all hover:shadow-3xl">
        <div className="flex justify-center mb-6">
            <Calendar className="w-12 h-12 text-indigo-600"/>
        </div>
        <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-2">
          {isLogin ? 'Welcome Back' : 'Get Started'}
        </h2>
        <p className="text-center text-gray-500 mb-8">{isLogin ? 'Sign in to access your dashboard' : 'Create your appointment management account'}</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-xl text-sm transition-opacity duration-300 opacity-100">
            {error}
          </div>
        )}

        {!isLogin && (
          <div className="mb-4 relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm hover:border-gray-400"
            />
          </div>
        )}

        <div className="mb-4 relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm hover:border-gray-400"
          />
        </div>

        <div className="mb-6 relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm hover:border-gray-400"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : isLogin ? 'Sign In' : 'Sign Up'}
        </button>
        
        <div className="mt-8 text-center text-sm">
          {isLogin ? (
            <p className="text-gray-600">Don't have an account? <button type="button" onClick={() => window.location.hash = '#/signup'} className="font-bold text-indigo-600 hover:text-indigo-700 transition duration-150">Create One</button></p>
          ) : (
            <p className="text-gray-600">Already have an account? <button type="button" onClick={() => window.location.hash = '#/login'} className="font-bold text-indigo-600 hover:text-indigo-700 transition duration-150">Sign In</button></p>
          )}
        </div>
      </form>
    </div>
  );
};

// --- Appointment List Item Component ---
const AppointmentItem = ({ appointment, onDelete }) => (
  <li className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-white rounded-xl shadow-md border-l-4 border-blue-500 hover:shadow-lg transform hover:scale-[1.01] transition duration-300 ease-in-out">
    <div className="mb-3 sm:mb-0 sm:w-3/5">
      <p className="text-xl font-bold text-gray-800">{appointment.title}</p>
      <p className="text-sm text-gray-500 mt-1 flex items-center">
        <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
        {new Date(appointment.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
      </p>
      <p className="text-sm text-gray-500 flex items-center mt-1">
        <Clock className="h-4 w-4 mr-2 text-indigo-500" />
        {new Date(appointment.date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })}
      </p>
      <p className="text-sm text-gray-600 flex items-center mt-2">
        <MapPin className="h-4 w-4 mr-2 text-indigo-500" />
        {appointment.description || 'No location provided'}
      </p>
    </div>
    <button
      onClick={() => onDelete(appointment._id)}
      className="mt-3 sm:mt-0 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-full hover:bg-red-600 transition duration-150 shadow-md flex items-center transform hover:scale-105"
      aria-label="Delete appointment"
    >
      <Trash2 className="h-4 w-4 mr-1" /> Delete
    </button>
  </li>
);

// --- Home Component (Dashboard) ---
const Home = () => {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newAppointment, setNewAppointment] = useState({ title: '', date: '', description: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await api('appointments');
      // Sort appointments by date ascending
      const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setAppointments(sortedData);
    } catch (err) {
      setError(err.message || 'Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Input validation for date
      if (!newAppointment.date || new Date(newAppointment.date) < new Date()) {
        throw new Error("Appointment date must be in the future.");
      }

      const formattedDate = new Date(newAppointment.date).toISOString();
      const body = { ...newAppointment, date: formattedDate };

      const data = await api('appointments', { method: 'POST', body });
      
      setAppointments([...appointments, data].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setNewAppointment({ title: '', date: '', description: '' });
      setIsAdding(false);
    } catch (err) {
      setError(err.message || 'Failed to create appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAppointment = async (id) => {
    // Custom modal replacement for window.confirm
    if (!window.confirm('Are you sure you want to permanently delete this appointment?')) return;

    try {
      await api(`appointments/${id}`, { method: 'DELETE' });
      setAppointments(appointments.filter(a => a._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete appointment.');
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen text-xl text-indigo-600">
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Loading dashboard...
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-12 font-sans">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-4 border-b border-gray-300">
        <h1 className="text-4xl font-extrabold text-gray-800 flex items-center mb-4 sm:mb-0">
          <Calendar className="h-9 w-9 mr-3 text-indigo-600" />
          Appointment Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-lg font-medium text-gray-600">Welcome, {user.username}!</span>
          <button
            onClick={logout}
            className="flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-full shadow-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 transition duration-150 transform hover:scale-105"
          >
            <LogOut className="h-5 w-5 mr-1" /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-xl text-md font-medium shadow-sm">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Your Scheduled Appointments</h2>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center px-6 py-3 border border-transparent text-md font-bold rounded-xl shadow-lg text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 transition duration-300 transform hover:scale-105 active:scale-95"
          >
            <PlusCircle className="h-5 w-5 mr-2" /> {isAdding ? 'Close Form' : 'Book New'}
          </button>
        </div>

        {/* New Appointment Form */}
        <div className={`mb-12 transition-all duration-500 ease-in-out overflow-hidden ${isAdding ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-8 bg-white border border-indigo-200 rounded-2xl shadow-xl">
                <h3 className="text-2xl font-bold mb-6 text-indigo-700">Schedule a New Appointment</h3>
                <form onSubmit={handleAddAppointment} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <input
                        type="text"
                        placeholder="Appointment Title (e.g., Dentist Visit)"
                        value={newAppointment.title}
                        onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                        required
                        className="md:col-span-4 px-4 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    />
                    <input
                        type="datetime-local"
                        value={newAppointment.date}
                        onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                        required
                        className="md:col-span-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    />
                    <input
                        type="text"
                        placeholder="Description/Location (e.g., Downtown Clinic)"
                        value={newAppointment.description}
                        onChange={(e) => setNewAppointment({ ...newAppointment, description: e.target.value })}
                        className="md:col-span-2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    />
                    <div className="md:col-span-1">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-4 border border-transparent rounded-xl shadow-md text-md font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300 transform active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Scheduling...' : 'Confirm Appointment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {/* Appointment List */}
        {appointments.length > 0 ? (
          <ul className="space-y-6">
            {appointments.map((appointment) => (
              <AppointmentItem 
                key={appointment._id} 
                appointment={appointment} 
                onDelete={handleDeleteAppointment} 
              />
            ))}
          </ul>
        ) : (
          <div className="p-16 text-center bg-white rounded-2xl shadow-xl border border-gray-200 mt-10">
            <Calendar className="h-16 w-16 mx-auto text-indigo-400 mb-4" />
            <p className="text-xl font-medium text-gray-500">No appointments scheduled.</p>
            <p className="text-gray-400">Click the 'Book New' button above to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Protected Route Wrapper ---
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Authenticating...
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    // Simple redirection via hash change
    window.location.hash = '#/login';
    return null;
  }

  return children;
};


// --- Main App Component ---
const AppContent = () => {
  const { isLoggedIn } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.hash.slice(1) || '/home');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.slice(1) || '/home');
    };
    window.addEventListener('hashchange', handleHashChange);

    // Initial check to ensure correct path is set based on auth state
    if (isLoggedIn && (currentPath === '/login' || currentPath === '/signup' || currentPath === '' || currentPath === '/')) {
      setCurrentPath('/home');
      window.location.hash = '#/home';
    } else if (!isLoggedIn && (currentPath === '/home' || currentPath === '' || currentPath === '/')) {
      setCurrentPath('/login');
      window.location.hash = '#/login';
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isLoggedIn]);

  // Handle route logic (simple switch/case routing)
  let componentToRender;
  const path = currentPath.startsWith('/') ? currentPath : `/${currentPath}`;

  if (isLoggedIn) {
    // Logged in user routes
    if (path === '/home') {
      componentToRender = <ProtectedRoute><Home /></ProtectedRoute>;
    } else {
      componentToRender = <ProtectedRoute><Home /></ProtectedRoute>; // Default to home
    }
  } else {
    // Guest routes
    if (path === '/signup') {
      componentToRender = <AuthForm type="signup" />;
    } else {
      componentToRender = <AuthForm type="login" />; // Default to login
    }
  }

  return (
    <div className="min-h-screen">
      {componentToRender}
    </div>
  );
};

// Main App component wrapper for context
const App = () => (
    <div className="font-sans antialiased">
      <AuthProvider>
          <AppContent />
      </AuthProvider>
    </div>
);

export default App;