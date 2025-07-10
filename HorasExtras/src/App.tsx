import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import TrabajadoresPage from "./pages/TrabajadoresPage";
// Si ya tienes las otras pages:
// import CentrosPage from "./pages/CentrosPage";
import RegistrosPage from "./pages/RegistrosPage";
// import EstadisticasPage from "./pages/EstadisticasPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/trabajadores" element={<TrabajadoresPage />} />
        {/* <Route path="/centros" element={<CentrosPage />} /> */}
        <Route path="/registros" element={<RegistrosPage />} />
        {/* <Route path="/estadisticas" element={<EstadisticasPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
