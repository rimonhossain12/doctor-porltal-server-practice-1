const { MongoClient } = require('mongodb');
const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors');
const { query } = require('express');
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
        const usersCollection = database.collection('users');

        // get api
        app.get('/appointments', async (req, res) => {
            const email = req.query.email;
            const date = new Date(req.query.date).toLocaleDateString();
            const query = { email: email, date };
            const cursor = appointmentsCollection.find(query);
            const appointment = await cursor.toArray();
            res.json(appointment);
        });
        // checking user admin or not amdin
        app.get('/user/:email',async(req,res) => {
            const email = req.params.email;
            const query = {email:email};
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin=true;
            }
            res.json({admin:isAdmin})
            console.log(isAdmin);
        })
        // post api
        app.post('/appointments', async (req, res) => {
            const appointment = req.body;
            const result = await appointmentsCollection.insertOne(appointment);
            res.json(result);
        });
        // save all register user to database
        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });
        // added one user at one time
        app.put('/user', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
        });
        // make admin api
        app.put('/user/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

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