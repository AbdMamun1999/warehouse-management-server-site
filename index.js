const express = require('express');
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r9tgh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {

    try {
        await client.connect();
        const inventoryCollection = client.db('warehouse-management').collection('inventory')


        // get all data from database
        app.get('/inventories',async(req,res)=>{
            const query = {}
            const cursor = inventoryCollection.find(query)
            const inventories = await cursor.toArray();
            res.send(inventories)
        })

        // get 6 data from database
        app.get('/inventory', async (req, res) => {
            const query = {}
            const cursor = inventoryCollection.find(query).limit(6)
            const inventories = await cursor.toArray();
            res.send(inventories)

        })

        // get single data with id
        app.get('/inventory/:id',async (req,res)=>{
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const result = await inventoryCollection.findOne(query)
            res.send(result)
        })

        // const update data with id
        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id
            const updateQuantity = req.body;
            console.log(id, updateQuantity)
            const filter = { _id: ObjectId(id) }
            console.log(filter)
            const options = { upsert: true };
            const updatedQuantity = {
                $set: {
                    quantity: updateQuantity.currentQuantity ,
                }
            }
            const result = await inventoryCollection.updateOne(filter,updatedQuantity,options)
            res.send(result)
        })

        // Delete Data with id
        app.delete('/inventory/:id',async(req,res)=>{
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            console.log(query)
            const result = await inventoryCollection.deleteOne(query)
            res.send(result)
        })


    }
    finally { }

}

run().catch(console.dir)
/* client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
}); */


app.get('/', (req, res) => {
    res.send('start warehouse management server')
})

app.listen(port, () => {
    console.log('warehouse management port:', port)
})