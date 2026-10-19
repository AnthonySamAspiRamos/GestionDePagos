"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventoController = void 0;
const eventoModel_1 = require("../models/eventoModel");
const inscripcionModel_1 = require("../models/inscripcionModel");
class EventoController {
    static async obtenerServicios(req, res) {
        try {
            await eventoModel_1.EventoModel.inicializarServicios();
            const servicios = await eventoModel_1.EventoModel.obtenerServiciosActivos();
            res.json({ success: true, data: servicios });
        }
        catch (error) {
            console.error('Error al obtener servicios:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor.' });
        }
    }
    static async crearEvento(req, res) {
        try {
            const { nombre_evento, descripcion, fecha_evento, hora_inicio, hora_fin, cupo_maximo, tipo_evento, id_cancha, servicios } = req.body;
            const id_administrador = req.usuario?.id_usuario;
            if (!id_administrador) {
                return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
            }
            if (!nombre_evento || !fecha_evento || !hora_inicio || !hora_fin || !id_cancha || !cupo_maximo) {
                return res.status(400).json({ success: false, message: 'Faltan datos obligatorios para crear el evento.' });
            }
            if (hora_inicio >= hora_fin) {
                return res.status(400).json({ success: false, message: 'La hora de fin debe ser posterior a la hora de inicio.' });
            }
            const disponible = await eventoModel_1.EventoModel.verificarDisponibilidadCancha(id_cancha, fecha_evento, hora_inicio, hora_fin);
            if (!disponible) {
                return res.status(400).json({ success: false, message: 'La cancha seleccionada no está disponible en ese horario.' });
            }
            const nuevoEvento = {
                nombre_evento,
                descripcion,
                fecha_evento,
                hora_inicio,
                hora_fin,
                cupo_maximo,
                tipo_evento,
                id_administrador
            };
            const eventoCreado = await eventoModel_1.EventoModel.crearEvento(nuevoEvento, id_cancha, servicios || []);
            res.status(201).json({ success: true, message: 'Evento creado exitosamente.', data: eventoCreado });
        }
        catch (error) {
            console.error('Error al crear evento:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor al crear evento.' });
        }
    }
    static async editarEvento(req, res) {
        try {
            const id_evento = parseInt(req.params.id);
            const { nombre_evento, descripcion, fecha_evento, hora_inicio, hora_fin, cupo_maximo, tipo_evento, id_cancha, servicios } = req.body;
            if (!nombre_evento || !fecha_evento || !hora_inicio || !hora_fin || !id_cancha || !cupo_maximo) {
                return res.status(400).json({ success: false, message: 'Faltan datos obligatorios para editar el evento.' });
            }
            if (hora_inicio >= hora_fin) {
                return res.status(400).json({ success: false, message: 'La hora de fin debe ser posterior a la hora de inicio.' });
            }
            const disponible = await eventoModel_1.EventoModel.verificarDisponibilidadCancha(id_cancha, fecha_evento, hora_inicio, hora_fin, undefined, id_evento);
            if (!disponible) {
                return res.status(400).json({ success: false, message: 'La cancha seleccionada no está disponible en ese horario.' });
            }
            const eventoActualizado = await eventoModel_1.EventoModel.actualizarEvento(id_evento, { nombre_evento, descripcion, fecha_evento, hora_inicio, hora_fin, cupo_maximo, tipo_evento }, id_cancha, servicios || []);
            res.json({ success: true, message: 'Evento actualizado exitosamente.', data: eventoActualizado });
        }
        catch (error) {
            console.error('Error al editar evento:', error);
            res.status(400).json({ success: false, message: error.message || 'Error interno del servidor al editar evento.' });
        }
    }
    static async reprogramarEvento(req, res) {
        try {
            const id_evento = parseInt(req.params.id);
            const { nombre_evento, descripcion, fecha_evento, hora_inicio, hora_fin, cupo_maximo, tipo_evento, id_cancha, servicios } = req.body;
            if (!nombre_evento || !fecha_evento || !hora_inicio || !hora_fin || !id_cancha || !cupo_maximo) {
                return res.status(400).json({ success: false, message: 'Faltan datos obligatorios para reprogramar el evento.' });
            }
            if (hora_inicio >= hora_fin) {
                return res.status(400).json({ success: false, message: 'La hora de fin debe ser posterior a la hora de inicio.' });
            }
            const fechaHoraFin = new Date(`${fecha_evento}T${hora_fin}`);
            if (fechaHoraFin <= new Date()) {
                return res.status(400).json({ success: false, message: 'La nueva fecha y hora deben ser futuras.' });
            }
            const disponible = await eventoModel_1.EventoModel.verificarDisponibilidadCancha(id_cancha, fecha_evento, hora_inicio, hora_fin, undefined, id_evento);
            if (!disponible) {
                return res.status(400).json({ success: false, message: 'La cancha seleccionada no está disponible en ese horario.' });
            }
            const eventoReprogramado = await eventoModel_1.EventoModel.reprogramarEvento(id_evento, { nombre_evento, descripcion, fecha_evento, hora_inicio, hora_fin, cupo_maximo, tipo_evento }, id_cancha, servicios || []);
            res.json({ success: true, message: 'Evento reprogramado exitosamente.', data: eventoReprogramado });
        }
        catch (error) {
            console.error('Error al reprogramar evento:', error);
            res.status(400).json({ success: false, message: error.message || 'Error interno del servidor al reprogramar evento.' });
        }
    }
    static async obtenerEventos(req, res) {
        try {
            const filtros = {
                tipo: req.query.tipo,
                fecha: req.query.fecha,
                id_cancha: req.query.id_cancha,
                disponibles: req.query.disponibles === 'true'
            };
            const eventos = await eventoModel_1.EventoModel.obtenerEventos(filtros);
            res.json({ success: true, data: eventos });
        }
        catch (error) {
            console.error('Error al obtener eventos:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor al obtener eventos.' });
        }
    }
    static async cancelarEvento(req, res) {
        try {
            const id_evento = parseInt(req.params.id);
            const { motivo_cancelacion } = req.body;
            const id_usuario_cancelacion = req.usuario?.id_usuario;
            if (!motivo_cancelacion) {
                return res.status(400).json({ success: false, message: 'Debe especificar un motivo de cancelación.' });
            }
            const result = await eventoModel_1.EventoModel.cancelarEvento(id_evento, motivo_cancelacion, id_usuario_cancelacion);
            res.json({ success: true, message: 'Evento cancelado exitosamente.', data: result });
        }
        catch (error) {
            console.error('Error al cancelar evento:', error);
            res.status(400).json({ success: false, message: error.message || 'Error al cancelar evento.' });
        }
    }
    static async inscribir(req, res) {
        try {
            const id_evento = parseInt(req.params.id);
            const id_cliente = req.usuario?.id_usuario;
            if (!id_cliente) {
                return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
            }
            const inscripcion = await inscripcionModel_1.InscripcionModel.crearInscripcion(id_cliente, id_evento);
            res.status(201).json({ success: true, message: 'Inscripción exitosa.', data: inscripcion });
        }
        catch (error) {
            console.error('Error al inscribir:', error);
            res.status(400).json({ success: false, message: error.message || 'Error al procesar la inscripción.' });
        }
    }
    static async cancelarInscripcion(req, res) {
        try {
            const id_evento = parseInt(req.params.id);
            const id_cliente = req.usuario?.id_usuario;
            if (!id_cliente) {
                return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
            }
            const inscripcion = await inscripcionModel_1.InscripcionModel.cancelarInscripcion(id_cliente, id_evento);
            res.json({ success: true, message: 'Inscripción cancelada.', data: inscripcion });
        }
        catch (error) {
            console.error('Error al cancelar inscripción:', error);
            res.status(400).json({ success: false, message: error.message || 'Error al cancelar inscripción.' });
        }
    }
    static async misInscripciones(req, res) {
        try {
            const id_cliente = req.usuario?.id_usuario;
            if (!id_cliente) {
                return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
            }
            const inscripciones = await inscripcionModel_1.InscripcionModel.obtenerInscripcionesCliente(id_cliente);
            res.json({ success: true, data: inscripciones });
        }
        catch (error) {
            console.error('Error al obtener inscripciones:', error);
            res.status(500).json({ success: false, message: 'Error interno al obtener inscripciones.' });
        }
    }
}
exports.EventoController = EventoController;
