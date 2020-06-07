const Cart = require("../../lib/cart");

const LoadProductServices = require("../services/LoadProductServices");

module.exports = {
    async index(req, res) {
        try {
            let { cart } = req.session;

            cart = Cart.init(cart);

            return res.render("cart/index", { cart });
        } 
        catch (err) {
            console.error(err);
        }        
    },

    async addOne(req, res) {
        const { id } = req.params;
        const product = await LoadProductServices.load("product", { where: { id }});

        let { cart } = req.session;

        cart = Cart.init(cart).addOne(product);

        req.session.cart = cart;

        return res.redirect("/cart");
    },

    removeOne(req, res) {
        let { id }   = req.params;
        let { cart } = req.session;

        if(!cart) return res.redirect("/cart");
        
        cart = Cart.init(cart).removeOne(id);

        req.session.cart = cart;

        return res.redirect("/cart");
    },

    delete(req, res) {
        let { cart } = req.session;
        const { id } = req.params;

        if(!cart) return;

        cart = Cart.init(cart).delete(id);

        req.session.cart = cart;

        return res.redirect("/cart");
    }
}