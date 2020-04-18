const { formatPrice } = require("../../lib/utils");

const Category = require("../models/Category");
const Product  = require("../models/Product");

module.exports = {
    create(req, res) {

        Category.all()
        .then(function(results) {

            const categories = results.rows;
            return res.render("products/create.njk", { categories });

        }).catch(function(err){
            throw new Error(err);
        });

    },

    async post(req, res) {
        const keys = Object.keys(req.body);

        for(key of keys) {
            if(req.body[key] == "") {
                return res.send("Please, fill all fields!");
            }
        }

        if(req.body.category_id == 0) {
            return res.send("Plese, select a chef!");
        }

        const values = [
            req.body.category_id,
            req.body.user_id || 1,
            req.body.name,
            req.body.description,
            req.body.old_price || req.body.price.replace(/\D/g, ""),
            req.body.price = req.body.price.replace(/\D/g, ""),
            req.body.quantity,
            req.body.status || 1,
        ];

        let results = await Product.create(values);
        const productId = results.rows[0].id;

        return res.redirect(`/products/${ productId }`);
    },

    async edit(req, res) {
        let results   = await Product.find(req.params.id);
        const product = results.rows[0];

        if(!product) return res.send("Product not found!");

        product.price = formatPrice(product.price);

        results = await Category.all();
        const categories = results.rows;

        return res.render("products/edit.njk", { product, categories });
    },

    async put(req, res) {
        const keys = Object.keys(req.body);

        for(key of keys) {
            if(req.body[key] == "") {
                return res.send("Please, fill all fields!");
            }
        }

        if(req.body.old_price != req.body.price) {
            const oldProduct = await Product.find(req.body.id);

            req.body.old_price = oldProduct.rows[0].price;
        }

        const values = [
            req.body.category_id,
            req.body.user_id || 1,
            req.body.name,
            req.body.description,
            req.body.old_price,
            req.body.price = req.body.price.replace(/\D/g, ""),
            req.body.quantity,
            req.body.status || 1,
            req.body.id
        ];

        await Product.update(values);

        return res.redirect(`/products/${ req.body.id }/edit`);
    },

    async delete(req, res) {
        await Product.delete(req.body.id);

        return res.redirect("/products/create");
    }
}