const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;
const url = 'mongodb://localhost:27017';
const dbName = 'studentDB';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let db, students;
const client = new MongoClient(url);

async function startServer() {
    try {
        await client.connect();
        console.log('Connected successfully to MongoDB server');
        db = client.db(dbName);
        students = db.collection("students");

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error("MongoDB connection Error:", error);
    }
}
startServer();

// API Endpoints

// Create
app.post('/api/students', async (req, res) => {
    try {
        const { name, age, course } = req.body;
        const result = await students.insertOne({ name, age: parseInt(age), course });
        res.status(201).json({ id: result.insertedId, name, age, course });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Read
app.get('/api/students', async (req, res) => {
    try {
        const data = await students.find().toArray();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update
app.put('/api/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, age, course } = req.body;
        const result = await students.updateOne(
            { _id: new ObjectId(id) },
            { $set: { name, age: parseInt(age), course } }
        );
        res.json({ modifiedCount: result.modifiedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete
app.delete('/api/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await students.deleteOne({ _id: new ObjectId(id) });
        res.json({ deletedCount: result.deletedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
