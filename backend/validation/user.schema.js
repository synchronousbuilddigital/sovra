const { z } = require('zod');

const registerUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

const loginUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

const updateUserProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    phone: z.string().max(20).optional(),
    preference: z.string().max(50).optional(),
    newsletter: z.boolean().optional(),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().min(6).max(6),
    password: z.string().min(6),
  }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    otp: z.string().min(6).max(6),
  }),
});

module.exports = {
  registerUserSchema,
  loginUserSchema,
  updateUserProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyOtpSchema,
};

