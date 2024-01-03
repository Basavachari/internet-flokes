const express = require('express');
const cors = require('cors');
require("dotenv").config();

const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT ;

app.get('/', (req, res) => {
  res.send('API Running');
});

connectDB();

app.use(express.json({ extended: false })); 
app.use(cors());

// swagger docs route
// app.use("/api-docs", require("./routes/api-docs"));

// Define Routes  


app.use('/v1/role', require('./routes/api/role'));
app.use('/v1/auth', require('./routes/api/auth'));
app.use('/v1/community', require('./routes/api/community'));
app.use('/v1/member', require('./routes/api/member'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
