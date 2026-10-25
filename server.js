const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// uploads ফোল্ডার না থাকলে স্বয়ংক্রিয়ভাবে তৈরি হবে
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Multer সেটআপ (ফাইল আপলোড করার জন্য)
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

// টেস্ট রাউট
app.get('/', (req, res) => {
    res.json({ status: "success", message: "Cloud Print Server is running successfully!" });
});

// ফাইল আপলোড ও প্রিন্ট রিকোয়েস্ট রাউট
app.post('/upload', upload.single('printFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: "error", message: "কোনো ফাইল আপলোড করা হয়নি!" });
    }

    console.log("Received file:", req.file.originalname);
    console.log("Print Type:", req.body.printType);
    console.log("Copies:", req.body.copies);

    res.json({
        status: "success",
        message: "ফাইল সফলভাবে আপলোড হয়েছে!",
        filename: req.file.filename
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
