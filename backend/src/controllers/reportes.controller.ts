import { Request, Response } from "express";

import { ReportesModel } from "../models/reportes.model";

export const ReportesController = {
  obtenerDatosPagos: async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin } = req.body;

      const result = await ReportesModel.obtReportPagos(fechaInicio, fechaFin);

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener los datos de pagos.' });
    }
  },

  obtenerMetricasPagos: async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin } = req.body;

      const result = await ReportesModel.obtMetricasPagos(fechaInicio, fechaFin);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener las metricas de pagos.' });
    }
  },

  obtenerDatosOcupacion: async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin, idCancha } = req.body;

      const result = await ReportesModel.obtDataHeatMap(fechaInicio, fechaFin, idCancha);

      const transformData = transformarANivoHeatmap(result);

      res.status(200).json({ success: true, data: transformData });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener datos para el heatmap.' });
    }
  },
  listarCanchas: async (req: Request, res: Response) => {
    try {
      const result = await ReportesModel.listarCanchas();

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al listar las canchas registradas.'
      });
    }
  },

  obtenerTotalReservas: async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin, idCancha } = req.body;

      const result = await ReportesModel.obtenerTotalReservas(
        fechaInicio,
        fechaFin,
        idCancha
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener el total de reservas.'
      });
    }
  },
  obtenerHorasOcupadas: async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin, idCancha } = req.body;

      const result = await ReportesModel.obtenerHorasOcupadas(
        fechaInicio,
        fechaFin,
        idCancha
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las horas ocupadas.'
      });
    }
  },

  obtenerMayorDemanda: async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin, idCancha } = req.body;

      const result = await ReportesModel.obtenerMayorDemanda(
        fechaInicio,
        fechaFin,
        idCancha
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener la mayor demanda.'
      });
    }
  },
  obtenerRentabilidadServicios: async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin } = req.body;

      const result = await ReportesModel.obtenerRentabilidadServicios(
        fechaInicio,
        fechaFin
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener la rentabilidad de servicios.'
      });
    }
  },

  obtenerComportamientoUsuarios: async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin } = req.body;

      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
          success: false,
          message: 'Las fechas de inicio y fin son obligatorias.'
        });
      }

      const result = await ReportesModel.obtenerComportamientoUsuarios(fechaInicio, fechaFin);

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("Error en obtenerComportamientoUsuarios:", error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el reporte de comportamiento de usuarios.'
      });
    }
  },
};


const transformarANivoHeatmap = (
  rows: { dia: string; hora: string; reservas: number }[]
) => {
  const diasMap = new Map<string, { x: string; y: number }[]>();

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
