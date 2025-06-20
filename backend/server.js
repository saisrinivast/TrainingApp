require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection with fallback
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trainingdb';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Define schema & model
const trainingSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
  videoUrl: String,
});
const Training = mongoose.model('Training', trainingSchema);

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// API Routes
app.post('/api/upload', upload.single('file'), (req, res) => {
  res.json({ filePath: `/uploads/${req.file.filename}` });
});
app.get('/api/trainings', async (req, res) => {
  const trainings = await Training.find();
  res.json(trainings);
});
app.post('/api/trainings', async (req, res) => {
  const newTraining = new Training(req.body);
  await newTraining.save();
  res.json(newTraining);
});
app.delete('/api/trainings/:id', async (req, res) => {
  await Training.findByIdAndDelete(req.params.id);
  res.sendStatus(200);
});

// Root route to prevent "Cannot GET /"
app.get('/', (req, res) => {
  res.send('API is running');
});

// Optionally serve React frontend (comment this out if no frontend)
const clientBuildPath = path.join(__dirname, 'client', 'build');
if (require('fs').existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Start server on specified port or 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
