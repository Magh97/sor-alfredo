import { Router } from 'express';
import { requireAuth, requireRole } from '../../shared/middleware/auth.js';
import { AppError } from '../../shared/errors.js';
import { CatalogService } from './catalog.service.js';
import {
  CreateCategorySchema, UpdateCategorySchema,
  CreateProductSchema, UpdateProductSchema,
  CreateModifierSchema, UpdateModifierSchema,
} from './catalog.schema.js';

const router = Router();

router.get('/categories', requireAuth, async (req, res, next) => {
  try {
    const categories = await CatalogService.listCategories(req.user!.restaurantId);
    res.json({ data: categories });
  } catch (err) { next(err); }
});

router.post('/categories', requireAuth, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const input = CreateCategorySchema.parse(req.body);
    const category = await CatalogService.createCategory(req.user!.restaurantId, input);
    res.status(201).json({ data: category });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.toJSON() });
    next(err);
  }
});

router.put('/categories/:id', requireAuth, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id!, 10);
    const input = UpdateCategorySchema.parse(req.body);
    const category = await CatalogService.updateCategory(id, req.user!.restaurantId, input);
    res.json({ data: category });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.toJSON() });
    next(err);
  }
});

router.get('/products', requireAuth, async (req, res, next) => {
  try {
    const { categoryId, search, availableOnly } = req.query;
    const products = await CatalogService.listProducts(req.user!.restaurantId, {
      categoryId: categoryId ? parseInt(categoryId as string, 10) : undefined,
      search: search as string | undefined,
      availableOnly: availableOnly === 'true',
    });
    res.json({ data: products });
  } catch (err) { next(err); }
});

router.post('/products', requireAuth, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const input = CreateProductSchema.parse(req.body);
    const product = await CatalogService.createProduct(req.user!.restaurantId, input);
    res.status(201).json({ data: product });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.toJSON() });
    next(err);
  }
});

router.put('/products/:id', requireAuth, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id!, 10);
    const input = UpdateProductSchema.parse(req.body);
    const product = await CatalogService.updateProduct(id, req.user!.restaurantId, input);
    res.json({ data: product });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.toJSON() });
    next(err);
  }
});

router.get('/modifiers', requireAuth, async (req, res, next) => {
  try {
    const modifiers = await CatalogService.listModifiers(req.user!.restaurantId);
    res.json({ data: modifiers });
  } catch (err) { next(err); }
});

router.post('/modifiers', requireAuth, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const input = CreateModifierSchema.parse(req.body);
    const modifier = await CatalogService.createModifier(req.user!.restaurantId, input);
    res.status(201).json({ data: modifier });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.toJSON() });
    next(err);
  }
});

router.put('/modifiers/:id', requireAuth, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id!, 10);
    const input = UpdateModifierSchema.parse(req.body);
    const modifier = await CatalogService.updateModifier(id, req.user!.restaurantId, input);
    res.json({ data: modifier });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.toJSON() });
    next(err);
  }
});

export const catalogRouter = router;
