import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import TrabajadoresPage from "./pages/TrabajadoresPage";
import HorariosPage from "./pages/HorariosPage";
import RegistrosPage from "./pages/RegistrosPage";
import HorariosForm from "./components/horarios/HorarioForm";
import CentrosPage from "./pages/CentrosPage";
import CentroForm from "./components/centros/CentroForm";
import EstadisticasPage from "./pages/EstadisticasPage";
import TrabajadorEditPage from './components/trabajadores/TrabajadorEditPage';
import TrabajadorIntensidad from "./components/trabajadores/TrabajadorIntensidad";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/trabajadores" element={<TrabajadoresPage />} />
        <Route path="/trabajadores/editar/:id" element={<TrabajadorEditPage />} />
        <Route path="/trabajadores/:id/intensidad" element={<TrabajadorIntensidad />} />

        <Route path="/registros" element={<RegistrosPage />} />
        <Route path="/horarios" element={<HorariosPage />} />
        <Route path="/horarios/crear" element={<HorariosForm />} />
        <Route path="/centros" element={<CentrosPage />} />
        
<Route path="/centros/crear" element={<CentroForm />} />
<Route path="/centros/editar/:id" element={<CentroForm />} />
<Route path="/estadisticas" element={<EstadisticasPage />} />


      </Routes>
    </BrowserRouter>
  );
}
