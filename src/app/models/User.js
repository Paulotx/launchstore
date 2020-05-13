const db = require('../../config/db');

const fs = require("fs");
const Product = require("../models/Product");

module.exports = {
    async findOne(filters) {
        try {
            let query = "SELECT * FROM users";

            Object.keys(filters).map(key => {
                query = `
                    ${ query }
                    ${ key }
                `;

                Object.keys(filters[key]).map(field => {
                    query = `${ query } ${ field } = '${ filters[key][field] }'`;
                });
            });

            const results = await db.query(query);

            return results.rows[0];
        }
        catch(err) {
            console.error(err);
        }        
    },

    async create(values) {
        try {
            const query = `
                INSERT INTO users (
                    name,
                    email,
                    password,
                    cpf_cnpj,
                    cep,
                    address
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `;

            return db.query(query, values);
        }
        catch(err) {
            console.error(err);
        }        
    },

    async update(id, fields) {
        let query = "UPDATE users SET";

        Object.keys(fields).map((key, index, array) => {
            if((index + 1) < array.length) {
                query = `${ query }
                    ${ key } = '${ fields[key] }',
                `
            } 
            else {
                query = `${ query }
                    ${ key } = '${ fields[key] }'
                    WHERE id = ${ id }
                `
            }
        });

        await db.query(query);
    },

    async delete(id) {
        let results = await db.query("SELECT * FROM products WHERE user_id = $1", [ id ]);
        const products = results.rows;

        const allFilesPromise = products.map(product => Product.files(product.id));

        let promiseResults = await Promise.all(allFilesPromise);

        await db.query("DELETE FROM users WHERE id = $1", [ id ]);

        promiseResults.map(results => {
            try{
                results.rows.map(file => fs.unlinkSync(file.path));
            }
            catch(err){
                console.error(err);
            }
            
        });        
    }
}