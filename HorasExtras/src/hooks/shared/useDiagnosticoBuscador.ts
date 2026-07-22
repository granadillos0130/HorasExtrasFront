import { useState, useRef, useEffect } from "react";
import { ausenciasService } from "../../api/ausenciasService";
import type { Diagnostico } from "../../types/diagnostico";

export function useDiagnosticoBuscador(
  value: number | undefined,
  onChange: (diagnosticoId: number | undefined, diagnostico?: Diagnostico) => void
) {
  const [busqueda, setBusqueda] = useState<string>("");
  const [mostrarResultados, setMostrarResultados] = useState<boolean>(false);
  const [diagnosticoSeleccionado, setDiagnosticoSeleccionado] = useState<Diagnostico | null>(null);
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [timerBusqueda, setTimerBusqueda] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Estados para la modal de creación
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar diagnóstico específico por ID
  const cargarDiagnosticoPorId = async (id: number) => {
    try {
      setCargando(true);
      const todosDiagnosticos = await ausenciasService.getAllDiagnosticos();
      const diagnostico = todosDiagnosticos.find(d => d.id === id);
      if (diagnostico) {
        setDiagnosticoSeleccionado(diagnostico);
        setBusqueda(`${diagnostico.codigo} - ${diagnostico.descripcion}`);
      }
    } catch (error) {
      console.error("Error al cargar diagnóstico:", error);
    } finally {
      setCargando(false);
    }
  };

  // Sincronizar con el valor externo
  useEffect(() => {
    if (value && value > 0) {
      // Si tenemos un ID, buscar el diagnóstico completo
      cargarDiagnosticoPorId(value);
    } else {
      setDiagnosticoSeleccionado(null);
      setBusqueda("");
    }
  }, [value, refreshKey]); // refreshKey se usa para refrescar cuando se crea uno nuevo

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setMostrarResultados(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup del timer al desmontar
  useEffect(() => {
    return () => {
      if (timerBusqueda) {
        clearTimeout(timerBusqueda);
      }
    };
  }, [timerBusqueda]);

  const buscarDiagnosticos = async (termino: string) => {
    if (termino.trim().length < 2) {
      setDiagnosticos([]);
      return;
    }

    try {
      setCargando(true);
      const resultados = await ausenciasService.buscarDiagnosticos(termino.trim());
      setDiagnosticos(resultados);
    } catch (error) {
      console.error("Error al buscar diagnósticos:", error);
      setDiagnosticos([]);
    } finally {
      setCargando(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBusqueda(valor);
    setMostrarResultados(true);

    // Limpiar timer anterior
    if (timerBusqueda) {
      clearTimeout(timerBusqueda);
    }

    // Si se borra todo, notificar que no hay selección
    if (!valor.trim()) {
      setDiagnosticoSeleccionado(null);
      setDiagnosticos([]);
      onChange(undefined);
      return;
    }

    // Configurar nueva búsqueda con delay
    const nuevoTimer = setTimeout(() => {
      buscarDiagnosticos(valor);
    }, 300); // 300ms de delay para evitar muchas peticiones

    setTimerBusqueda(nuevoTimer);
  };

  const handleSelectDiagnostico = (diagnostico: Diagnostico) => {
    setDiagnosticoSeleccionado(diagnostico);
    setBusqueda(`${diagnostico.codigo} - ${diagnostico.descripcion}`);
    setMostrarResultados(false);
    onChange(diagnostico.id, diagnostico);
  };

  const handleFocus = () => {
    setMostrarResultados(true);
    // Si no hay búsqueda, cargar algunos diagnósticos iniciales
    if (!busqueda.trim() && diagnosticos.length === 0 && !cargando) {
      buscarDiagnosticos("A"); // Cargar diagnósticos que empiecen con A como ejemplo
    }
  };

  const handleClear = () => {
    setBusqueda("");
    setDiagnosticoSeleccionado(null);
    setMostrarResultados(false);
    setDiagnosticos([]);
    onChange(undefined);
    inputRef.current?.focus();
  };

  // Manejar cuando se crea un nuevo diagnóstico
  const handleDiagnosticoCreated = (nuevoDiagnostico: Diagnostico) => {
    // Seleccionar automáticamente el nuevo diagnóstico
    setDiagnosticoSeleccionado(nuevoDiagnostico);
    setBusqueda(`${nuevoDiagnostico.codigo} - ${nuevoDiagnostico.descripcion}`);
    setMostrarResultados(false);
    onChange(nuevoDiagnostico.id, nuevoDiagnostico);

    // Forzar refresh para futuras búsquedas
    setRefreshKey(prev => prev + 1);
  };

  // Abrir modal para crear diagnóstico
  const handleCrearDiagnostico = () => {
    setMostrarResultados(false);
    setShowCrearModal(true);
  };

  return {
    busqueda,
    mostrarResultados,
    diagnosticoSeleccionado,
    diagnosticos,
    cargando,
    showCrearModal,
    setShowCrearModal,
    inputRef,
    dropdownRef,
    handleInputChange,
    handleSelectDiagnostico,
    handleFocus,
    handleClear,
    handleDiagnosticoCreated,
    handleCrearDiagnostico,
  };
}
