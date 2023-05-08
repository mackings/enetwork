const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const mg = require("mongoose");
const route = require("./routes/routes");


app.use(express.json());
app.use(route);


try {
    
mg.connect(process.env.DB,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    
},
    console.log("DB Connected")
    );

app.listen(process.env.PORT || 5000 );
} catch (error) {
    
}