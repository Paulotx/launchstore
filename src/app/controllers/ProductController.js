const { unlinkSync } = require("fs");

const Category = require("../models/Category");
const Product  = require("../models/Product");
const File     = require("../models/File");
const LoadProductServices = require("../services/LoadProductServices");

module.exports = {
    async create(req, res) {
        try {
            const categories = await Category.findAll();
            return res.render("products/create", { categories });
        } 
        catch (err) {
            console.error(err);
        }
    },

    async post(req, res) {
        try {
            const { category_id, name, description, old_price, price, quantity, status } = req.body;

            const productId = await Product.create({
                category_id,
                user_id: req.session.userId,
                name,
                description,
                old_price: old_price || price.replace(/\D/g, ""),
                price: price.replace(/\D/g, ""),
                quantity,
                status: status || 1
            });

            const filesPromisse = req.files.map(file => File.create({name: file.filename, path:file.path, product_id: productId }));
            await Promise.all(filesPromisse);
            return res.redirect(`/`);
        }
        catch(err) {
            console.error(err);
        }
    },

    async show(req, res) {
        try {
            const product = await LoadProductServices.load("product", { where: { id: req.params.id } });

            if(!product) return res.send("Product Not Found!");

            return res.render("products/show", { product });
        } 
        catch (err) {
            console.error(err);
        }
    },

    async edit(req, res) {
        try {
            const product = await LoadProductServices.load("product", { where: { id: req.params.id } });

            if(!product) return res.send("Product not found!");

            const categories = await Category.findAll();

            return res.render("products/edit", { product, categories });
        } 
        catch (err) {
            console.error(err);
        }
    },

    async put(req, res) {
        try {
            if(req.files.length != 0) {
                const newFilesPromisse = req.files.map(file => File.create({ name: file.filename, path: file.path, user_id: req.body.id }));
                await Promise.all(newFilesPromisse);
            }

            if(req.body.removed_files) {
                const removedFiles = req.body.removed_files.split(",");
                const lastIndex    = removedFiles.length - 1;

                removedFiles.splice(lastIndex, 1);

                const removedFilesPromise = removedFiles.map(id => File.delete(id));
                
                await Promise.all(removedFilesPromise);
            }

            if(req.body.old_price != req.body.price) {
                const oldProduct = await Product.find(req.body.id);
                
                if(oldProduct.price != req.body.price.replace(/\D/g, "")) {
                    req.body.old_price = oldProduct.price;
                }            
            }
            
            await Product.update(req.body.id, {
                category_id: req.body.category_id,
                name: req.body.name,
                description: req.body.description,
                old_price: req.body.old_price,
                price: req.body.price.replace(/\D/g, ""),
                quantity: req.body.quantity,
                status: req.body.status,
            });
            
            return res.redirect(`/products/${ req.body.id }`);

        } catch (err) {
            console.error(err);
        }
    },

    async delete(req, res) {
        const files = await Product.files(req.body.id);
        await Product.delete(req.body.id);

        files.map(file => {
            try {
                unlinkSync(file.path);
            }
            catch(err) {
                console.error(err);
            }
        });

        return res.redirect("/products/create");
    }
}