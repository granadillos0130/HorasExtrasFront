import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import EditarRegistrosLotePage from "./pages/EditarRegistrosLotePage";
import EditarRegistroPage from "./pages/EditarRegistroPage";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar />
        <div style={{ minHeight: 'calc(100vh - 70px)' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/trabajadores" element={<TrabajadoresPage />} />
            <Route path="/trabajadores/editar/:id" element={<TrabajadorEditPage />} />
            <Route path="/trabajadores/:id/intensidad" element={<TrabajadorIntensidad />} />
            <Route path="clientes" element={<ClientesPage/>} />
            <Route path="/registros" element={<RegistrosPage />} />
            <Route path="/registros/editar-lote" element={<EditarRegistrosLotePage />} />
            <Route path="/registros/editar/:id" element={<EditarRegistroPage />} />
            <Route path="/registros/nuevo" element={<RegistroNuevoPage />} />
            <Route path="/registros/lote" element={<RegistroLotePage />} />
            <Route path="/horarios" element={<HorariosPage />} />
            <Route path="/horarios/crear" element={<HorariosForm />} />
            <Route path="/centros" element={<CentrosPage />} />
            <Route path="/centros/crear" element={<CentroForm />} />
            <Route path="/centros/editar/:id" element={<CentroForm />} />
            <Route path="/estadisticas" element={<EstadisticasPage />} />
            <Route path="/ausencias" element={<AusenciasPage />} />
            <Route path="/ausencias/nueva" element={<AusenciasFormPage />} />
            <Route path="/ausencias/estadisticas" element={<EstadisticaAusenciaPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}