import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/shared/Navbar";
import DashboardPage from "./pages/DashboardPage";
import TrabajadoresPage from "./pages/TrabajadoresPage";
import HorariosPage from "./pages/HorariosPage";
import RegistrosPage from "./pages/RegistrosPage";
import HorariosForm from "./components/horarios/HorarioForm";
import CentrosPage from "./pages/CentrosPage";
import CentroForm from "./components/centros/CentroForm";
import ClientesPage from "./pages/ClientesPage";
import EstadisticasPage from "./pages/EstadisticasPage";
import TrabajadorEditPage from './components/trabajadores/TrabajadorEditPage';
import TrabajadorIntensidad from "./components/trabajadores/TrabajadorIntensidad";
import RegistroNuevoPage from "./pages/RegistroNuevoPage";
import RegistroLotePage from "./pages/RegistroLotePage";
import { AusenciasPage } from "./pages/AusenciasPage";
import { AusenciasFormPage } from "./pages/AusenciasFormPage";
import { EstadisticaAusenciaPage } from "./pages/EstadisticaAusenciaPage";
import EditarRegistroPage from "./pages/EditarRegistroPage";
import { EditarAusenciaPage } from "./pages/EditarAusenciaPage";
import TrabajadorAusenciasPage from "./pages/TrabajadorAusenciasPage";
import TrabajadorDetailPage from "./components/trabajadores/TrabajadorDetailPage";
import { CursosPage } from "./pages/CursosPage";
import CompensadoForm from "./components/compensado/CompensadoForm";
import { CompensadosPage } from "./pages/CompensadosPage";

// CACHE MANAGER
const useCacheManager = () => {
  useEffect(() => {
    const CURRENT_VERSION = '2025-11-05v1'; // Cambia esto con cada versión nueva
    const lastVersion = localStorage.getItem('app_version');
    
    if (lastVersion !== CURRENT_VERSION) {
      console.log('🔄 Nueva versión detectada, actualizando cache...');
      
      localStorage.setItem('app_version', CURRENT_VERSION);
      
      if (!window.location.search.includes('v=') && 
          !window.location.search.includes('fix=') && 
          !window.location.search.includes('cache=')) {
        
        const separator = window.location.search ? '&' : '?';
        const cleanUrl = `${window.location.href}${separator}v=${CURRENT_VERSION}&updated=true`;
        
        window.location.href = cleanUrl;
        return;
      }
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.unregister();
          });
        });
      }
      
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
    }
  }, []);
};

export default function App() {
  useCacheManager();

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar />
        <div style={{ minHeight: 'calc(100vh - 70px)' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/trabajadores" element={<TrabajadoresPage />} />
            <Route path="/trabajadores/:id" element={<TrabajadorDetailPage />} />
            <Route path="/trabajadores/editar/:id" element={<TrabajadorEditPage />} />
            <Route path="/trabajadores/:id/intensidad" element={<TrabajadorIntensidad />} />
            <Route path="/trabajadores/:id/ausencias" element={<TrabajadorAusenciasPage />} />
            <Route path="clientes" element={<ClientesPage/>} />
            <Route path="/registros" element={<RegistrosPage />} />
            <Route path="/registros/editar/:id" element={<EditarRegistroPage />} />
            <Route path="/registros/nuevo" element={<RegistroNuevoPage />} />
            <Route path="/registros/lote" element={<RegistroLotePage />} />
            <Route path="/horarios" element={<HorariosPage />} />
            <Route path="/horarios/crear" element={<HorariosForm />} />
            <Route path="/centros" element={<CentrosPage />} />
            <Route path="/centros/crear" element={<CentroForm />} />
            <Route path="/centros/editar/:id" element={<CentroForm />} />
            <Route path="/compensados/nueva" element={<CompensadoForm />} />
            <Route path="/compensados/ver" element={<CompensadosPage />} />
            <Route path="/estadisticas" element={<EstadisticasPage />} />
            <Route path="/ausencias" element={<AusenciasPage />} />
            <Route path="/ausencias/nueva" element={<AusenciasFormPage />} />
            <Route path="/ausencias/estadisticas" element={<EstadisticaAusenciaPage />} />
            <Route path="/ausencias/editar/:id" element={<EditarAusenciaPage />} />
            <Route path="/cursos" element={<CursosPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}