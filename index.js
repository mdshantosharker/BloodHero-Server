const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
dotenv.config();

const uri = process.env.MONGODB_URI;
const app = express();
const PORT = process.env.PORT;
app.use(
  cors({
    credentials: true,
    origin: [process.env.CLIENT_URL],
  }),
);
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("bloodhero");
    const userCollection = db.collection("user");
    const donationRequestsCollection = db.collection("donationRequests");
    const paymentCollection = db.collection("payment");

    // paymentCollection

    app.post("/payments", async (req, res) => {
      const { userId, email, amount, name } = req.body;
      const result = await paymentCollection.insertOne({
        userId,
        email,
        amount,
        name,
      });
      res.send(result);
    });

    app.get("/payments", async (req, res) => {
      const result = await paymentCollection.find().toArray();
      res.send(result);
    });

    // donationRequestsCollection

    app.get("/donationRequests/:email", async (req, res) => {
      const { email } = req.params;
      const result = await donationRequestsCollection
        .find({
          requesterEmail: email,
        })
        .toArray();
      res.send(result);
    });

    app.get("/donationRequests/my/:id", async (req, res) => {
      const id = req.params.id;
      const result = await donationRequestsCollection.findOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });

    app.patch("/donationRequests/my/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const result = await donationRequestsCollection.updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: {
            ...updateData,
          },
        },
      );

      res.send(result);
    });

    app.delete("/donationRequests/my/:id", async (req, res) => {
      const id = req.params.id;
      const result = await donationRequestsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.get("/donationRequests", async (req, res) => {
      const result = await donationRequestsCollection.find({}).toArray();
      res.send(result);
    });

    app.post("/donationRequests", async (req, res) => {
      const data = req.body;
      const result = await donationRequestsCollection.insertOne({
        ...data,
      });
      res.send(result);
    });

    // user collection
    app.get("/allUsers", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.patch("/allUsers/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const result = await userCollection.updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: updateData,
        },
      );

      res.send({
        result,
      });
    });

    app.patch("/profile/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const result = await userCollection.updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: updateData,
        },
      );
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running fine!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
