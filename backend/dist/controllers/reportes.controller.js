"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportesController = void 0;
const reportes_model_1 = require("../models/reportes.model");
exports.ReportesController = {
    obtenerDatosPagos: async (req, res) => {
        try {
            const { fechaInicio, fechaFin } = req.body;
            const result = await reportes_model_1.ReportesModel.obtReportPagos(fechaInicio, fechaFin);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Error al obtener los datos de pagos.' });
        }
    },
    obtenerMetricasPagos: async (req, res) => {
        try {
            const { fechaInicio, fechaFin } = req.body;
            const result = await reportes_model_1.ReportesModel.obtMetricasPagos(fechaInicio, fechaFin);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Error al obtener las metricas de pagos.' });
        }
    },
    obtenerDatosOcupacion: async (req, res) => {
        try {
            const { fechaInicio, fechaFin, idCancha } = req.body;
            const result = await reportes_model_1.ReportesModel.obtDataHeatMap(fechaInicio, fechaFin, idCancha);
            const transformData = transformarANivoHeatmap(result);
            res.status(200).json({ success: true, data: transformData });
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Error al obtener datos para el heatmap.' });
        }
    },
    listarCanchas: async (req, res) => {
        try {
            const result = await reportes_model_1.ReportesModel.listarCanchas();
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al listar las canchas registradas.'
            });
        }
    },
    obtenerTotalReservas: async (req, res) => {
        try {
            const { fechaInicio, fechaFin, idCancha } = req.body;
            const result = await reportes_model_1.ReportesModel.obtenerTotalReservas(fechaInicio, fechaFin, idCancha);
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener el total de reservas.'
            });
        }
    },
    obtenerHorasOcupadas: async (req, res) => {
        try {
            const { fechaInicio, fechaFin, idCancha } = req.body;
            const result = await reportes_model_1.ReportesModel.obtenerHorasOcupadas(fechaInicio, fechaFin, idCancha);
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener las horas ocupadas.'
            });
        }
    },
    obtenerMayorDemanda: async (req, res) => {
        try {
            const { fechaInicio, fechaFin, idCancha } = req.body;
            const result = await reportes_model_1.ReportesModel.obtenerMayorDemanda(fechaInicio, fechaFin, idCancha);
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener la mayor demanda.'
            });
        }
    },
    obtenerRentabilidadServicios: async (req, res) => {
        try {
            const { fechaInicio, fechaFin } = req.body;
            const result = await reportes_model_1.ReportesModel.obtenerRentabilidadServicios(fechaInicio, fechaFin);
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener la rentabilidad de servicios.'
            });
        }
    },
    obtenerComportamientoUsuarios: async (req, res) => {
        try {
            const { fechaInicio, fechaFin } = req.body;
            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({
                    success: false,
                    message: 'Las fechas de inicio y fin son obligatorias.'
                });
            }
            const result = await reportes_model_1.ReportesModel.obtenerComportamientoUsuarios(fechaInicio, fechaFin);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            console.error("Error en obtenerComportamientoUsuarios:", error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener el reporte de comportamiento de usuarios.'
            });
        }
    },
};
const transformarANivoHeatmap = (rows) => {
    const diasMap = new Map();
    rows.forEach((row) => {
        if (!diasMap.has(row.dia)) {
            diasMap.set(row.dia, []);
        }
        diasMap.get(row.dia)?.push({
            x: row.hora,
            y: row.reservas,
        });
    });
    return Array.from(diasMap.entries()).map(([dia, data]) => ({
        id: dia,
        data,
    }));
};
