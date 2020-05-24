const User = require("../model/user");
const bcrypt = require("bcrypt");
const jsw = require("jsonwebtoken");

exports.userSignup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(result => {
                    res.status(201).json({
                        message: 'User created',
                        result: result
                    });
                }).catch(err => {
                    res.status(500).json({
                        error: err
                    });
                });
        });
};

exports.userLogin = (req, res, next) => {
    let fecthUser;
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    message: 'Sorry, we can\'t find an account with this email address.'
                });
            }
            fecthUser = user;
            return bcrypt.compare(req.body.password, user.password);
        })
        .then(result => {
            if (!result) {
                res.status(401).json({
                    message: 'Auth failed'
                });
            }
            const token = jsw.sign(
                {
                    email: fecthUser.email, userId: fecthUser._id
                },
                'secret_this_should_be_longer',
                { expiresIn: '1h' }
            );
            res.status(200).json({
                token: token,
                expiresIn: 3600,
                userId: fecthUser._id
            });
        }).catch(err => {
            return res.status(401).json({
                message: 'Auth failed'
            });
        });
};