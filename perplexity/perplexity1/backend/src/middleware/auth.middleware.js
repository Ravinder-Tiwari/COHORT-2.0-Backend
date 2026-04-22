import jwt   from "jsonwebtoken"



export function authUser(req,res,next){
    // console.log("hii")
    const token = req.cookies.token
    // console.log(token)
    if(!token){
        const err = new Error("No token provided")
        err.status = 401
        return next(err)
    }
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        req.user = decoded

        next()
    }catch(err){
        next(err)
    }
}