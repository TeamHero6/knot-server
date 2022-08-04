const express = require("express");
const app = express();
var cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

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
        client.connect();
        const taskCollection = client.db("Tasks").collection("task");
        const userCollecton = client.db('Tasks').collection('user');
        const hrCollectons = client.db('HrManagement').collection('performance');
        const transferCollectons = client.db('HrManagement').collection('transfer');
        const payrollsCollectons = client.db('HrManagement').collection('payrolls');

        app.get("/payrolls", async (req, res) => {
            const result = await payrollsCollectons.find({}).toArray();
            res.send(result);
        });
        //payrolls
        app.post("/payrolls", async (req, res) => {
            const task = req.body;
            const result = await payrollsCollectons.insertOne(task);
            res.send(result);
        });
        //transfar

        app.get("/transfer", async (req, res) => {
            const result = await transferCollectons.find({}).toArray();
            res.send(result);
        });

        app.post("/transfer", async (req, res) => {
            const task = req.body;
            const result = await transferCollectons.insertOne(task);
            res.send(result);
        });
        //performance
        app.get("/performance", async (req, res) => {
            const result = await hrCollectons.find({}).toArray();
            res.send(result);
        });

        app.post("/performance", async (req, res) => {
            const task = req.body;
            const result = await hrCollectons.insertOne(task);
            res.send(result);
        });

        app.get("/alltasks", async (req, res) => {
            const result = await taskCollection.find({}).toArray();
            res.send(result);
        });
       
        app.post("/addNewTask", async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
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
