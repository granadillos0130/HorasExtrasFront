import AusenciaForm from "../components/ausencias/AusenciaForm";
import "../styles/pages/AusenciasFormPage.css";

export function AusenciasFormPage() {
  return (
    <div className="ausencias-form-page">
      <h1>Registrar Nueva Ausencia</h1>
      <AusenciaForm />
    </div>
  );
}
