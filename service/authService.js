const bcrypt = require('bcrypt');
const userModel = require('../model/userModel');

const authorize = async (authorization_header) => {
    const userData = new Buffer.from(authorization_header.split(' ')[1],'base64').toString().split(':');
    const email = userData[0];
    const password = userData[1];
    const user = await checkUserExists(email);
    await checkPassword(password, user.password);
    return user.toJSON(); 

}

const checkUserExists = async (email) => {
    const user = await userModel.scope('withPassword').findOne({
        where: { email },
    });

    if (!user) {
        const notFoundError = new Error('User not found');
        notFoundError.statusCode = 404;
        throw notFoundError;
    }
    return user;
}

const checkPassword = async (password, encryptedPassword) => {
    const isPasswordValid = await bcrypt.compare(password, encryptedPassword);

    if (!isPasswordValid) {
        const authError = new Error('Invalid password');
        authError.statusCode = 401;
        throw authError;
    }
}

const login = async (email, password) => {
    try {
        const user = await checkUserExists(email);
        await checkPassword(password, user.password);

        return Buffer.from(`${email}:${password}`).toString('base64');
    } catch (err) {
        const dbError = new Error(err.message);
        dbError.statusCode = err.statusCode || 400; 
        throw dbError;
    }
};

module.exports = {
    login,
    authorize
};
