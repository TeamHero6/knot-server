const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");

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

const auth = {
    auth: {
        api_key: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
    }
};

const nodemailerMailgun = nodemailer.createTransport(mg(auth));

const sendMarketingEmail = (newSentEmail) => {
    const { emailTo, emailSubject, emailDescription } = newSentEmail;

    nodemailerMailgun.sendMail(
        {
            from: "hero6.dev@gmail.com",
            to: emailTo, // An array if you have multiple recipients.
            subject: emailSubject,
            replyTo: "reply2this@company.com",
            //You can use "html:" to send HTML email content. It's magic!
            html: `<b>It's working. ${emailDescription}</b>`,
            //You can use "text:" to send plain-text content. It's oldschool!
            text: `Mailgun rocks, pow pow! from seam ${emailDescription}`,
        },
        (err, info) => {
            if (err) {
                console.log(err);
            } else {
                console.log(info);
            }
        }
    );
};

async function run() {
    try {
        client.connect();
        const taskCollection = client.db("Tasks").collection("task");
        const userCollecton = client.db("Tasks").collection("user");
        const sentEmailCollection = client.db("Tasks").collection("sentEmail");
        await client.connect();
        const userInfoCollection = client.db("Tasks").collection("userInfo");
        const userCollection = client
            .db("AuthenticationInfo")
            .collection("user");
        const companyCollection = client
            .db("AuthenticationInfo")
            .collection("company");
        const meetingCollection = client.db("services").collection("meeting");
        const warningCollection = client.db("services").collection("warning");
        const awardCollection = client.db("services").collection("award");
        const newsletterCollection = client
            .db("customerEmail")
            .collection("newsletter");

        const createNewUserCollection = client.db("chat").collection("userInfo");
        const createUserLoginCollection = client.db("chat").collection("loginInfo");
        const chatCollection = client.db("chat").collection("conversation");
        const productDetailsCollection = client.db("salesManagement").collection("product");
        const customerCollection = client.db("salesManagement").collection("customer");
        const vendorCollection = client.db("salesManagement").collection("vendor");

        // All Get API

        // Checking Authentication
        app.get("/isLogin", verifyJWT, async (req, res) => {
            res.send({ login: true });
        });
        app.get("/alltasks", verifyJWT, async (req, res) => {
            const result = await taskCollection.find({}).toArray();
            res.send(result);
        });

        app.post("/payrolls", async (req, res) => {
            const task = req.body;
            const result = await payrollsCollecton.insertOne(task);
        });

        app.get("/meetings", async (req, res) => {
            const result = await meetingCollection.find({}).toArray();
            res.send(result);
        });
        //transfar

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

        //performance
        app.get("/performance", async (req, res) => {
            const result = await hrCollecton.find({}).toArray();
            res.send(result);
        });

        // Get newsletter data
        app.get("/newsletterMail", async (req, res) => {
            const query = {};
            const cursor = newsletterCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        //Created user | Saved Data to Database | working two collection (user, company)
        app.put("/createdUser", async (req, res) => {
            let CEO = "";
            let manager = "";
            const employees = [];
            const options = { upsert: true };

            const userInfo = req.body;

            //Check validity
            const email = userInfo?.email;
            const companyName = userInfo?.companyName;
            const validityFilter = { companyName, email };
            const valid = await companyCollection.findOne(validityFilter);
            if (valid) {
                res.send({
                    message:
                        "Already have an account! Please contact us or try with another account",
                    token: "",
                });
            } else {
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
            }
        });

        // All Post API

        app.post("/addNewTask", async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result);
        });

        app.post("/inputData", async (req, res) => {
            const user = req.body;
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
            const query = { _id: ObjectId(id) };
            const result = await userCollecton.findOne(query);
            res.send(result);
        });

        app.get("/user", async (req, res) => {
            const query = {};
            const carsor = userCollecton.find(query);
            const user = await carsor.toArray();
            res.send(user);
        });

        app.post("/user", async (req, res) => {
            const newuser = req.body;
            const result = await userCollecton.insertOne(newuser);

            res.send(result);
        });

        app.post("/sentEmail", async (req, res) => {
            const newSentEmail = req.body;
            console.log(newSentEmail);
            const result = await sentEmailCollection.insertOne(newSentEmail);
            sendMarketingEmail(newSentEmail);
            res.send(result);
        });

        app.get("/sentEmail", async (req, res) => {
            const query = {};
            const cursor = sentEmailCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.delete("/deleteEmail/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await sentEmailCollection.deleteOne(query);
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

        //checkUser | isCEO | isManager | isEmployee
        app.post("/isRole", async (req, res) => {
            const signInInfo = req.body;
            const role = signInInfo.role;
            const email = signInInfo.email;
            if (role === "CEO") {
                const isCEO = await companyCollection.findOne({ CEO: email });
                if (isCEO) {
                    res.send({ role: true });
                } else {
                    res.send({ role: false });
                }
            } else if (role === "Manager") {
                const isManager = await companyCollection.findOne({
                    manager: email,
                });
                if (isManager) {
                    res.send({ role: true });
                } else {
                    res.send({ role: false });
                }
            }
        });
        // post newsletter data
        app.post("/newsletter", async (req, res) => {
            const newNewsletter = req.body;
            const result = await newsletterCollection.insertOne(newNewsletter);
            res.send(result);
        });

        // post Add vendor on sales management db
        app.post("/addNewVendor", async (req, res) => {
            const newVendor = req.body;
            const result = await vendorCollection.insertOne(newVendor);
            res.send(result);
        });

        // get vendor on sales management db
        app.get("/addNewVendor", async (req, res) => {
            const query = {};
            const cursor = vendorCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
        // ...........


        //Live Chat UserInfo Post API
        app.post("/chatuser", async (req, res) => {
            const newUserInfo = req.body;
            const result = await createNewUserCollection.insertOne(newUserInfo);
            res.send(result);
        });
        //Live Chat UserInfo Get API
        app.get("/chatuser", async (req, res) => {
            const result = await createNewUserCollection.find({}).toArray();
            res.send(result);
        });

        //user Login UserInfo Post API
        app.post("/loginuser", async (req, res) => {
            const loginInfo = req.body;
            const result = await createUserLoginCollection.insertOne(loginInfo);
            res.send(result);
        });

        //user Login UserInfo Get API
        app.get("/loginuser", async (req, res) => {
            const result = await createUserLoginCollection.find({}).toArray();
            res.send(result);
        });


        //chat Post API
        app.post("/hrchat", async (req, res) => {
            const newChat = req.body;
            const result = await chatCollection.insertOne(newChat);
            res.send(result);
        });

        // //chat Get API
        app.get("/hrchat", async (req, res) => {
            const result = await chatCollection.find({}).toArray();
            res.send(result);
        });

        //............... 
        // post products info on sales management db
        app.post("/addNewProduct", async (req, res) => {
            const newProduct = req.body;
            const result = await productDetailsCollection.insertOne(newProduct);
            res.send(result);
        });
        // get products info from sales management db
        app.get("/addProduct", async (req, res) => {
            const query = {};
            const cursor = productDetailsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
        // post customer on sales management db
        app.post("/addNewCustomer", async (req, res) => {
            const newCustomer = req.body;
            const result = await customerCollection.insertOne(newCustomer);
            res.send(result);
        });
        // get customer on sales management db
        app.get("/addCustomer", async (req, res) => {
            const query = {};
            const cursor = customerCollection.find(query);
            const result = await cursor.toArray();
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
