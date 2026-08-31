'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.verifyRefreshToken =
  exports.verifyAccessToken =
  exports.generateRefreshToken =
  exports.generateAccessToken =
    void 0;
var _jsonwebtoken = _interopRequireDefault(require('jsonwebtoken'));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_here';
const generateAccessToken = (payload) => {
  return _jsonwebtoken.default.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: '24h'
  });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
  return _jsonwebtoken.default.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: '7d'
  });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
  return _jsonwebtoken.default.verify(token, ACCESS_TOKEN_SECRET);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
  return _jsonwebtoken.default.verify(token, REFRESH_TOKEN_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
