'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.updateProduct =
  exports.getProductById =
  exports.getAllProducts =
  exports.deleteProduct =
  exports.createProduct =
    void 0;
var _express = require('express');
var _server = require('../server');
var _client = require('@prisma/client');
var _product = require('../validators/product.validator');
const getAllProducts = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user?.role !== _client.Role.SUPER_ADMIN) {
      filter.organization_id = req.user?.organization_id;
    } else if (req.query.organization_id) {
      filter.organization_id = req.query.organization_id;
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      _server.prisma.product.findMany({
        where: filter,
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limit
      }),
      _server.prisma.product.count({
        where: filter
      })
    ]);
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = {
      id
    };
    if (req.user?.role !== _client.Role.SUPER_ADMIN) {
      filter.organization_id = req.user?.organization_id;
    }
    const product = await _server.prisma.product.findFirst({
      where: filter
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};
exports.getProductById = getProductById;
const createProduct = async (req, res, next) => {
  try {
    const data = _product.createProductSchema.parse(req.body);
    let targetOrgId = req.user?.organization_id;
    if (
      req.user?.role === _client.Role.SUPER_ADMIN &&
      req.body.organization_id
    ) {
      targetOrgId = req.body.organization_id;
    }
    if (!targetOrgId) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID is required'
      });
    }
    const product = await _server.prisma.product.create({
      data: {
        ...data,
        organization_id: targetOrgId
      }
    });
    res.status(201).json({
      success: true,
      message: 'Product created',
      data: product
    });
  } catch (error) {
    next(error);
  }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = _product.updateProductSchema.parse(req.body);
    const filter = {
      id
    };
    if (req.user?.role !== _client.Role.SUPER_ADMIN) {
      filter.organization_id = req.user?.organization_id;
    }
    const existingProduct = await _server.prisma.product.findFirst({
      where: filter
    });
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    const updatedProduct = await _server.prisma.product.update({
      where: {
        id
      },
      data
    });
    res.status(200).json({
      success: true,
      message: 'Product updated',
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = {
      id
    };
    if (req.user?.role !== _client.Role.SUPER_ADMIN) {
      filter.organization_id = req.user?.organization_id;
    }
    const existingProduct = await _server.prisma.product.findFirst({
      where: filter
    });
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    await _server.prisma.product.update({
      where: {
        id
      },
      data: {
        is_deleted: true,
        deleted_at: new Date()
      }
    });
    res.status(200).json({
      success: true,
      message: 'Product deleted'
    });
  } catch (error) {
    next(error);
  }
};
exports.deleteProduct = deleteProduct;
