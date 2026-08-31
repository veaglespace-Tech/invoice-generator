'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.env = void 0;
var _zod = require('zod');
var _dotenv = _interopRequireDefault(require('dotenv'));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
// Load variables from .env if not already loaded
_dotenv.default.config();
const envSchema = _zod.z.object({
  PORT: _zod.z.string().default('5000'),
  DATABASE_URL: _zod.z.string().url(),
  JWT_SECRET: _zod.z.string().min(1),
  JWT_REFRESH_SECRET: _zod.z.string().min(1).optional(),
  NODE_ENV: _zod.z
    .enum(['development', 'production', 'test'])
    .default('development')
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
  console.error('❌ Invalid environment variables:\n', _env.error.format());
  process.exit(1);
}
const env = (exports.env = _env.data);
