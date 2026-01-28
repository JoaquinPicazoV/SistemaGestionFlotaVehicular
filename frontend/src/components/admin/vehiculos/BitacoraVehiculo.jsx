import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../../config/api';
import { X, Plus, Pencil, Trash2, Save, FileText, Wrench, Search, Eye, Calendar, User, DollarSign, Activity, MapPin, Download } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';

const BitacoraVehiculo = ({ vehiculo, alCerrar }) => {
    const [registros, setRegistros] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [registroEditando, setRegistroEditando] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [verDetalle, setVerDetalle] = useState(null);


    const [datosFormulario, setDatosFormulario] = useState({
        bit_fecha: new Date().toISOString().slice(0, 16),
        bit_funcionario_responsable: '',
        bit_kilometraje: '',
        bit_evento: '',
        bit_mecanico: '',
        bit_valor_mantencion: 0,
        bit_observaciones: ''
    });

    useEffect(() => {
        cargarBitacora();
    }, [vehiculo]);

    const cargarBitacora = async () => {
        setCargando(true);
        try {
            const respuesta = await axios.get(`${API_URL}/vehicles/${vehiculo.vehi_patente}/bitacora`, { withCredentials: true });
            setRegistros(respuesta.data);
        } catch (error) {
            console.error(error);
        } finally {
            setCargando(false);
        }
    };

    const manejarCambioEntrada = (e) => {
        const { name, value } = e.target;


        if (['bit_evento', 'bit_mecanico'].includes(name)) {
            if (value.startsWith(' ')) return;
            if (/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑüÜ.,;:\-/"'?!¡¿@#&()º]*$/.test(value)) {
                setDatosFormulario(prev => ({ ...prev, [name]: value }));
            }
            return;
        }

        if (name === 'bit_observaciones') {
            if (value.startsWith(' ')) return;
            if (/^[a-zA-Z0-9\s.,;:\-/"'?!¡¿@#&()ºáéíóúÁÉÍÓÚñÑüÜ]*$/.test(value)) {
                setDatosFormulario(prev => ({ ...prev, [name]: value }));
            }
            return;
        }

        if (name === 'bit_funcionario_responsable') {
            if (value.startsWith(' ')) return;
            if (/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(value)) {
                setDatosFormulario(prev => ({ ...prev, [name]: value }));
            }
            return;
        }

        if (name === 'bit_kilometraje' || name === 'bit_valor_mantencion') {

            if (/^[0-9]*$/.test(value)) {
                setDatosFormulario(prev => ({ ...prev, [name]: value }));
            }
            return;
        }


        setDatosFormulario(prev => ({ ...prev, [name]: value }));
    };

    const iniciarEdicion = (registro) => {
        setRegistroEditando(registro);
        setDatosFormulario({
            ...registro,
            bit_fecha: new Date(registro.bit_fecha).toISOString().slice(0, 16),

            bit_evento: registro.bit_evento,
            bit_mecanico: registro.bit_mecanico || '',
            bit_funcionario_responsable: registro.bit_funcionario_responsable,
            bit_kilometraje: registro.bit_kilometraje.toString(),
            bit_valor_mantencion: registro.bit_valor_mantencion.toString(),
            bit_observaciones: registro.bit_observaciones || ''
        });
        setModoEdicion(true);
    };

    const cancelarEdicion = () => {
        setModoEdicion(false);
        setRegistroEditando(null);
        setDatosFormulario({
            bit_fecha: new Date().toISOString().slice(0, 16),
            bit_funcionario_responsable: '',
            bit_kilometraje: '',
            bit_evento: '',
            bit_mecanico: '',
            bit_valor_mantencion: 0,
            bit_observaciones: ''
        });
    };

    const guardarRegistro = async (e) => {
        e.preventDefault();

        if (!modoEdicion && registros.length > 0) {
            const maxKm = Math.max(...registros.map(r => r.bit_kilometraje));
            if (parseInt(datosFormulario.bit_kilometraje) < maxKm) {
                alert(`Error: El kilometraje ingresado (${datosFormulario.bit_kilometraje}) no puede ser menor al histórico máximo (${maxKm} km).`);
                return;
            }
        }

        try {
            if (registroEditando) {
                await axios.put(`${API_URL}/vehicles/bitacora/${registroEditando.bit_id}`, datosFormulario, { withCredentials: true });
            } else {
                await axios.post(`${API_URL}/vehicles/${vehiculo.vehi_patente}/bitacora`, datosFormulario, { withCredentials: true });
            }
            cargarBitacora();
            cancelarEdicion();
        } catch (error) {
            console.error("Error guardando bitácora:", error);
            if (error.response && error.response.data && error.response.data.error) {
                alert(error.response.data.error);
            } else {
                alert("Error al guardar el registro");
            }
        }
    };

    const eliminarRegistro = async (id) => {
        if (!window.confirm("¿Segura/o que deseas eliminar este registro histórico?")) return;
        try {
            await axios.delete(`${API_URL}/vehicles/bitacora/${id}`, { withCredentials: true });
            cargarBitacora();
        } catch (error) {
            console.error(error);
        }
    };

    const manejarDescargaExcel = async () => {
        if (registros.length === 0) {
            alert("No hay registros para descargar.");
            return;
        }

        const libroExcel = new ExcelJS.Workbook();


        const hojaFicha = libroExcel.addWorksheet('Ficha Técnica');

        hojaFicha.mergeCells('A1:B1');
        const tituloFicha = hojaFicha.getCell('A1');
        tituloFicha.value = 'FICHA TÉCNICA DEL VEHÍCULO';
        tituloFicha.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFF' } };
        tituloFicha.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '000000' } };
        tituloFicha.alignment = { horizontal: 'center', vertical: 'middle' };

        hojaFicha.columns = [
            { key: 'label', width: 35 },
            { key: 'value', width: 50 }
        ];

        const datosVehiculo = [
            { label: 'Vehículo', value: `${vehiculo.vehi_tipo || ''} ${vehiculo.vehi_marca || ''} ${vehiculo.vehi_modelo || ''}` },
            { label: 'Patente', value: vehiculo.vehi_patente },
            { label: 'Tipo', value: vehiculo.vehi_tipo || '-' },
            { label: 'Marca', value: vehiculo.vehi_marca || '-' },
            { label: 'Modelo', value: vehiculo.vehi_modelo || '-' },
            { label: 'Año', value: vehiculo.vehi_anio || '-' },
            { label: 'Color', value: vehiculo.vehi_color || '-' },
            { label: 'N° Motor', value: vehiculo.vehi_motor || '-' },
            { label: 'N° Chasis', value: vehiculo.vehi_chasis || '-' },
            { label: 'Capacidad (kg-mt3)', value: vehiculo.vehi_capacidad_carga || '-' },
            { label: 'N° Inventario', value: vehiculo.vehi_inventario || '-' },
            { label: 'Propietario', value: vehiculo.vehi_propietario || 'SERVICIO LOCAL DE LLANQUIHUE' },
            { label: 'Resolución Aparcamiento', value: vehiculo.vehi_resolucion || '-' },
            { label: 'Lugar Aparcamiento', value: vehiculo.vehi_lugaraparcamiento || '-' },
            { label: 'N° Póliza seguros/Cía Seguros', value: vehiculo.vehi_poliza || '-' },
            { label: 'Multa Asociados', value: vehiculo.vehi_multas || '-' }
        ];

        datosVehiculo.forEach((dato, index) => {
            const fila = hojaFicha.addRow([dato.label, dato.value]);

            const celdaEtiqueta = fila.getCell(1);
            celdaEtiqueta.font = { bold: true, color: { argb: '333333' } };
            celdaEtiqueta.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F0F0' } };
            celdaEtiqueta.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            celdaEtiqueta.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

            const celdaValor = fila.getCell(2);
            celdaValor.font = { bold: false, color: { argb: '000000' } };
            celdaValor.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            celdaValor.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
        });



        const hojaCalculo = libroExcel.addWorksheet('Bitácora');

        hojaCalculo.columns = [
            { key: 'fecha', width: 20 },
            { key: 'funcionario', width: 30 },
            { key: 'firma', width: 25 },
            { key: 'km', width: 12 },
            { key: 'evento', width: 30 },
            { key: 'mecanico', width: 25 },
            { key: 'valor', width: 20 },
            { key: 'observaciones', width: 40 }
        ];

        hojaCalculo.mergeCells('A1:H1');
        const celdaTitulo = hojaCalculo.getCell('A1');
        celdaTitulo.value = 'BITÁCORA DE VEHÍCULO';
        celdaTitulo.font = { name: 'Arial', size: 16, bold: true };
        celdaTitulo.alignment = { horizontal: 'center', vertical: 'middle' };

        const filaInfo = hojaCalculo.getRow(2);
        filaInfo.values = [
            'PATENTE:', vehiculo.vehi_patente,
            'MARCA:', vehiculo.vehi_marca || '-',
            'MODELO:', vehiculo.vehi_modelo || '-',
            ''
        ];
        filaInfo.font = { bold: true };

        ['A2', 'C2', 'E2'].forEach(claveCelda => {
            hojaCalculo.getCell(claveCelda).font = { bold: true, color: { argb: '555555' } };
            hojaCalculo.getCell(claveCelda).alignment = { horizontal: 'right' };
        });

        ['B2', 'D2', 'F2'].forEach(claveCelda => {
            hojaCalculo.getCell(claveCelda).font = { bold: true, color: { argb: '000000' } };
            hojaCalculo.getCell(claveCelda).alignment = { horizontal: 'left' };
        });

        const filaCabecera = hojaCalculo.getRow(4);
        filaCabecera.values = [
            'FECHA DE SERVICIO',
            'FUNCIONARIO RESPONSABLE',
            'FIRMA FUNCIONARIO',
            'KM',
            'EVENTO DEL VEHICULO',
            'MECANICO',
            'VALOR MANTENCION',
            'OBSERVACIONES'
        ];

        for (let i = 1; i <= 8; i++) {
            const celda = filaCabecera.getCell(i);
            celda.font = { bold: true, color: { argb: '000000' } };
            celda.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFC000' }
            };
            celda.alignment = { vertical: 'middle', horizontal: 'center' };

            celda.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }


        [...registros].sort((a, b) => new Date(a.bit_fecha) - new Date(b.bit_fecha)).forEach(reg => {
            const fila = hojaCalculo.addRow({
                fecha: new Date(reg.bit_fecha).toLocaleString('es-CL'),
                funcionario: (reg.bit_funcionario_responsable || '').trim(),
                firma: '',
                km: reg.bit_kilometraje,
                evento: (reg.bit_evento || '').trim(),
                mecanico: (reg.bit_mecanico || '').trim() || '-',
                valor: reg.bit_valor_mantencion,
                observaciones: (reg.bit_observaciones || '').trim() || '-'
            });

            fila.eachCell((celda) => {
                celda.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                celda.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
            });
        });

        const bufferDatos = await libroExcel.xlsx.writeBuffer();
        const archivoBlob = new Blob([bufferDatos], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const nombreArchivo = `Bitacora_${vehiculo.vehi_patente}_${new Date().toISOString().slice(0, 10)}.xlsx`;

        saveAs(archivoBlob, nombreArchivo);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">

                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-xl">Bitácora de Eventos</h3>
                            <p className="text-sm text-slate-500 font-medium">
                                Historial de mantenimiento - <span className="text-blue-600 font-bold">{vehiculo.vehi_modelo} ({vehiculo.vehi_patente})</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={manejarDescargaExcel}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors shadow-lg shadow-green-600/20"
                            title="Descargar Excel"
                        >
                            <Download size={18} />
                            <span className="hidden sm:inline">Descargar Excel</span>
                        </button>
                        <button onClick={alCerrar} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">


                    <div className="w-full lg:w-1/3 bg-slate-50/50 border-r border-slate-100 p-6 overflow-y-auto">
                        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                            {modoEdicion ? <span className="text-orange-500 flex items-center gap-2"><Pencil size={14} /> Editando Registro</span> : <span className="text-emerald-600 flex items-center gap-2"><Plus size={14} /> Nuevo Evento</span>}
                        </h4>

                        <form onSubmit={guardarRegistro} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Fecha del Evento</label>
                                <input type="datetime-local" name="bit_fecha" className="input-field" value={datosFormulario.bit_fecha} onChange={manejarCambioEntrada} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Evento / Tipo</label>
                                <input type="text" name="bit_evento" className="input-field" placeholder="Ej: Cambio de Aceite, Choque, Revisión..." value={datosFormulario.bit_evento} onChange={manejarCambioEntrada} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Kilometraje Actual</label>
                                <input type="text" inputMode="numeric" name="bit_kilometraje" className="input-field" placeholder="10500" value={datosFormulario.bit_kilometraje} onChange={manejarCambioEntrada} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Funcionario Responsable</label>
                                <input type="text" name="bit_funcionario_responsable" className="input-field" placeholder="Nombre funcionario..." value={datosFormulario.bit_funcionario_responsable} onChange={manejarCambioEntrada} required />
                            </div>

                            <div className="pt-2 border-t border-slate-200">
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Datos de Mantención</label>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Mecánico</label>
                                        <input type="text" name="bit_mecanico" className="input-field" placeholder="Mecánico / Taller" value={datosFormulario.bit_mecanico || ''} onChange={manejarCambioEntrada} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Costo Mantención</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                            <input type="text" inputMode="numeric" name="bit_valor_mantencion" className="input-field !pl-12" placeholder="0" value={datosFormulario.bit_valor_mantencion} onChange={manejarCambioEntrada} required />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Observaciones</label>
                                <textarea name="bit_observaciones" className="input-field h-20 resize-none" placeholder="Detalles adicionales..." value={datosFormulario.bit_observaciones || ''} onChange={manejarCambioEntrada} required></textarea>
                            </div>

                            <div className="flex gap-2 pt-2">
                                {modoEdicion && (
                                    <button type="button" onClick={cancelarEdicion} className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-sm">
                                        Cancelar
                                    </button>
                                )}
                                <button type="submit" className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2">
                                    <Save size={16} /> {modoEdicion ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>


                    <div className="w-full lg:w-2/3 bg-white p-0 flex flex-col h-full">
                        <div className="p-4 bg-slate-50/30 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Historial Registrado</h4>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar en bitácora..."
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                            {cargando ? (
                                <div className="text-center py-10 text-slate-400">Cargando bitácora...</div>
                            ) : registros.length === 0 ? (
                                <div className="text-center py-20 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                        <FileText size={24} />
                                    </div>
                                    <p className="text-slate-500 font-medium">No hay registros en la bitácora.</p>
                                    <p className="text-xs text-slate-400">Usa el formulario para agregar el primer evento.</p>
                                </div>
                            ) : (
                                registros
                                    .filter(reg =>
                                        reg.bit_evento.toLowerCase().includes(busqueda.toLowerCase()) ||
                                        reg.bit_funcionario_responsable.toLowerCase().includes(busqueda.toLowerCase()) ||
                                        (reg.bit_mecanico || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                                        (reg.bit_observaciones || '').toLowerCase().includes(busqueda.toLowerCase())
                                    )
                                    .map((reg) => (
                                        <div key={reg.bit_id} className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all bg-white relative">
                                            <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 bg-slate-50 rounded-lg border border-slate-100 py-2">
                                                <span className="text-xs font-bold text-slate-400 uppercase">{new Date(reg.bit_fecha).toLocaleString('es-CL', { month: 'short' })}</span>
                                                <span className="text-xl font-black text-slate-800">{new Date(reg.bit_fecha).getDate()}</span>
                                                <span className="text-[10px] text-slate-400">{new Date(reg.bit_fecha).getFullYear()}</span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h5 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                                        {reg.bit_evento}
                                                        {reg.bit_valor_mantencion > 0 && (
                                                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200 font-mono">
                                                                ${reg.bit_valor_mantencion.toLocaleString('es-CL')}
                                                            </span>
                                                        )}
                                                    </h5>
                                                    <div className="flex gap-1">
                                                        <button onClick={() => setVerDetalle(reg)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg" title="Ver detalle"><Eye size={16} /></button>
                                                        <button onClick={() => iniciarEdicion(reg)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="Editar"><Pencil size={16} /></button>
                                                        <button onClick={() => eliminarRegistro(reg.bit_id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Eliminar"><Trash2 size={16} /></button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-slate-400 uppercase w-24">Responsable:</span>
                                                        <span className="truncate font-medium">{reg.bit_funcionario_responsable}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-slate-400 uppercase w-16">Km:</span>
                                                        <span className="font-mono text-slate-800 bg-slate-100 px-1.5 rounded text-xs">{reg.bit_kilometraje.toLocaleString()} km</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>

                <style>{`
                    .input-field {
                        width: 100%;
                        padding: 0.5rem 0.75rem;
                        background-color: #fff;
                        border: 1px solid #e2e8f0;
                        border-radius: 0.5rem;
                        font-size: 0.875rem;
                        color: #1e293b;
                        outline: none;
                        transition: all 0.2s;
                    }
                    .input-field:focus {
                        border-color: #3b82f6;
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    }
                `}</style>
            </div>


            <AnimatePresence>
                {verDetalle && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setVerDetalle(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                    <FileText size={20} className="text-blue-500" />
                                    Detalle del Evento
                                </h3>
                                <button onClick={() => setVerDetalle(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="text-center mb-6">
                                    <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-bold border border-blue-100 mb-2">
                                        {verDetalle.bit_evento}
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium">
                                        {new Date(verDetalle.bit_fecha).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1 text-slate-400 text-xs font-bold uppercase">
                                            <User size={14} /> Responsable
                                        </div>
                                        <p className="font-semibold text-slate-700">{verDetalle.bit_funcionario_responsable}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1 text-slate-400 text-xs font-bold uppercase">
                                            <Activity size={14} /> Kilometraje
                                        </div>
                                        <p className="font-mono font-semibold text-slate-700">{verDetalle.bit_kilometraje.toLocaleString()} km</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1 text-slate-400 text-xs font-bold uppercase">
                                            <Wrench size={14} /> Mecánico / Taller
                                        </div>
                                        <p className="font-semibold text-slate-700">{verDetalle.bit_mecanico || '-'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1 text-slate-400 text-xs font-bold uppercase">
                                            <DollarSign size={14} /> Costo Mantención
                                        </div>
                                        <p className="font-mono font-bold text-green-600">${verDetalle.bit_valor_mantencion.toLocaleString('es-CL')}</p>
                                    </div>
                                </div>

                                {verDetalle.bit_observaciones && (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase">
                                            <FileText size={14} /> Observaciones
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed italic">"{verDetalle.bit_observaciones}"</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
                                <button
                                    onClick={() => setVerDetalle(null)}
                                    className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BitacoraVehiculo;
