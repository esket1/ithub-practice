require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const soap = require('soap');
const cors = require('cors');
const xml2js = require('xml2js');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const DigitalResourceSchema = new mongoose.Schema({
    title: String, author: String, format: String, downloadCount: { type: Number, default: 0 }
});
const DigitalResource = mongoose.model('DigitalResource', DigitalResourceSchema);

const DownloadLogSchema = new mongoose.Schema({
    resourceId: String, userId: String, timestamp: { type: Date, default: Date.now }
});
const DownloadLog = mongoose.model('DownloadLog', DownloadLogSchema);

async function initMongo() {
    const count = await DigitalResource.countDocuments();
    if (count === 0) {
        await DigitalResource.insertMany([
            { title: "Clean Code", author: "Robert C. Martin", format: "pdf" },
            { title: "Design Patterns", author: "GoF", format: "epub" }
        ]);
        console.log("MongoDB initialized with test data.");
    }
}
initMongo();

let soapClient = null;
soap.createClient(process.env.SOAP_WSDL_URL, (err, client) => {
    if (err) console.error("SOAP Init Error:", err);
    else {
        soapClient = client;
        console.log("SOAP Client connected successfully.");
    }
});

app.get('/api/physical/books', (req, res) => {
    if (!soapClient) return res.status(500).json({ error: "SOAP client not ready" });
    
    soapClient.searchBooksByAuthor({ author_name: req.query.author || '' }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        xml2js.parseString(result.result, (xmlErr, parsed) => {
            if (xmlErr) return res.status(500).json({ error: "XML parse error" });
            const books = parsed.BookList.Book ? parsed.BookList.Book.map(b => ({
                inventory_number: b.inventory_number[0],
                title: b.title[0],
                author: b.author[0],
                status: b.status[0]
            })) : [];
            res.json(books);
        });
    });
});

app.post('/api/physical/loan', (req, res) => {
    if (!soapClient) return res.status(500).json({ error: "SOAP client not ready" });
    const { inventory_number, reader_card } = req.body;

    soapClient.registerLoan({ inventory_number, reader_card }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        xml2js.parseString(result.result, (xmlErr, parsed) => {
            if (xmlErr) return res.status(500).json({ error: "XML parse error" });
            res.json({
                success: parsed.LoanResult.success[0] === 'true',
                message: parsed.LoanResult.message[0]
            });
        });
    });
});

app.get('/api/digital/resources', async (req, res) => {
    const resources = await DigitalResource.find();
    res.json(resources);
});

app.post('/api/digital/download', async (req, res) => {
    const { resourceId, userId } = req.body;
    await DigitalResource.findByIdAndUpdate(resourceId, { $inc: { downloadCount: 1 } });
    await DownloadLog.create({ resourceId, userId });
    res.json({ success: true, link: `http://dummy-link.com/download/${resourceId}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Node Gateway running on port ${PORT}`));