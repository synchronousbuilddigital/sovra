const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues || error.errors || [];
      return res.status(400).json({
        message: 'Validation failed',
        errors: issues.map((e) => ({
          path: Array.isArray(e.path) ? e.path.join('.') : String(e.path ?? ''),
          message: e.message,
        })),
      });
    }
    next(error);
  }
};

module.exports = validate;
