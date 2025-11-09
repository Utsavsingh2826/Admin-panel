"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const authorize_1 = require("../middleware/authorize");
const router = express_1.default.Router();
// All routes require authentication and superadmin role
router.use(auth_1.protect);
router.use((0, authorize_1.authorize)('superadmin'));
router.route('/')
    .get(userController_1.getUsers)
    .post(userController_1.createUser);
router.route('/:id')
    .get(userController_1.getUser)
    .put(userController_1.updateUser)
    .delete(userController_1.deleteUser);
router.route('/:id/toggle-status')
    .patch(userController_1.toggleUserStatus);
router.route('/:id/unlock')
    .patch(userController_1.unlockUser);
router.route('/:id/reset-password')
    .patch(userController_1.resetPassword);
exports.default = router;
//# sourceMappingURL=users.js.map