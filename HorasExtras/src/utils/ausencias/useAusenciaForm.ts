import { useState, useEffect } from 'react';
import { crearAusencia } from '../../api/ausenciasService';
import { trabajadoresService } from '../../api/trabajadoresService';
import type { AusenciaDto } from '../../types/ausencia';
import type { Trabajador } from '../../types/trabajadores';
import type { Diagnostico } from '../../types/diagnostico';
import {
    calcularDiasAusencia,
    calcularHorasTotales,
    esVacaciones as esVacacionesUtil,
    generarMensajeExito
} from '../../utils/ausencias/ausenciaUtils';

const initialState: AusenciaDto = {
    id: 0,
    fecha: new Date(),
    tipoAusencia: "",
    descripcion: "",
    trabajadorNombre: "",
    cargo: "",
    fechaInicio: new Date(),
    fechaFin: new Date(),
    horaInicio: "08:00",
    horaFin: "17:00",
    remunerado: false,
    diagnosticoId: undefined,
    diagnosticoCodigo: "",
    diagnosticoDescripcion: "",
};

export const useAusenciaForm = () => {
    const [formData, setFormData] = useState<AusenciaDto>(initialState);
    const [mensaje, setMensaje] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
    const [trabajadorSeleccionadoId, setTrabajadorSeleccionadoId] = useState<number>(0);
    const [loadingTrabajadores, setLoadingTrabajadores] = useState(true);
    const [diagnosticoBuscadorKey, setDiagnosticoBuscadorKey] = useState(0);

    // Cargar trabajadores
    useEffect(() => {
        const cargarTrabajadores = async () => {
            try {
                setLoadingTrabajadores(true);
                const data = await trabajadoresService.getAll();
                setTrabajadores(data);
            } catch (error) {
                console.error("Error al cargar trabajadores:", error);
                setMensaje("error:Error al cargar la lista de trabajadores.");
            } finally {
                setLoadingTrabajadores(false);
            }
        };

        cargarTrabajadores();
    }, []);

    const esVacaciones = () => esVacacionesUtil(formData.tipoAusencia);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const target = e.target;
        const { name, value } = target;

        let newValue: unknown = value;

        if (target instanceof HTMLInputElement && target.type === "checkbox") {
            newValue = target.checked;
        }

        if (name === "fechaInicio" || name === "fechaFin") {
            newValue = new Date(value);
        }

        if (name === "tipoAusencia") {
            const nuevasHoras = value.toLowerCase().includes("vacacion")
                ? { horaInicio: "08:00", horaFin: "17:00" }
                : { horaInicio: "08:00", horaFin: "10:00" };

            setFormData((prev) => ({
                ...prev,
                tipoAusencia: value as string,
                diagnosticoId: undefined,
                diagnosticoCodigo: "",
                diagnosticoDescripcion: "",
                ...nuevasHoras
            }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: newValue,
        }));
    };

    const handleTrabajadorSelect = (trabajadorId: number, trabajador?: Trabajador) => {
        setTrabajadorSeleccionadoId(trabajadorId);

        if (trabajador) {
            setFormData(prev => ({
                ...prev,
                trabajadorNombre: trabajador.nombre,
                cargo: trabajador.cargo || ""
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                trabajadorNombre: "",
                cargo: ""
            }));
        }
    };

    const handleDiagnosticoSelect = (diagnosticoId: number | undefined, diagnostico?: Diagnostico) => {
        setFormData(prev => ({
            ...prev,
            diagnosticoId: diagnosticoId,
            diagnosticoCodigo: diagnostico?.codigo || "",
            diagnosticoDescripcion: diagnostico?.descripcion || ""
        }));
    };

    const handleDiagnosticoCreated = (nuevoDiagnostico: Diagnostico) => {
        setFormData(prev => ({
            ...prev,
            diagnosticoId: nuevoDiagnostico.id,
            diagnosticoCodigo: nuevoDiagnostico.codigo,
            diagnosticoDescripcion: nuevoDiagnostico.descripcion
        }));

        setDiagnosticoBuscadorKey(prev => prev + 1);
        setMensaje("success:Diagnóstico creado exitosamente y seleccionado automáticamente.");

        setTimeout(() => {
            setMensaje("");
        }, 5000);
    };

    const handleSubmit = async (
        e: React.FormEvent,
        diasVacaciones: number,
        diasADescontar: number,
        fechaRegreso: Date | null,
        resetVacaciones: () => void
    ) => {
        e.preventDefault();
        setIsLoading(true);
        setMensaje("");

        try {
            const nuevaAusencia = {
                ...formData,
                fecha: new Date(),
            };

            await crearAusencia(nuevaAusencia);

            const diasAusencia = calcularDiasAusencia(formData.fechaInicio, formData.fechaFin);
            const horasTotales = calcularHorasTotales(
                formData.horaInicio,
                formData.horaFin,
                diasAusencia,
                esVacaciones()
            );

            const mensajeExito = generarMensajeExito(
                esVacaciones(),
                diasAusencia,
                horasTotales,
                {
                    ...formData,
                    diagnosticoCodigo: formData.diagnosticoCodigo || "",
                    diagnosticoDescripcion: formData.diagnosticoDescripcion || ""
                },
                diasVacaciones,
                diasADescontar,
                fechaRegreso
            );

            setMensaje(mensajeExito);

            // Reiniciar el formulario
            setFormData(initialState);
            setTrabajadorSeleccionadoId(0);
            setDiagnosticoBuscadorKey(prev => prev + 1);
            resetVacaciones();

            setTimeout(() => {
                const messageElement = document.querySelector('.form-message');
                if (messageElement) {
                    messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);

        } catch (error) {
            console.error("Error al registrar la ausencia:", error);
            setMensaje("error:Error al guardar la ausencia. Por favor, verifica que todos los campos estén correctos e intenta nuevamente.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLimpiar = (resetVacaciones: () => void) => {
        setFormData(initialState);
        setTrabajadorSeleccionadoId(0);
        setMensaje("");
        setDiagnosticoBuscadorKey(prev => prev + 1);
        resetVacaciones();
    };

    return {
        formData,
        mensaje,
        isLoading,
        trabajadores,
        trabajadorSeleccionadoId,
        loadingTrabajadores,
        diagnosticoBuscadorKey,
        esVacaciones,
        handleChange,
        handleTrabajadorSelect,
        handleDiagnosticoSelect,
        handleDiagnosticoCreated,
        handleSubmit,
        handleLimpiar,
        setFormData,
    };
};