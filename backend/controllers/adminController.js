import Department from '../models/Department.js';
import Designation from '../models/Designation.js';
import BiddingTemplate from '../models/BiddingTemplate.js';

// Departments
export const getDepartments = async (req, res) => res.json(await Department.find({}));
export const addDepartment = async (req, res) => res.status(201).json(await new Department({ id: `dept${Date.now()}`, name: req.body.name }).save());
export const deleteDepartment = async (req, res) => {
    await Department.deleteOne({ id: req.params.id });
    res.json({ message: 'Department deleted' });
};

// Designations
export const getDesignations = async (req, res) => res.json(await Designation.find({}));
export const addDesignation = async (req, res) => res.status(201).json(await new Designation({ id: `desig${Date.now()}`, name: req.body.name }).save());
export const deleteDesignation = async (req, res) => {
    await Designation.deleteOne({ id: req.params.id });
    res.json({ message: 'Designation deleted' });
};

// Bidding Templates
export const getTemplates = async (req, res) => res.json(await BiddingTemplate.find({}));
export const addTemplate = async (req, res) => res.status(201).json(await new BiddingTemplate({ id: `btemp${Date.now()}`, ...req.body }).save());
export const updateTemplate = async (req, res) => {
    const template = await BiddingTemplate.findOne({ id: req.params.id });
    if(template) {
        Object.assign(template, req.body);
        res.json(await template.save());
    } else {
        res.status(404).json({ message: 'Template not found' });
    }
};
export const deleteTemplate = async (req, res) => {
    await BiddingTemplate.deleteOne({ id: req.params.id });
    res.json({ message: 'Template deleted' });
};
