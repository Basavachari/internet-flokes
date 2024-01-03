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

// Swagger
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Internet Flokes",
      version: "1.0.0",
      description: "Internet Flokes",
      contact: {
        name: "Node assignment",
      },
      servers: [{
        url: "http://localhost:5000"
      }],
    },
  },
  apis: ["./index.js","./routes/api/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.use('/v1/role', require('./routes/api/role'));
app.use('/v1/auth', require('./routes/api/auth'));
app.use('/v1/community', require('./routes/api/community'));
app.use('/v1/member', require('./routes/api/member'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));


