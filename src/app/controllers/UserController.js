const User = require("../models/User");
const { hash } = require("bcryptjs");

module.exports = {
    registerForm(req, res) {
        return res.render("users/register");
    },

    async post(req, res) {
        const passwordHash = await hash(req.body.password, 8);

        const values = [
            req.body.name,
            req.body.email,
            passwordHash,
            req.body.cpf_cnpj,
            req.body.cep,
            req.body.address,
        ];

        const results = await User.create(values);

        req.session.userId = results.rows[0].id;

        return res.redirect("/users");
    },

    async show(req, res) {
        const { user } = req;

        return res.render("users/index", { user });
    },

    async update(req, res) {
        try {
            const { user } = req;
            let { name, email, cpf_cnpj, cep, address } = req.body;

            await User.update(user.id, {
                name,
                email,
                cpf_cnpj,
                cep,
                address
            });

            return res.render("users/index", {
                user: req.body,
                success: "Conta atualizada com sucesso!"
            });
        }
        catch(err) {
            console.error(err);
            return res.render("users/index", {
                error: "Algum erro aconteceu"
            });
        }
    },

    async delete(req, res) {
        try {
            await User.delete(req.body.id);
            req.session.destroy()

            return res.render("session/login", {
                success: "Conta deletada com sucesso!"
            });
        } 
        catch (err) {
            console.error(err);

            return res.render("users/index", {
                user: req.body,
                error: "Erro ao tentar deletas sua conta!"
            })
        }
    }
}