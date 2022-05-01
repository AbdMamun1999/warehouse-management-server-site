const express = require('express');
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r9tgh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){

    try{
        await client.connect();
        const inventoryCollection = client.db('warehouse-management').collection('inventory')

        // get all data from database
        app.get('/inventory',async (req,res)=>{
            const query = {}
            const cursor =  inventoryCollection.find(query).limit(6)
            const inventories = await cursor.toArray();
            res.send(inventories)

        })
    }
    finally{}

}

run().catch(console.dir)
/* client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
}); */


app.get('/',(req,res)=>{
    res.send('start warehouse management server')
})

app.listen(port,()=>{
    console.log('warehouse management port:',port)
})