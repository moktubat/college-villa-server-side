const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.odqhq4i.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("College admission running");
});

const collegesCollection = client.db("collegeDb").collection("colleges");
const usersCollection = client.db("collegeDb").collection("users");
const myCollegeSelection = client.db("collegeDb").collection("myCollege");


app.get("/colleges", async (req, res) => {
  const result = await collegesCollection.find().toArray();
  res.send(result);
});

app.get("/collegeInfo/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const college = await collegesCollection.findOne({ _id: new ObjectId(id) });

    if (!college) {
      return res.status(404).send({ message: "College not found" });
    }

    res.send(college);
  } catch (error) {
    console.error("Error fetching college information:", error);
    res.status(500).send({ message: "An error occurred while fetching college information" });
  }
});

app.get("/collegeInfo/:id/review", async (req, res) => {
  try {
    const collegeId = req.params.id;
    const college = await collegesCollection.findOne({ _id: new ObjectId(collegeId) });

    if (!college) {
      return res.status(404).send({ message: "College not found" });
    }

    res.json(college.reviews);
  } catch (error) {
    console.error("Error fetching college reviews:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/myCollege", async (req, res) =>{
  const myCollege = await myCollegeSelection.find({ email: req.query.email }).toArray()
  res.send(myCollege)
})

app.post("/myCollege", async (req, res) =>{
const data = req.body
const result = await myCollegeSelection.insertOne(data)
res.send(result)
})

app.get("/users", async (req, res) => {
  const result = await usersCollection.find().toArray();
  res.send(result);
});

app.post("/users", async (req, res) => {
  const user = req.body;
  const query = { email: user.email };
  const existingUser = await usersCollection.findOne(query);
  if (existingUser) {
    return res.send({ message: "User already exists" });
  }
  const result = await usersCollection.insertOne(user);
  res.send(result);
});

app.listen(port, () => {
  console.log(`Admission on port ${port}`);
});
