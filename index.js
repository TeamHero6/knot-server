const express = require("express");
const app = express();
var cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

//middleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@knotbusinesssolution.ooaeydf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

const auth = {
    auth: {
        api_key: 'd2bc1326695d1aa48b014ad9a91f521b-1b3a03f6-82b60d1d',
        domain: 'sandbox35a20f09427a447187ba6af804b66857.mailgun.org'
    }
};

const nodemailerMailgun = nodemailer.createTransport(mg(auth));

// {
//     emailTo: 'hero6.dev@gmail.com',
//     emailSubject: 'This is a test email.',
//     emailDescription: 'Thank you.'
//   }
const sendMarketingEmail = (newSentEmail) => {
    const { emailTo, emailSubject, emailDescription } = newSentEmail;

    nodemailerMailgun.sendMail({
        from: 'hero6.dev@gmail.com',
        to: 'abdullahalhabib100@gmail.com', // An array if you have multiple recipients.
        subject: emailSubject,
        'replyTo': 'reply2this@company.com',
        //You can use "html:" to send HTML email content. It's magic!
        html: `<b>It's working. ${emailDescription}</b>`,
        //You can use "text:" to send plain-text content. It's oldschool!
        text: `Mailgun rocks, pow pow! from seam ${emailDescription}`
    }, (err, info) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log(info);
        }
    });
}

async function run() {
    try {
        client.connect();
        const taskCollection = client.db("Tasks").collection("task");
        const userCollecton = client.db('Tasks').collection('user');
        const sentEmailCollection = client.db('Tasks').collection('sentEmail');

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

        app.post('/sentEmail', async (req, res) => {
            const newSentEmail = req.body;
            console.log(newSentEmail)
            const result = await sentEmailCollection.insertOne(newSentEmail);
            sendMarketingEmail(newSentEmail);
            res.send(result);
        });

        app.get('/sentEmail', async (req, res) => {
            const query = {};
            const cursor = sentEmailCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.delete('/deleteEmail/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) };
            const result = await sentEmailCollection.deleteOne(query);
            res.send(result);
        })
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
