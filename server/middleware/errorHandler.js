const errorHandler = (err, req,res, next) => {
    console.error(err.stack);

    //mongoose validation errror
    if(err.name === 'ValidationError'){
        return res.status(400).json({
            message: Object.values(err.errors).map(e => e.message).join(', ')
        });
    }

    //mongoose duplicate key error - jaise phone alreday exists
    if(err.code === 11000){
        return res.status(400).json({
            message: `${Object.keys(err.keyValue)[0]} already exists`
        });
    }

    //JWT invalid token
    if(err.name === 'JsonWebTokenError'){
        return res.status(401).json({message: 'Invlid token'});
    }

    //default erver error
    res.status(500).json({message: err.message || 'Server error'});

   
};

module.exports = errorHandler;