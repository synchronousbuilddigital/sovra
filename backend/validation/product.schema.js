const { z } = require('zod');

const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100),
    price: z.number().positive(),
    details: z.string().min(10),
    category: z.string().min(3),
    img: z.string().url().optional().or(z.string().min(1)),
    images: z.array(z.string()).optional(),
    stock: z.number().int().nonnegative(),
    material: z.string().optional(),
    plating: z.string().optional(),
    stone: z.string().optional(),
    length: z.string().optional(),
    weight: z.string().optional(),
    features: z.array(z.string()).optional(),
    hero: z.boolean().optional(),
  }),
});

const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial(),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
};
