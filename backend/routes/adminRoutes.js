import express from 'express';
import { 
    getDepartments, addDepartment, deleteDepartment,
    getDesignations, addDesignation, deleteDesignation,
    getTemplates, addTemplate, updateTemplate, deleteTemplate
} from '../controllers/adminController.js';
const router = express.Router();

// Department Routes
router.route('/departments').get(getDepartments).post(addDepartment);
router.route('/departments/:id').delete(deleteDepartment);

// Designation Routes
router.route('/designations').get(getDesignations).post(addDesignation);
router.route('/designations/:id').delete(deleteDesignation);

// Template Routes
router.route('/templates').get(getTemplates).post(addTemplate);
router.route('/templates/:id').put(updateTemplate).delete(deleteTemplate);

export default router;
