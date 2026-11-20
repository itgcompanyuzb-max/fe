import { createRoot } from 'react-dom/client';
import './styles.css';
import MobileApp from './app/MobileApp.jsx';
import AdminApp from './admin/AdminApp.jsx';

import ConceptApp from './concept/ConceptApp.jsx';

const path = location.pathname;
const App = path.startsWith('/admin') ? AdminApp : path.startsWith('/concept') ? ConceptApp : MobileApp;
createRoot(document.getElementById('root')).render(<App />);
