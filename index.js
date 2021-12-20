const { MongoClient } = require('mongodb');
const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors');
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());

// connection string
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ygqbm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log()
async function run() {
    try {
        await client.connect();
        const database = client.db('doctor-portal2');
        const appointmentsCollection = database.collection('appointments');
        // get api
        app.get('/appointments',async(req,res) => {
            const cursor = appointmentsCollection.find({});
            const appointment = await cursor.toArray();
            res.send(appointment);
        })

        // post api
        app.post('/appointments', async (req, res) => {
            const appointment = req.body;
            const result = await appointmentsCollection.insertOne(appointment);
            console.log(result);
            res.json(result);
        })

    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Doctor portal server running');
})

app.listen(port, () => {
    console.log('Running Doctor port', port);
})