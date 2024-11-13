const bcrypt = require('bcrypt');
const userModel = require('../model/userModel');

const authorize = async (authorization_header) => {
    try { const userData = new Buffer.from(authorization_header.split(' ')[1],'base64').toString().split(':');
    const email = userData[0];
    const password = userData[1];
    const user = await checkUserExists(email);
    await checkPassword(password, user.password);
    return user.toJSON(); }
    catch (err) {
        const dbError = new Error(err.message);
            
        dbError.statusCode = err.statusCode || 503; 
        throw dbError;
    }

}

const checkUserExists = async (email) => {
    const user = await userModel.scope('withAllDetails').findOne({
       
        where: { email },
    });

    if (!user) {
        
        const notFoundError = new Error('User not found');
        notFoundError.statusCode = 401;
        throw notFoundError;
    }
    if(!user.verified){
        
        const notVerifiedErr = new Error('User not verified');
        notVerifiedErr.statusCode = 401;
        throw notVerifiedErr;
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
            
        dbError.statusCode = err.statusCode || 503; 
        throw dbError;
    }
};

module.exports = {
    login,
    authorize
};
