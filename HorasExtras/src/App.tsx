import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import TrabajadoresPage from "./pages/TrabajadoresPage";
import HorariosPage from "./pages/HorariosPage";
import RegistrosPage from "./pages/RegistrosPage";
import HorariosForm from "./components/horarios/HorarioForm";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/trabajadores" element={<TrabajadoresPage />} />
        <Route path="/registros" element={<RegistrosPage />} />
        <Route path="/horarios" element={<HorariosPage />} />
        <Route path="/horarios/crear" element={<HorariosForm />} />

      </Routes>
    </BrowserRouter>
  );
}
