const express = require("express");
const app = express();
var cors = require("cors");
var jwt = require("jsonwebtoken");
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

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "UnAuthorized access" });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_PRIVATE_KEY, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: "Forbidden access" });
        }
        req.decoded = decoded.email;
        next();
    });
}

async function run() {
    try {
        client.connect();
        const taskCollection = client.db("Tasks").collection("task");
        const userCollection = client
            .db("AuthenticationInfo")
            .collection("user");
        const companyCollection = client
            .db("AuthenticationInfo")
            .collection("company");
        const meetingCollection = client.db("services").collection("meeting");
        const warningCollection = client.db("services").collection("warning");
        const awardCollection = client.db("services").collection("award");

        // All Get API

        // Checking Authentication
        app.get("/isLogin", verifyJWT, async (req, res) => {
            res.send({ login: true });
        });
        app.get("/alltasks", verifyJWT, async (req, res) => {
            const result = await taskCollection.find({}).toArray();
            res.send(result);
        });

        app.get("/meetings", async (req, res) => {
            const result = await meetingCollection.find({}).toArray();
            res.send(result);
        });

        //Get all Warnings
        app.get("/warnings", async (req, res) => {
            const result = await warningCollection.find({}).toArray();
            res.send(result);
        });

        //Get all award
        app.get("/award", async (req, res) => {
            const result = await awardCollection.find({}).toArray();
            res.send(result);
        });
        //Created user | Saved Data to Database | working two collection (user, company)
        app.put("/createdUser", async (req, res) => {
            let CEO = "";
            let manager = "";
            const employees = [];
            const options = { upsert: true };

            const userInfo = req.body;
            if (userInfo.role == "Manager") {
                manager = userInfo.email;
            } else {
                CEO = userInfo.email;
            }
            const company = {
                companyName: userInfo.companyName,
                companyLogo: userInfo.companyLogo,
                CEO,
                manager,
                employees,
                hr: "",
                marketingManager: "",
                salesManager: "",
                financeManager: "",
            };
            const filter = {
                email: userInfo.email,
                companyName: userInfo.companyName,
            };
            const companyFilter = { companyName: userInfo.companyName };
            const updateDoc = {
                $set: company,
            };
            //send Data to Two Collection
            const companyResult = await companyCollection.updateOne(
                filter,
                updateDoc,
                options
            );

            const userResult = await userCollection.updateOne(
                companyFilter,
                updateDoc,
                options
            );
            if (companyResult.acknowledged && userResult.acknowledged) {
                const authenticationInfo = {
                    email: userInfo.email,
                    role: userInfo.role,
                };
                const token = jwt.sign(
                    authenticationInfo,
                    process.env.JWT_PRIVATE_KEY,
                    {
                        expiresIn: "1d",
                    }
                );
                res.send({ token });
            }
        });

        // All Post API
        app.post("/addNewTask", async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result);
        });
        //post new meeting
        app.post("/createNewMeeting", async (req, res) => {
            const newMeeting = req.body;
            const result = await meetingCollection.insertOne(newMeeting);
            res.send(result);
        });
        //post award info to DB
        app.post("/createAward", async (req, res) => {
            const newAward = req.body;
            const result = await awardCollection.insertOne(newAward);
            res.send(result);
        });

        //CreateWarning | Save to DB
        app.post("/createWarning", async (req, res) => {
            const newWarning = req.body;
            const result = await warningCollection.insertOne(newWarning);
            res.send(result);
        });
    } finally {
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Knot server running on port ${port}`);
});
