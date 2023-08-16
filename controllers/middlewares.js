import { verify } from "jsonwebtoken";



export async function verifytoken(req, res, next){
try { 
  const token = req.headers.authorization.split(' ')[1];
  const verifyit = verify(token,"jwt");
  if (verifyit) {
    console.log("Verified Token");
    next();
    
  } else {
    res.status(401).json({
      status:"Failed",
      message:error
    })

    
  }
   
  
} catch (error) {
  console.log(error);
  res.status(401).json({
    status:"Failed",
    message:error
  })
  
}
 

}