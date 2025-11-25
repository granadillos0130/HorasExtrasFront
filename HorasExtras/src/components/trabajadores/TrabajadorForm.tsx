import React from "react";
import { useTrabajadorForm } from "../../hooks/trabajadores/useTrabajadorForm";
import { useImageUpload } from "../../hooks/trabajadores/useImageUpload";
import { FormHeader } from "./form/FormHeader";
import { ProgressIndicator } from "./form/ProgressIndicator";
import { Paso1InformacionPersonal } from "./form/Paso1InformacionPersonal";
import { Paso2InformacionLaboral } from "./form/Paso2InformacionLaboral";
import { Paso3ContactoEmergencia } from "./form/Paso3ContactoEmergencia";
import { Paso4EPS } from "./form/Paso4EPS";
import { Paso5ARL } from "./form/Paso5ARL";
import { Paso6Pension } from "./form/Paso6Pension";
import { Paso7Banco } from "./form/Paso7Banco";
import { Paso8Clinica } from "./form/Paso8Clinica";
import { FormNavigation } from "./form/FormNavigation";
import "../../styles/components/trabajador/TrabajadorForm.css";

interface Props {
  onCreated: (trabajadorId: number) => void;
  onCancel: () => void;
  onRefresh: () => void;
}

const TrabajadorForm: React.FC<Props> = ({ onCreated, onCancel, onRefresh }) => {
  const {
    form,
    loading,
    currentStep,
    errors,
    handleChange,
    nextStep,
    prevStep,
    handleSubmit,
  } = useTrabajadorForm(onCreated, onCancel, onRefresh);

  const {
    imagen,
    imagenPreview,
    fileInputRef,
    handleImageChange,
    removeImage,
  } = useImageUpload();

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, imagen);
  };

  return (
    <div className="trabajador-form-container">
      <FormHeader currentStep={currentStep} onCancel={onCancel} />
      
      <ProgressIndicator currentStep={currentStep} />

      <form className="trabajador-form" onSubmit={onSubmit}>
        {currentStep === 1 && (
          <Paso1InformacionPersonal
            form={form}
            errors={errors}
            loading={loading}
            imagenPreview={imagenPreview}
            fileInputRef={fileInputRef}
            onChange={handleChange}
            onImageChange={handleImageChange}
            onRemoveImage={removeImage}
          />
        )}

        {currentStep === 2 && (
          <Paso2InformacionLaboral
            form={form}
            errors={errors}
            loading={loading}
            onChange={handleChange}
          />
        )}

        {currentStep === 3 && (
          <Paso3ContactoEmergencia
            form={form}
            errors={errors}
            loading={loading}
            onChange={handleChange}
          />
        )}

        {currentStep === 4 && (
          <Paso4EPS
            form={form}
            errors={errors}
            loading={loading}
            onChange={handleChange}
          />
        )}

        {currentStep === 5 && (
          <Paso5ARL
            form={form}
            errors={errors}
            loading={loading}
            onChange={handleChange}
          />
        )}

        {currentStep === 6 && (
          <Paso6Pension
            form={form}
            errors={errors}
            loading={loading}
            onChange={handleChange}
          />
        )}

        {currentStep === 7 && (
          <Paso7Banco
            form={form}
            errors={errors}
            loading={loading}
            onChange={handleChange}
          />
        )}

        {currentStep === 8 && (
          <Paso8Clinica
            form={form}
            errors={errors}
            loading={loading}
            onChange={handleChange}
          />
        )}

        <FormNavigation
          currentStep={currentStep}
          loading={loading}
          onPrev={prevStep}
          onNext={nextStep}
        />
      </form>
    </div>
  );
};

export default TrabajadorForm;
