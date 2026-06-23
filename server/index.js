









const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const {Server} = require('socket.io');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const {startCronJobs} = require('./services/reminderService');

dotenv.config();
connectDB();
startCronJobs();

const app = express();
const server = http.createServer(app);


app.set('trust proxy',1);

//real time dashboard updates when whatsapp transaction comes in dashboard updates withoit page reload
const io = new Server(server, {
    cors: {origin: '*'}
});

//allow react to talk to any other browser
app.use(cors());

//serialization and deserilization
app.use(express.json())
app.use(express.urlencoded({extended: true}));

app.set('io',io);


//routes
app.use('/api/auth',require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/whatsapp', require('./routes/whatsapp'));
app.use('/api/ai',require('./routes/ai'));
app.use('/api/voice',require('./routes/voice'));

app.use(errorHandler);

app.get('/',(req,res) => {
    res.json({message: 'Server is running'});
});

//websocket listen for frontend connections emits events when data changes frontedn receive without polling
io.on('connection',(socket) => {
    console.log('Client connected', socket.id);
    socket.on('disconnect',() => {
        console.log('Client disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})