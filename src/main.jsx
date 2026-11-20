import { createRoot } from 'react-dom/client';
import './styles.css';
import MobileApp from './app/MobileApp.jsx';
import AdminApp from './admin/AdminApp.jsx';

const isAdmin = location.pathname.startsWith('/admin');
createRoot(document.getElementById('root')).render(isAdmin ? <AdminApp /> : <MobileApp />);
