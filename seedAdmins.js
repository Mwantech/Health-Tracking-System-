const bcrypt = require('bcrypt');
const saltRounds = 10;
const plainPassword = 'josh123';

bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
    if (err) {
        console.error('Error hashing password:', err);
    } else {
        // Use this hashedPassword in your SQL statement
        console.log('Hashed password:', hashedPassword);
        // Now you can use this hashedPassword in your SQL statement
    }
});