"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMeOrg = exports.deleteOrganization = exports.updateOrganizationStatus = exports.updateOrganization = exports.createOrganization = exports.getOrganizationById = exports.getAllOrganizations = void 0;
const server_1 = require("../server");
const organization_validator_1 = require("../validators/organization.validator");
const hash_1 = require("../utils/hash");
const getAllOrganizations = async (req, res, next) => {
    try {
        const orgs = await server_1.prisma.organization.findMany({
            where: { is_deleted: false },
            include: {
                _count: {
                    select: { users: true, customers: true, invoices: true }
                }
            }
        });
        res.status(200).json({ success: true, data: orgs });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllOrganizations = getAllOrganizations;
const getOrganizationById = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Enforce data isolation if not Super Admin
        if (req.user?.role !== 'SUPER_ADMIN' && req.user?.organization_id !== id) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        const org = await server_1.prisma.organization.findUnique({
            where: { id, is_deleted: false },
            include: {
                settings: true
            }
        });
        if (!org) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }
        res.status(200).json({ success: true, data: org });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrganizationById = getOrganizationById;
const createOrganization = async (req, res, next) => {
    try {
        const data = organization_validator_1.createOrganizationSchema.parse(req.body);
        const existingUser = await server_1.prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists for admin user' });
        }
        const hashedPassword = await (0, hash_1.hashPassword)(data.adminPassword);
        const result = await server_1.prisma.$transaction(async (tx) => {
            const org = await tx.organization.create({
                data: {
                    name: data.name,
                    email: data.email,
                }
            });
            const user = await tx.user.create({
                data: {
                    organization_id: org.id,
                    name: data.adminName,
                    email: data.email,
                    password: hashedPassword,
                    role: 'ORGANIZATION_ADMIN'
                }
            });
            await tx.invoiceSetting.create({
                data: { organization_id: org.id }
            });
            return org;
        });
        res.status(201).json({ success: true, message: 'Organization created', data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.createOrganization = createOrganization;
const updateOrganization = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { settings, ...orgData } = organization_validator_1.updateOrganizationSchema.parse(req.body);
        if (req.user?.role !== 'SUPER_ADMIN' && req.user?.organization_id !== id) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        if (req.user?.role !== 'SUPER_ADMIN') {
            delete orgData.plan; // Normal admins cannot change plan directly
        }
        const org = await server_1.prisma.organization.update({
            where: { id },
            data: {
                ...orgData,
                ...(settings && {
                    settings: {
                        upsert: {
                            create: settings,
                            update: settings
                        }
                    }
                })
            },
            include: {
                settings: true
            }
        });
        res.status(200).json({ success: true, message: 'Organization updated', data: org });
    }
    catch (error) {
        next(error);
    }
};
exports.updateOrganization = updateOrganization;
const updateOrganizationStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = organization_validator_1.updateOrgStatusSchema.parse(req.body);
        const org = await server_1.prisma.organization.update({
            where: { id },
            data: { status }
        });
        res.status(200).json({ success: true, message: `Organization status updated to ${status}`, data: org });
    }
    catch (error) {
        next(error);
    }
};
exports.updateOrganizationStatus = updateOrganizationStatus;
const deleteOrganization = async (req, res, next) => {
    try {
        const { id } = req.params;
        await server_1.prisma.organization.update({
            where: { id },
            data: {
                is_deleted: true,
                deleted_at: new Date()
            }
        });
        res.status(200).json({ success: true, message: 'Organization deleted' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteOrganization = deleteOrganization;
const getMeOrg = async (req, res, next) => {
    try {
        const orgId = req.user?.organization_id;
        if (!orgId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const org = await server_1.prisma.organization.findUnique({
            where: { id: orgId, is_deleted: false },
            include: {
                settings: true
            }
        });
        if (!org) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }
        res.status(200).json({ success: true, data: org });
    }
    catch (error) {
        next(error);
    }
};
exports.getMeOrg = getMeOrg;
//# sourceMappingURL=organization.controller.js.map