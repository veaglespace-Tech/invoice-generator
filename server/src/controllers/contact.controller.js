'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.markLeadAsRead = exports.getLeads = exports.createLead = void 0;
var _express = require('express');
var _client = require('@prisma/client');
const prisma = new _client.PrismaClient();
const createLead = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    const lead = await prisma.contactLead.create({
      data: {
        name,
        email,
        message
      }
    });
    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully',
      data: lead
    });
  } catch (error) {
    console.error('Create Lead Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};
exports.createLead = createLead;
const getLeads = async (req, res) => {
  try {
    // We expect this to be protected by superAdminAuth middleware
    const leads = await prisma.contactLead.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.status(200).json({
      success: true,
      data: leads
    });
  } catch (error) {
    console.error('Get Leads Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leads',
      error: error.message
    });
  }
};
exports.getLeads = getLeads;
const markLeadAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await prisma.contactLead.update({
      where: {
        id
      },
      data: {
        status: 'READ'
      }
    });
    res.status(200).json({
      success: true,
      message: 'Lead marked as read',
      data: lead
    });
  } catch (error) {
    console.error('Mark Lead Read Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating lead',
      error: error.message
    });
  }
};
exports.markLeadAsRead = markLeadAsRead;
