const bcrypt = require('bcrypt');
const userModel = require('../model/userModel');
const userService = require("./userService");
const userVerification = require('../model/userVerification');

const authorize = async (authorization_header) => {
    try { const userData = new Buffer.from(authorization_header.split(' ')[1],'base64').toString().split(':');
    const email = userData[0];
    const password = userData[1];
    const user = await checkUserExists(email);
    if(!user.verified){
        
        const notVerifiedErr = new Error('User not verified');
        notVerifiedErr.statusCode = 403;
        throw notVerifiedErr;
    }
    await checkPasswordorToken(password, user.password);
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
   
   
    return user;
}

const checkPasswordorToken = async (password, encryptedPassword) => {
    const isPasswordValid = await bcrypt.compare(password, encryptedPassword);
    if (!isPasswordValid) {
        const authError = new Error('Invalid password or token');
        authError.statusCode = 401;
        throw authError;
    }
}

const login = async (email, password) => {
    try {
        const user = await checkUserExists(email);
        await checkPasswordorToken(password, user.password);

        return Buffer.from(`${email}:${password}`).toString('base64');
    } catch (err) {
        const dbError = new Error(err.message);
            
        dbError.statusCode = err.statusCode || 503; 
        throw dbError;
    }
};


const verify = async (email, token) => {
    try {
        const user = await checkUserExists(email);
        if (user.verified) {
            const verificationErr = new Error("User is already verified");
            verificationErr.statusCode = 400; 
            throw verificationErr;              
        }

        console.log(user.id);
        const verificationDetails = await userVerification.findOne({
            where: { email: user.email }
        });

        if (!verificationDetails || !verificationDetails.token || !token) {
            const verificationErr = new Error("No token to information found for user");
            verificationErr.statusCode =  400; 
            throw verificationErr;              
        }

            if (new Date() > new Date(verificationDetails.expiresAt)) {
                const verificationErr = new Error("Code is expired");
                verificationErr.statusCode = 400; 
                throw verificationErr;              
            }

            
        await checkPasswordorToken(token, verificationDetails.token);

    const userData = {
        verified : true,
    }
    return userData;
    

    } catch (err) {
        const dbError = new Error(err.message);
        dbError.statusCode = err.statusCode || 503; 
        throw dbError;
    }
};



const reverify = async (email) => {
    try {
        const user = await checkUserExists(email);
        if (user.verified) {
            const verificationErr = new Error("User is already verified");
            verificationErr.statusCode = 400; 
            throw verificationErr;              
        }

        return await userService.sendToSNS(user, userService.generateVerificationCode());
    

    } catch (err) {
        const dbError = new Error(err.message);
        dbError.statusCode = err.statusCode || 503; 
        throw dbError;
    }
};
module.exports = {
    login,
    authorize,
    verify,
    reverify,
};
