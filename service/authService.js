const bcrypt = require('bcrypt');
const userModel = require('../model/userModel'); 

const login = async (email, password) => {
    try {
        const user = await userModel.scope('withPassword').findOne({
            where: { email },
        });

        if (!user) {
            const notFoundError = new Error('User not found');
            notFoundError.statusCode = 404;
            throw notFoundError;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            const authError = new Error('Invalid password');
            authError.statusCode = 401;
            throw authError;
        }

        return Buffer.from(`${email}:${password}`).toString('base64');

    } catch (err) {
        const dbError = new Error(err.message);
        dbError.statusCode = err.statusCode || 400; 
        throw dbError;
    }
};

module.exports = {
    login,
};
