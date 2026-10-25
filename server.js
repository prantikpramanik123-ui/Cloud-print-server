const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// আপলোড ফোল্ডার তৈরি নিশ্চিত করা
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// মেমরিতে প্রিন্ট রিকোয়েস্টের তালিকা জমানোর জন্য (অথবা ফাইল হিসেবে)
let printRequests = [];

// Multer ফাইল স্টোরেজ সেটআপ
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// কাস্টমার হোমপেজ রুট
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ফাইল আপলোড ও প্রিন্ট রিকোয়েস্ট গ্রহণ করার API
app.post('/upload', upload.single('printFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: "error", message: "কোনো ফাইল সিলেক্ট করা হয়নি!" });
    }

    const newRequest = {
        id: Date.now(),
        filename: req.file.originalname,
        storedName: req.file.filename,
        printType: req.body.printType === 'color' ? 'কালার প্রিন্ট' : 'ব্ল্যাক অ্যান্ড হোয়াইট',
        copies: req.body.copies || 1,
        time: new Date().toLocaleString()
    };

    printRequests.unshift(newRequest); // নতুন রিকোয়েস্ট উপরে যোগ হবে

    res.json({
        status: "success",
        message: "ফাইল সফলভাবে আপলোড হয়েছে!",
        data: newRequest
    });
});

// দোকানদারের জন্য অ্যাডমিন প্যানেল API (সব রিকোয়েস্ট দেখার জন্য)
app.get('/api/requests', (req, res) => {
    res.json(printRequests);
});

// আপলোড করা ফাইল ডাউনলোড করার রাউট
app.get('/download/:filename', (req, res) => {
    const file = path.join(__dirname, 'uploads', req.params.filename);
    res.download(file);
});

app.listen(PORT, () => {
    console.log(`Cloud Print Server is running on port ${PORT}`);
});
