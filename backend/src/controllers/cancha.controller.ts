/**
 * ============================================================================
 * ARCHIVO: cancha.controller.ts
 * CAPA: Controladores (Controllers/)
 * 
 * PROPÓSITO:
 * El controlador actúa como intermediario entre la capa de red (Rutas HTTP)
 * y la lógica de negocio (Servicios).
 * - Recibe los objetos Request y Response de Express.
 * - Extrae parámetros de la URL (req.params), query string (req.query) o cuerpo (req.body).
 * - Valida datos básicos de entrada.
 * - Invoca los métodos correspondientes del servicio.
 * - Responde al cliente con el código de estado HTTP adecuado (200, 201, 400, 404, 500).
 * ============================================================================
 */

import type { Request, Response } from 'express';
import { canchaService } from '../services/cancha.service';
import type { CreateCanchaDTO, UpdateCanchaDTO, CanchaFilters } from '../types/cancha.types';

// Helper para extraer string de parámetros o queries de Express
const extractString = (val: unknown): string | undefined => {
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
  return undefined;
};

export class CanchaController {
  /**
   * GET /api/canchas
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const filters: CanchaFilters = {
        disciplina: extractString(req.query.disciplina),
        estado: extractString(req.query.estado),
        search: extractString(req.query.search),
      };

      const canchas = await canchaService.getAllCanchas(filters);

      res.status(200).json({
        success: true,
        count: canchas.length,
        data: canchas,
      });
    } catch (error) {
      console.error('Error en CanchaController.getAll:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener las canchas',
        error: (error as Error).message,
      });
    }
  }

  /**
   * GET /api/canchas/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const rawId = extractString(req.params.id);
      if (!rawId) {
        res.status(400).json({
          success: false,
          message: 'Debe especificar el ID de la cancha',
        });
        return;
      }

      const id = parseInt(rawId, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'El ID de la cancha debe ser un número entero válido',
        });
        return;
      }

      const cancha = await canchaService.getCanchaById(id);

      if (!cancha) {
        res.status(404).json({
          success: false,
          message: `No se encontró la cancha con ID ${id}`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: cancha,
      });
    } catch (error) {
      console.error(`Error en CanchaController.getById (${req.params.id}):`, error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener la cancha',
        error: (error as Error).message,
      });
    }
  }

  /**
   * GET /api/canchas/:id/reservas
   */
  async getReservasPorCancha(req: Request, res: Response): Promise<void> {
    try {
      const rawId = extractString(req.params.id);
      if (!rawId) {
        res.status(400).json({
          success: false,
          message: 'Debe especificar el ID de la cancha',
        });
        return;
      }

      const id = parseInt(rawId, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'El ID de la cancha debe ser un número entero válido',
        });
        return;
      }

      const { mes, fecha } = req.query;
      const reservas = await canchaService.getReservasDeCancha(id, {
        mes: typeof mes === 'string' ? mes : undefined,
        fecha: typeof fecha === 'string' ? fecha : undefined,
      });

      res.status(200).json({
        success: true,
        data: reservas,
      });
    } catch (error) {
      console.error(`Error en CanchaController.getReservasPorCancha (${req.params.id}):`, error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al consultar la disponibilidad',
        error: (error as Error).message,
      });
    }
  }

  /**
   * POST /api/canchas
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateCanchaDTO = req.body;

      if (!data.nombre || data.nombre.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'El campo "nombre" es obligatorio',
        });
        return;
      }

      if (data.precio_hora === undefined || isNaN(Number(data.precio_hora)) || Number(data.precio_hora) < 0) {
        res.status(400).json({
          success: false,
          message: 'El campo "precio_hora" es obligatorio y debe ser un número positivo',
        });
        return;
      }

      const nuevaCancha = await canchaService.createCancha({
        ...data,
        precio_hora: Number(data.precio_hora),
      });

      res.status(201).json({
        success: true,
        message: 'Cancha creada exitosamente',
        data: nuevaCancha,
      });
    } catch (error) {
      console.error('Error en CanchaController.create:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al crear la cancha',
        error: (error as Error).message,
      });
    }
  }

  /**
   * PATCH /api/canchas/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const rawId = extractString(req.params.id);
      if (!rawId) {
        res.status(400).json({
          success: false,
          message: 'Debe especificar el ID de la cancha',
        });
        return;
      }

      const id = parseInt(rawId, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'El ID de la cancha debe ser un número entero válido',
        });
        return;
      }

      const data: UpdateCanchaDTO = req.body;

      if (!data || Object.keys(data).length === 0) {
        res.status(400).json({
          success: false,
          message: 'Debe proporcionar al menos un campo para actualizar',
        });
        return;
      }

      const canchaActualizada = await canchaService.updateCancha(id, data);

      if (!canchaActualizada) {
        res.status(404).json({
          success: false,
          message: `No se pudo actualizar: La cancha con ID ${id} no existe`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Cancha actualizada correctamente',
        data: canchaActualizada,
      });
    } catch (error) {
      console.error(`Error en CanchaController.update (${req.params.id}):`, error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al actualizar la cancha',
        error: (error as Error).message,
      });
    }
  }

  /**
   * DELETE /api/canchas/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const rawId = extractString(req.params.id);
      if (!rawId) {
        res.status(400).json({
          success: false,
          message: 'Debe especificar el ID de la cancha',
        });
        return;
      }

      const id = parseInt(rawId, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'El ID de la cancha debe ser un número entero válido',
        });
        return;
      }

      const deleted = await canchaService.deleteCancha(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: `No se encontró la cancha con ID ${id} para eliminar`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Cancha con ID ${id} eliminada correctamente`,
      });
    } catch (error) {
      console.error(`Error en CanchaController.delete (${req.params.id}):`, error);

      const pgError = error as { code?: string; message?: string };
      if (pgError.code === '23503') {
        res.status(409).json({
          success: false,
          message: 'No se puede eliminar la cancha porque tiene reservas, administradores o eventos asociados.',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al eliminar la cancha',
        error: (error as Error).message,
      });
    }
  }
}

export const canchaController = new CanchaController();