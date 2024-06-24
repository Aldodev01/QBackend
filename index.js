import express from "express"
import cors from "cors";
import dotenv from "dotenv";
import UserRoute from './src/routes/UserRoute.js'
import LocationRoute from './src/routes/LocationRoute.js'
import PresentRoute from './src/routes/PresentRoute.js'
import errorHandler from './src/middlewares/ErrorMiddleware.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(UserRoute);
app.use(LocationRoute);
app.use(PresentRoute);


// Middleware untuk menangani kesalahan
app.use(errorHandler);



app.listen(process.env.APP_PORT, ()=>{
    console.log('Server up and running...', process.env.APP_PORT);
});