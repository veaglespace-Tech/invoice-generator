'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.hashPassword = exports.comparePassword = void 0;
var _bcrypt = _interopRequireDefault(require('bcrypt'));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
const SALT_ROUNDS = 10;
const hashPassword = async (password) => {
  return _bcrypt.default.hash(password, SALT_ROUNDS);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hash) => {
  return _bcrypt.default.compare(password, hash);
};
exports.comparePassword = comparePassword;
