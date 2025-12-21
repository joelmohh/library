const Router = require('express').Router();
const c = require('@joelmo/console-color')();

const Categories = require('../../models/Categories');
const { getLoginInformation, isAdmin } = require('../../modules/verify');

Router.get('/all', async (req, res) => {
    try {
        const categories = await Categories.find().exec();
        return res.status(200).send({ status: 'success', data: categories });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});
Router.post('/add', getLoginInformation, isAdmin, async (req, res) => {
    try {
        const { name } = req.body;  
        if (!name) {
            return res.status(400).send({ status: 'error', message: 'Missing required fields' });
        }
        const newCategory = new Categories({
            name
        });
        await newCategory.save();
        return res.status(201).send({ status: 'success', message: 'Category added successfully' });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }   
});
Router.delete('/delete', getLoginInformation, isAdmin, async (req, res) => {
    try {
        const { categoryId } = req.body;
        if (!categoryId) {
            return res.status(400).send({ status: 'error', message: 'Missing required fields' });
        }
        const category = await Categories.findById(categoryId);
        if (!category) {
            return res.status(404).send({ status: 'error', message: 'Category not found' });
        }
        await Categories.deleteOne({ _id: categoryId });
        return res.status(200).send({ status: 'success', message: 'Category deleted successfully' });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});
Router.put('/update', getLoginInformation, isAdmin, async (req, res) => {
    try {
        const { categoryId, name } = req.body;
        if (!categoryId || !name) {
            return res.status(400).send({ status: 'error', message: 'Missing required fields' });
        }
        const category = await Categories.findById(categoryId);
        if (!category) {
            return res.status(404).send({ status: 'error', message: 'Category not found' });
        }
        category.name = name;
        await category.save();
        return res.status(200).send({ status: 'success', message: 'Category updated successfully' });
    } catch (err) {
        c.log('red', `[ERROR] ${err}`);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }   
});

module.exports = Router;