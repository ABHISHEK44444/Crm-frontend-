import OEM from '../models/Oem.js';

const getOems = async (req, res) => {
    const oems = await OEM.find({}).sort({ name: 1 });
    res.json(oems);
};

const createOem = async (req, res) => {
    const newOem = new OEM({
        id: `oem${Date.now()}`,
        ...req.body,
    });
    const createdOem = await newOem.save();
    res.status(201).json(createdOem);
};

const updateOem = async (req, res) => {
    const oem = await OEM.findOne({ id: req.params.id });
    if(oem) {
        Object.assign(oem, req.body);
        const updatedOem = await oem.save();
        res.json(updatedOem);
    } else {
        res.status(404).json({ message: 'OEM not found' });
    }
};

export { getOems, createOem, updateOem };
