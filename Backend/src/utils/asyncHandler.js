// !st Method  -- asynxc handler ek function accept krta h and promise return krta h 
const asyncHandler = (requestHandler)=>{
return(req,res,next)=>{
    Promise
    .resolve(requestHandler(req,res,next))
    .catch((err)=> next(err))
}
}
export { asyncHandler }