const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));

app.get('/', (req, res) => {
    res.json({ message: 'Blog Platform API' });
});

const multer = require('multer');

app.use((err, req, res, next) => {
    console.error('Error:', err.message);

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Max size is 20MB' });
        }
        return res.status(400).json({ message: err.message });
    }

    if (err === 'Error: Images Only!') {
        return res.status(400).json({ message: err });
    }

    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
