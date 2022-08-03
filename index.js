const express = require("express");
const app = express();
var cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@knotbusinesssolution.ooaeydf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

async function run() {
    try {
        await client.connect();
        // console.log('connected')
        const taskCollection = client.db("Tasks").collection("task");
        const userCollecton = client.db('Tasks').collection('user');
        const userInfoCollection = client.db("Tasks").collection("userInfo");

        app.get("/alltasks", async (req, res) => {
            const result = await taskCollection.find({}).toArray();
            res.send(result);
        });

        app.post("/addNewTask", async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result);
        });

        app.post("/inputData", async (req, res) => {
            const user = req.body;
            console.log(user)
            const result = await userInfoCollection.insertOne(user);
            res.send(result);
        });

        app.get("/inputData", async (req, res) => {
            const result = await userInfoCollection.find({}).toArray();
            res.send(result);
        });

        app.get("/leaveData", async (req, res) => {
            const result = await userCollecton.find({}).toArray();
            res.send(result);
        });

        app.get("/leaveData/:id", async (req, res) => {
            const id = req.params.id;
            const query = {_id : ObjectId(id)}
            const result = await userCollecton.findOne(query);
            res.send(result);
        });

        app.get('/user', async (req, res) => {

            const query = {};
            const carsor = userCollecton.find(query);
            const user = await carsor.toArray();
            res.send(user);
        })

        app.post('/user', async (req, res) => {
            const newuser = req.body;
            const result = await userCollecton.insertOne(newuser);

            res.send(result);
        });
        console.log("connected");
    } 
    finally {
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Knot server running on port ${port}`);
});
