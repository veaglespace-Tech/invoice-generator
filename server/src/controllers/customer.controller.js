"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomerById = exports.getAllCustomers = void 0;
const server_1 = require("../server");
const customer_validator_1 = require("../validators/customer.validator");
const getAllCustomers = async (req, res, next) => {
    try {
        const filter = { is_deleted: false };
        if (req.user?.role !== 'SUPER_ADMIN') {
            filter.organization_id = req.user?.organization_id;
        }
        else if (req.query.organization_id) {
            filter.organization_id = req.query.organization_id;
        }
        const customers = await server_1.prisma.customer.findMany({ where: filter });
        res.status(200).json({ success: true, data: customers });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllCustomers = getAllCustomers;
const getCustomerById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const filter = { id, is_deleted: false };
        if (req.user?.role !== 'SUPER_ADMIN') {
            filter.organization_id = req.user?.organization_id;
        }
        const customer = await server_1.prisma.customer.findFirst({ where: filter });
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.status(200).json({ success: true, data: customer });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerById = getCustomerById;
const createCustomer = async (req, res, next) => {
    try {
        const data = customer_validator_1.createCustomerSchema.parse(req.body);
        // Default to req.user.organization_id unless SUPER_ADMIN specifies one
        let targetOrgId = req.user?.organization_id;
        if (req.user?.role === 'SUPER_ADMIN' && req.body.organization_id) {
            targetOrgId = req.body.organization_id;
        }
        if (!targetOrgId) {
            return res.status(400).json({ success: false, message: 'Organization ID is required' });
        }
        const customer = await server_1.prisma.customer.create({
            data: {
                ...data,
                organization_id: targetOrgId
            }
        });
        res.status(201).json({ success: true, message: 'Customer created', data: customer });
    }
    catch (error) {
        next(error);
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = customer_validator_1.updateCustomerSchema.parse(req.body);
        const filter = { id, is_deleted: false };
        if (req.user?.role !== 'SUPER_ADMIN') {
            filter.organization_id = req.user?.organization_id;
        }
        const existingCustomer = await server_1.prisma.customer.findFirst({ where: filter });
        if (!existingCustomer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        const updatedCustomer = await server_1.prisma.customer.update({
            where: { id },
            data
        });
        res.status(200).json({ success: true, message: 'Customer updated', data: updatedCustomer });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const filter = { id, is_deleted: false };
        if (req.user?.role !== 'SUPER_ADMIN') {
            filter.organization_id = req.user?.organization_id;
        }
        const existingCustomer = await server_1.prisma.customer.findFirst({ where: filter });
        if (!existingCustomer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        await server_1.prisma.customer.update({
            where: { id },
            data: { is_deleted: true, deleted_at: new Date() }
        });
        res.status(200).json({ success: true, message: 'Customer deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCustomer = deleteCustomer;
//# sourceMappingURL=customer.controller.js.map