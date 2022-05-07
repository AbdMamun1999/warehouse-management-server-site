const express = require('express');
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())

function authorization(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ massage: 'unauthorized aceess' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ massage: 'Forbiden access' })
        }
        console.log(decoded, 'decoded')
        req.decoded = decoded;
        next();
    })
    
}

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r9tgh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {

    try {
        await client.connect();
        const inventoryCollection = client.db('warehouse-management').collection('inventory')

        // auth 
        app.post('/login', async (req, res) => {
            const user = req.body
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken })
        })

        // get all data from database
        app.get('/inventories', async (req, res) => {
            const query = {}
            const cursor = inventoryCollection.find(query)
            const inventories = await cursor.toArray();
            res.send(inventories)
        })

        // search by email
        app.get('/myItems', authorization, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email }
                const cursor = inventoryCollection.find(query)
                const inventories = await cursor.toArray();
                res.send(inventories)
            }
            else {
                res.status(403).send({ massage: 'Forbiden access' })
            }
        })

        // get 6 data from database
        app.get('/inventory', async (req, res) => {
            const query = {}
            const cursor = inventoryCollection.find(query).limit(6)
            const inventories = await cursor.toArray();
            res.send(inventories)

        })

        // get single data with id
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
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
                    quantity: updateQuantity.currentQuantity,
                }
            }
            const result = await inventoryCollection.updateOne(filter, updatedQuantity, options)
            res.send(result)
        })

        // Delete Data with id
        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            console.log(query)
            const result = await inventoryCollection.deleteOne(query)
            res.send(result)
        })

        // delete myItem data with id
        /* app.delete('/myItems/:id', async(req,res)=>{
            const id = req.params.id
            console.log(id)
            const query = {_id:ObjectId(id)}
            const result = await inventoryCollection.deleteOne(query)
            res.send(result)
        }) */



        // post data in database
        app.post('/inventory', async (req, res) => {
            const img = req.body
            const result = await inventoryCollection.insertOne(img)
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