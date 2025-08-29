import Product from '../models/Product.js';

const getProducts = async (req, res) => {
    const products = await Product.find({}).sort({ name: 1 });
    res.json(products);
};

const createProduct = async (req, res) => {
    const newProduct = new Product({
        id: `prod${Date.now()}`,
        ...req.body,
    });
    const createdProduct = await newProduct.save();
    res.status(201).json(createdProduct);
};

const updateProduct = async (req, res) => {
    const product = await Product.findOne({ id: req.params.id });
    if(product) {
        Object.assign(product, req.body);
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

const deleteProduct = async (req, res) => {
    const product = await Product.findOne({ id: req.params.id });
    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

export { getProducts, createProduct, updateProduct, deleteProduct };
