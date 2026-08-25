"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const server_1 = require("../server");
const product_validator_1 = require("../validators/product.validator");
const getAllProducts = async (req, res, next) => {
    try {
        const filter = { is_deleted: false };
        if (req.user?.role !== 'SUPER_ADMIN') {
            filter.organization_id = req.user?.organization_id;
        }
        else if (req.query.organization_id) {
            filter.organization_id = req.query.organization_id;
        }
        const products = await server_1.prisma.product.findMany({ where: filter });
        res.status(200).json({ success: true, data: products });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const filter = { id, is_deleted: false };
        if (req.user?.role !== 'SUPER_ADMIN') {
            filter.organization_id = req.user?.organization_id;
        }
        const product = await server_1.prisma.product.findFirst({ where: filter });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, data: product });
    }
    catch (error) {
        next(error);
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res, next) => {
    try {
        const data = product_validator_1.createProductSchema.parse(req.body);
        let targetOrgId = req.user?.organization_id;
        if (req.user?.role === 'SUPER_ADMIN' && req.body.organization_id) {
            targetOrgId = req.body.organization_id;
        }
        if (!targetOrgId) {
            return res.status(400).json({ success: false, message: 'Organization ID is required' });
        }
        const product = await server_1.prisma.product.create({
            data: {
                ...data,
                organization_id: targetOrgId
            }
        });
        res.status(201).json({ success: true, message: 'Product created', data: product });
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = product_validator_1.updateProductSchema.parse(req.body);
        const filter = { id, is_deleted: false };
        if (req.user?.role !== 'SUPER_ADMIN') {
            filter.organization_id = req.user?.organization_id;
        }
        const existingProduct = await server_1.prisma.product.findFirst({ where: filter });
        if (!existingProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        const updatedProduct = await server_1.prisma.product.update({
            where: { id },
            data
        });
        res.status(200).json({ success: true, message: 'Product updated', data: updatedProduct });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const filter = { id, is_deleted: false };
        if (req.user?.role !== 'SUPER_ADMIN') {
            filter.organization_id = req.user?.organization_id;
        }
        const existingProduct = await server_1.prisma.product.findFirst({ where: filter });
        if (!existingProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        await server_1.prisma.product.update({
            where: { id },
            data: { is_deleted: true, deleted_at: new Date() }
        });
        res.status(200).json({ success: true, message: 'Product deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
//# sourceMappingURL=product.controller.js.map