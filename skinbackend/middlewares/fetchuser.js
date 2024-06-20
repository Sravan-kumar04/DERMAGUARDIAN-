const jwt=require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const JWT_SECRET=process.env.JWT_SECRET;
console.log(JWT_SECRET);
const fetchuser=(req,res,next)=>{

    const token=req.header('auth-token')

    if(!token){
        res.status(401).json({
            status:"fail",
            message:"access denied bro"
        })
    }
    try {
        
        const data=jwt.verify(token,JWT_SECRET);
        console.log("dataaa",data);
    req.user=data.user;
    console.log(req.user)
//     dataaa { user: { id: '66191ed1848fce51c63a2331' }, iat: 1712924409 }
// { id: '66191ed1848fce51c63a2331' }


    next();
    } catch (error) {
        res.status(401).json({
            status:"fail",
            message:"access denied bro"
        })
    }
    
}


module.exports=fetchuser;