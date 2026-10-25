const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Multer সেটআপ (ফাইল আপলোড করার জন্য)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads'); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // স্ট্যাটিক ফাইল ও index.html দেখানোর জন্য

// টেস্ট রাউট
app.get('/', (req, res) => {
    res.json({ status: "success", message: "Cloud Print Server is running successfully!" });
});

// ফাইল আপলোড ও প্রিন্ট রিকোয়েস্ট রাউট
app.post('/upload', upload.single('printFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: "error", message: "No file uploaded!" });
    }

    console.log("Received file:", req.file.originalname);
    res.json({
        status: "success",
        message: "File uploaded and print request received successfully!",
        filename: req.file.filename
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
