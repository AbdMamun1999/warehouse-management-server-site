const express = require('express');
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())

app.get('/',(req,res)=>{
    res.send('start warehouse management server')
})

app.listen(port,()=>{
    console.log('warehouse management port:',port)
})