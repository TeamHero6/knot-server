const express = require("express");
const app = express();
var cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require('mongodb').ObjectId;

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
        const hrCollecton = client.db('HrManagement').collection('performance');
        const transferCollecton = client.db('HrManagement').collection('transfer');
        const payrollsCollecton = client.db('HrManagement').collection('payrolls');
        const warningCollecton = client.db('services').collection('warning');
        const awardCollecton = client.db('services').collection('award');
        const vacancyCollecton = client.db('HrManagement').collection('vacancy');
        const applicantCollecton = client.db('HrManagement').collection('applicant');
        //monir vai jindabad
        app.put('/applicant/:id', async (req, res) => {
            const id = req.params.id;
            const upaprovel = req.body;
            const filter = { _id: ObjectId(id) };

            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    aprovel: upaprovel.aprovel,

                }
            };
            const result = await userCollecton.updateOne(filter, updateDoc, options);
            res.send(result);

        })
        app.get("/applicant", async (req, res) => {
            const result = await applicantCollecton.find({}).toArray();
            res.send(result);
        });
        app.delete("/applicant/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await applicantCollecton.deleteOne(query);
            res.send(result);
        });

        app.post("/applicant", async (req, res) => {
            const task = req.body;
            const result = await applicantCollecton.insertOne(task);
            res.send(result);
        });
        app.get("/vacancy", async (req, res) => {
            const result = await vacancyCollecton.find({}).toArray();
            res.send(result);
        });
        app.delete("/vacancy/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await vacancyCollecton.deleteOne(query);
            res.send(result);
        });

        app.post("/vacancy", async (req, res) => {
            const task = req.body;
            const result = await vacancyCollecton.insertOne(task);
            res.send(result);
        });

        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;
            const upaprovel = req.body;
            const filter = { _id: ObjectId(id) };

            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    aprovel: upaprovel.aprovel,

                }
            };
            const result = await userCollecton.updateOne(filter, updateDoc, options);
            res.send(result);

        })
        app.put('/alltasks/:id', async (req, res) => {
            const id = req.params.id;
            const uptask = req.body;
            const filter = { _id: ObjectId(id) };

            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    intask: uptask.intask,

                }
            };
            const result = await taskCollection.updateOne(filter, updateDoc, options);
            res.send(result);

        })
        app.put('/warning/:id', async (req, res) => {
            const id = req.params.id;
            const upwarning = req.body;
            const filter = { _id: ObjectId(id) };

            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    infeed: upwarning.infeed,

                }
            };
            const result = await warningCollecton.updateOne(filter, updateDoc, options);
            res.send(result);

        })
        app.put('/award/:id', async (req, res) => {
            const id = req.params.id;
            const leaderup = req.body;
            const filter = { _id: ObjectId(id) };

            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    ledarfeed: leaderup.ledarfeed,

                }
            };
            const result = await awardCollecton.updateOne(filter, updateDoc, options);
            res.send(result);

        })

        app.get("/award", async (req, res) => {
            const result = await awardCollecton.find({}).toArray();
            res.send(result);
        });
        app.get("/warning", async (req, res) => {
            const result = await warningCollecton.find({}).toArray();
            res.send(result);
        });
        app.get("/payrolls", async (req, res) => {
            const result = await payrollsCollecton.find({}).toArray();
            res.send(result);
        });

        app.post("/payrolls", async (req, res) => {
            const task = req.body;
            const result = await payrollsCollecton.insertOne(task);
            res.send(result);
        });

        app.get("/transfer", async (req, res) => {
            const result = await transferCollecton.find({}).toArray();
            res.send(result);
        });

        app.post("/transfer", async (req, res) => {
            const task = req.body;
            const result = await transferCollecton.insertOne(task);
            res.send(result);
        });
        app.get("/performance", async (req, res) => {
            const result = await hrCollecton.find({}).toArray();
            res.send(result);
        });

        app.post("/performance", async (req, res) => {
            const task = req.body;
            const result = await hrCollecton.insertOne(task);
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

        app.get('/users', async (req, res) => {

            const query = {};
            const carsor = userCollecton.find(query);
            const user = await carsor.toArray();
            res.send(user);
        })

        app.post('/users', async (req, res) => {
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