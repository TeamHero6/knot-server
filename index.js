const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
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
    },
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
        const hrCollecton = client.db("HrManagement").collection("performance");
        const transferCollecton = client
            .db("HrManagement")
            .collection("transfer");
        const payrollsCollecton = client
            .db("HrManagement")
            .collection("payrolls");
        const warningCollecton = client.db("services").collection("warning");
        const awardCollecton = client.db("services").collection("award");
        const vacancyCollecton = client
            .db("HrManagement")
            .collection("vacancy");
        const applicantCollecton = client
            .db("HrManagement")
            .collection("applicant");
        const employeedetailstCollecton = client
            .db("HrManagement")
            .collection("employeedetails");
        const joiningCollecton = client
            .db("HrManagement")
            .collection("joining");
        const TrainnigCollecton = client
            .db("HrManagement")
            .collection("Trainnig");
        const meetingCollection = client.db("services").collection("meeting");
        const sentEmailCollection = client.db("Tasks").collection("sentEmail");
        const newsletterCollection = client
            .db("customerEmail")
            .collection("newsletter");
        const createNewUserCollection = client
            .db("chat")
            .collection("userInfo");
        const createUserLoginCollection = client
            .db("chat")
            .collection("loginInfo");
        const chatCollection = client.db("chat").collection("conversation");
        const purchaseOrderCollection = client
            .db("salesManagement")
            .collection("purchaseOrder");
        const productDetailsCollection = client
            .db("salesManagement")
            .collection("product");
        const customerCollection = client
            .db("salesManagement")
            .collection("customer");
        const vendorCollection = client
            .db("salesManagement")
            .collection("vendor");
        const salesOrderCollection = client
            .db("salesManagement")
            .collection("salesOrder");
        const warningCollection = client.db("services").collection("warning");
        const userCollection = client
            .db("AuthenticationInfo")
            .collection("user");
        const companyCollection = client
            .db("AuthenticationInfo")
            .collection("company");
        const partnerCollection = client
            .db("FinanceManagement")
            .collection("Partner");
        const cashBookCollection = client
            .db("FinanceManagement")
            .collection("cashBook");
        const bankBookCollection = client
            .db("FinanceManagement")
            .collection("bankBook");
        const attendanceCollection = client
            .db("UserDashboard")
            .collection("attendance");
        const attendanceEndCollection = client
            .db("UserDashboard")
            .collection("attendanceEmd");

        // coded from habib
        // post Add Partner on Finance management db
        app.post("/addPartner", async (req, res) => {
            const newPartner = req.body;
            const result = await partnerCollection.insertOne(newPartner);
            res.send(result);
        });

        // get Partner on sales management db
        app.get("/partner/:companyName", async (req, res) => {
            const companyName = req.params.companyName;
            const query = { companyName };
            const cursor = partnerCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // Update Invest in partner
        app.put("/partner/:id", async (req, res) => {
            const id = req.params.id;
            const UpdateInvest = req.body;
            const { date, Amount, share } = UpdateInvest;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    date,
                    Amount,
                    share,
                },
            };
            const result = await partnerCollection.updateOne(
                filter,
                updatedDoc,
                options
            );
            res.send(result);
        });

        // post CashBook on Finance management db
        app.post("/cashBook", async (req, res) => {
            const newCashBook = req.body;
            const result = await cashBookCollection.insertOne(newCashBook);
            res.send(result);
        });

        // Get CashBook on Finance management db
        app.get("/cashBook/:companyName", async (req, res) => {
            const companyName = req.params.companyName;
            const query = { companyName };
            const cursor = cashBookCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // post BankBook on Finance management db
        app.post("/bankBook", async (req, res) => {
            const newBankBook = req.body;
            const result = await bankBookCollection.insertOne(newBankBook);
            res.send(result);
        });

        // Get CashBook on Finance management db
        app.get("/bankBook/:companyName", async (req, res) => {
            const companyName = req.params.companyName;
            const query = { companyName };
            const cursor = bankBookCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // post Attendance on User Dashboard db
        app.post("/attendance", async (req, res) => {
            const newAttendance = req.body;
            const result = await attendanceCollection.insertOne(newAttendance);
            res.send(result);
        });

        // Put Attendance on User Dashboard db
        app.put("/attendance/:id", async (req, res) => {
            const id = req.params.id;
            const UpdateDateTime = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    UpdateDateTime,
                },
            };
            const result = await attendanceCollection.updateOne(
                filter,
                updatedDoc,
                options
            );
            res.send(result);
        });
        // // post Attendance End on User Dashboard db
        // app.post("/attendanceEnd", async (req, res) => {
        //     const newAttendance = req.body;
        //     const result = await attendanceEndCollection.insertOne(
        //         newAttendance
        //     );
        //     res.send(result);
        // });

        // Get Attendance on Finance management db
        app.get("/attendance", async (req, res) => {
            const query = {};
            const cursor = attendanceCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

       
        // Trainnig employee api start
        app.get("/Trainnig/:companyName", async (req, res) => {
            const companyName = req.params.companyName;
            const query = { companyName };
            const cursor = TrainnigCollecton.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
        
        app.post("/Trainnig", async (req, res) => {
            const details = req.body;
            const result = await TrainnigCollecton.insertOne(details);
            res.send(result);
        });

        // Trainnig employee api end

        // Joning employee api start
        app.get("/joining", async (req, res) => {
            const result = await joiningCollecton.find({}).toArray();
            res.send(result);
        });

        // post data to server for joining
        app.post("/joining", async (req, res) => {
            const details = req.body;
            const result = await joiningCollecton.insertOne(details);
            res.send(result);
        });

        // Emloyee Details api start
        app.get("/employeedetails/:companyName", async (req, res) => {
            const companyName = req.params.companyName;
            const query = { companyName };
            const cursor = employeedetailstCollecton.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // app.get("/employeedetails", async (req, res) => {
        //     const result = await employeedetailstCollecton.find({}).toArray();
        //     res.send(result);
        // });
        app.post("/employeedetails", async (req, res) => {
            const details = req.body;

            // Update Data to userlist collection
            const { Employee_Name, Department, phone, Email, Designation } =
                details;
            const filter = { email: Email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: Employee_Name,
                    Department,
                    phone,
                    Designation,
                },
            };
            const updateUserList = await userCollection.updateOne(
                filter,
                updateDoc,
                options
            );

            // post data tp employeedetails collection
            const result = await employeedetailstCollecton.insertOne(details);
            res.send(result);
        });
        // Emloyee Details api end
        app.put("/applicant/:id", async (req, res) => {
            const id = req.params.id;
            const upaprovel = req.body;
            const filter = { _id: ObjectId(id) };

            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    aprovel: upaprovel.aprovel,
                },
            };
            const result = await userCollecton.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });
        app.get("/applicant", async (req, res) => {
            const result = await applicantCollecton.find({}).toArray();
            res.send(result);
        });
        app.delete("/applicant/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await applicantCollecton.deleteOne(query);
            res.send(result);
        });

        app.post("/applicant", async (req, res) => {
            const task = req.body;
            const result = await applicantCollecton.insertOne(task);
            res.send(result);
        });
        app.get("/vacancy/:companyName", async (req, res) => {
            const companyName = req.params.companyName;
            const query = { companyName };
            const cursor = vacancyCollecton.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
        
        app.delete("/vacancy/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await vacancyCollecton.deleteOne(query);
            res.send(result);
        });

        app.post("/vacancy", async (req, res) => {
            const task = req.body;
            const result = await vacancyCollecton.insertOne(task);
            res.send(result);
        });

        app.put("/users/:id", async (req, res) => {
            const id = req.params.id;
            const upaprovel = req.body;
            const filter = { _id: ObjectId(id) };

            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    aprovel: upaprovel.aprovel,
                },
            };
            const result = await userCollecton.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });
        app.put("/alltasks/:id", async (req, res) => {
            const id = req.params.id;
            const uptask = req.body;
            const filter = { _id: ObjectId(id) };

            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    intask: uptask.intask,
                },
            };
            const result = await taskCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });
        app.put("/warning/:id", async (req, res) => {
            const id = req.params.id;
            const upwarning = req.body;
            const filter = { _id: ObjectId(id) };

            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    infeed: upwarning.infeed,
                },
            };
            const result = await warningCollecton.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });
        app.put("/award/:id", async (req, res) => {
            const id = req.params.id;
            const leaderup = req.body;
            const filter = { _id: ObjectId(id) };

            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    ledarfeed: leaderup.ledarfeed,
                },
            };
            const result = await awardCollecton.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });

        app.get("/award", async (req, res) => {
            const result = await awardCollecton.find({}).toArray();
            res.send(result);
        });
        app.get("/warning", async (req, res) => {
            const result = await warningCollecton.find({}).toArray();
            res.send(result);
        });
        app.get("/payrolls/:companyName", async (req, res) => {
            const companyName = req.params.companyName;
            const filter = { companyName };
            const result = await payrollsCollecton.find(filter).toArray();
            res.send(result);
        });

        app.post("/payrolls", async (req, res) => {
            const task = req.body;
            const result = await payrollsCollecton.insertOne(task);
            res.send(result);
        });

        app.get("/userMeetings/:email", async (req, res) => {
            const email = req.params.email;
            // console.log(email);
            const result = await meetingCollection.find({ meetingWith: email }).toArray();
            console.log(result);
            res.send(result)
        });


        app.get("/meetings/:companyName", async (req, res) => {
            const companyName = req.params.companyName;
            const filter = { companyName };
            const result = await meetingCollection.find(filter).toArray();
            res.send(result);
        });
        //transfar

        //Get all Warnings
        app.get("/warnings/:companyName", async (req, res) => {
            const companyName = req.params.companyName;
            const filter = { companyName };
            const result = await warningCollection.find(filter).toArray();
            res.send(result);
        });
        app.get("/warnings", async(req,res) => {
            const result =await warningCollection.find({}).toArray();
            res.send(result)
        })
        app.get("/award/:companyName", async (req, res) => {
            const companyName = req.params.companyName;
            const filter = { companyName };
            const result = await awardCollecton.find(filter).toArray();
            res.send(result);
        });
        
        app.get("/transfer/:companyName", async (req, res) => {
            const companyName = req.params.companyName;
            const query = { companyName };
            const cursor = transferCollecton.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
        
        // create this api for delete specific company employee by CEO || Manager
        app.delete("/removeEmployee/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(filter);
            res.send(result);
        });

        // create this api for getting all specific company employees
        app.get("/getAllEmployees/:company", async (req, res) => {
            const company = req.params.company;
            const result = await userCollection
                .find({ companyName: company })
                .toArray();
            res.send(result);
        });

        //API FOR GET ALL TASK FILTERING BY COMPANY NAME
        app.get("/v1/allTasks", async (req, res) => {
            const companyName = req.query.company;
            const result = await (
                await taskCollection.find({ companyName }).toArray()
            ).reverse();
            res.send(result);
        });

        // Update task status
        app.put("/updateStatus", async (req, res) => {
            const info = req.body;
            const { status, id } = info;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: status,
                },
            };
            const result = await taskCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });

        app.post("/transfer", async (req, res) => {
            const task = req.body;
            const result = await transferCollecton.insertOne(task);
            res.send(result);
        });
        app.get("/performance/:companyName", async (req, res) => {
            const companyName = req.params.companyName;
            const query = { companyName };
            const cursor = hrCollecton.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
        
        // app.get("/transfer", async (req, res) => {
        //     const result = await transferCollecton.find({}).toArray();
        //     res.send(result);
        // });

        app.post("/performance", async (req, res) => {
            const perform = req.body;
            const request = await hrCollecton.insertOne(perform);
            res.send(request);
        });
        // app.post("/transfer", async (req, res) => {
        //     const perform = req.body;
        //     const request = await transferCollecton.insertOne(perform);
        //     res.send(request);
        // });

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
                    companyLogo: userInfo.CompanyLogo,
                    CEO,
                    manager,
                    employees,
                    hr: "",
                    marketingManager: "",
                    salesManager: "",
                    financeManager: "",
                };
                const userList = {
                    email: userInfo.email,
                    name: userInfo.name,
                    password: userInfo.password,
                    role: userInfo.role,
                    companyLogo: userInfo.CompanyLogo,
                    userPhoto: userInfo.userPhoto,
                    companyName: userInfo.companyName,
                };

                const filter = {
                    email: userInfo.email,
                    companyName: userInfo.companyName,
                };
                const companyFilter = { companyName: userInfo.companyName };
                const updateDoc = {
                    $set: company,
                };

                const userUpdateDoc = {
                    $set: userList,
                };
                //send Data to Two Collection
                const companyResult = await companyCollection.updateOne(
                    filter,
                    updateDoc,
                    options
                );

                const userResult = await userCollection.updateOne(
                    companyFilter,
                    userUpdateDoc,
                    options
                );
                if (companyResult.acknowledged && userResult.acknowledged) {
                    const authInfo = {
                        email: userInfo.email,
                        role: userInfo.role,
                    };
                    const token = jwt.sign(
                        authInfo,
                        process.env.JWT_PRIVATE_KEY,
                        {
                            expiresIn: "1d",
                        }
                    );
                    res.send({ token, loggerInfo: userList });
                }
            }
        });

        // update profile photo to DB
        app.put("/updateProfilePhoto", async (req, res) => {
            const photoInfo = req.body;
            const { email, photoUrl } = photoInfo;
            const filter = { email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    userPhoto: photoUrl,
                },
            };
            const result = await userCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });

        // update name to DB
        app.put("/updateName", async (req, res) => {
            const info = req.body;
            const { email, name } = info;
            const filter = { email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name,
                },
            };
            const result = await userCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });

        //Check Employee
        app.post("/checkEmployee", async (req, res) => {
            const info = req.body;
            const email = info?.email;
            const name = info?.name;
            const secretCode = info?.secretCode;
            const employee = await userCollection.findOne({ email });

            if (!employee) {
                res.send({
                    role: false,
                    message: "You havn't access for login",
                });
            }
            if (parseInt(secretCode) !== parseInt(employee?.secretCode)) {
                res.send({
                    role: false,
                    message: "Secret Code doesn't matched",
                });
            } else if (parseInt(secretCode) === employee?.secretCode) {
                res.send({
                    role: true,
                    message: "Congratulation!",
                    loggerInfo: employee,
                });
            }
        });

        // app.post("/performance", async (req, res) => {
        //     const task = req.body;
        //     const result = await hrCollecton.insertOne(task);
        //     res.send(result);
        // });

        app.get("/alltasks", async (req, res) => {
            const result = await taskCollection.find({}).toArray();
            res.send(result);
        });

        app.post("/v1/addNewTask", async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result);
        });

        app.get("/users/:companyName", async (req, res) => {
            const companyName = req.params.companyName;
            const filter = { companyName };
            const result = await userCollecton.find(filter).toArray();
            res.send(result);
        });

        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            console.log(email);
            const result = await userCollecton.find({ email: email }).toArray();
            console.log(result);
            res.send(result)
        });

        app.post("/users", async (req, res) => {
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
            const { employeeEmail } = newAward;
            const filter = { email: employeeEmail };
            const user = await userCollection.findOne(filter);
            const updatedAward = { ...newAward, name: user.name };
            const result = await awardCollecton.insertOne(updatedAward);
            res.send(result);
        });

        //CreateWarning | Save to DB
        app.post("/createWarning", async (req, res) => {
            const newWarning = req.body;
            //Get Name from user
            const email = newWarning.warningFor;
            const filter = { email };
            const userInfo = await userCollection.findOne(filter);

            // Create new object for insert data to mongoDB
            const updatedWarning = {
                ...newWarning,
                name: userInfo.name,
                photo: userInfo.userPhoto,
            };
            const result = await warningCollection.insertOne(updatedWarning);
            res.send(result);
        });

        //checkUser | isCEO | isManager | isEmployee
        app.post("/isRole", async (req, res) => {
            const signInInfo = req.body;
            const role = signInInfo.role;
            const email = signInInfo.email;
            const authInfo = { email, role };

            //Create an access Token
            const token = jwt.sign(authInfo, process.env.JWT_PRIVATE_KEY, {
                expiresIn: "1d",
            });

            //Generate logger info
            const loggerInfo = await userCollection.findOne({ email: email });
            const { companyName } = loggerInfo;
            const allEmployees = await userCollection
                .find({ companyName })
                .toArray();

            if (role === "CEO") {
                const isCEO = await companyCollection.findOne({ CEO: email });
                if (isCEO) {
                    res.send({ role: true, loggerInfo, allEmployees, token });
                } else {
                    res.send({ role: false });
                }
            } else if (role === "Manager") {
                const isManager = await companyCollection.findOne({
                    manager: email,
                });
                if (isManager) {
                    res.send({ role: true, loggerInfo, allEmployees, token });
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
        app.get("/addNewVendor/:companyName", async (req, res) => {
            const companyName = req.params.companyName;
            const query = { companyName };
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
            const query = {};
            const result = await createNewUserCollection.find(query).toArray();
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
        app.post("/chat", async (req, res) => {
            const newChat = req.body;
            const result = await chatCollection.insertOne(newChat);
            res.send(result);
        });

        // //chat Get API
        app.get("/hrchat", async (req, res) => {
            const result = await chatCollection.find({}).toArray();
            res.send(result);
        });

        // Get All Coversations
        app.get("/conversations/:department", async (req, res) => {
            const Department = req.params.department;
            const filter = { Department };
            const result = await chatCollection.find(filter).toArray();
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
        app.get("/addProduct/:companyName", async (req, res) => {
            const companyName = req.params.companyName;
            const query = { companyName };
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
        // get customer from sales management db
        app.get("/addCustomer/:companyName", async (req, res) => {
            const companyName = req.params.companyName;
            const query = { companyName };
            const cursor = customerCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
        // post new order on sales management db
        app.post("/addNewOrder", async (req, res) => {
            const newOrder = req.body;
            const result = await salesOrderCollection.insertOne(newOrder);
            res.send(result);
        });
        // get new order from sales management db
        app.get("/addNewOrder/:companyName", async (req, res) => {
            const companyName = req.params.companyName;
            const query = { companyName };
            const cursor = salesOrderCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
        // put new sales order from sales management db
        app.put("/addNewOrder/:id", async (req, res) => {
            const id = req.params.id;
            const { isCancel } = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    isCancel,
                },
            };
            const result = await salesOrderCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });
        // get cancelled(returned) order in sales order from sales management db
        app.get("/cancelledSalesOrder/:companyName", async (req, res) => {
            const companyName = req.params.companyName;
            const query = { $and: [{ isCancel: "cancelled" }, { companyName: companyName }] };
            const result = await salesOrderCollection.find(query).toArray();
            res.send(result);
        });
        // post new purchase order on sales management db
        app.post("/addNewPurchaseOrder", async (req, res) => {
            const newPurchaseOrder = req.body;
            const result = await purchaseOrderCollection.insertOne(
                newPurchaseOrder
            );
            res.send(result);
        });
        // get new purchase order from sales management db
        app.get("/addNewPurchaseOrder/:companyName", async (req, res) => {
            const companyName = req.params.companyName;
            const query = { companyName };
            const cursor = purchaseOrderCollection.find(query);
            const result = await cursor.toArray();
            // console.log(result);
            const quantitySum = result.reduce((prev, current) => {
                return prev + parseInt(current.orderQuantity);
            }, 0);
            res.send({ result, quantitySum });
        });
        // put new purchase order at sales management db
        app.put("/addNewPurchaseOrder/:id", async (req, res) => {
            const id = req.params.id;
            const amount = req.body;
            console.log(amount);
            const { paidAmount, dueAmount } = amount;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    paidAmount,
                    dueAmount,
                },
            };
            const result = await purchaseOrderCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });

        //createNewEmployee is for adding employee in userCollection and company collection in employees array
        app.put("/createNewEmployee", async (req, res) => {
            const employee = req.body;

            //Create user || userCollection > user
            const user = {
                companyLogo: employee.companyLogo,
                companyName: employee.companyName,
                email: employee.email,
                name: "",
                secretCode: employee.passcode,
                role: "employee",
                userPhoto: "",
            };

            const result = await userCollection.insertOne(user);
            res.send(result);

            //Incomplete Task
            //employee add to company database in arrow
        });
        console.log("connected");
    } finally {
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Knot server running on ${port}`);
});
