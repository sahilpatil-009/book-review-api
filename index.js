const express = require("express");
const app = express();
const dotenv = require("dotenv");
const ConnectDb = require("./dbConnect/dbConnect.js");
const cors = require("cors");
// const userRoutes = require("./routes/user.js");

const authMiddleware = require("./middlewares/auth.js");
const {
  RegisterUser,
  LoginUser,
} = require("./controllers/user.controller.js");

const { GetAllbooks, AddBook, GetbookDetails, AddBookReview, EditBookReview, DeleteOwnReview, SearchBook } = require("./controllers/book.controller.js");

dotenv.config({});

const port = process.env.PORT || 3000;

ConnectDb();
app.use(cors());
app.use(express.json());

// register user
app.post("/signup", RegisterUser);

// login user
app.post("/login", LoginUser);

// get all books
app.get("/books", GetAllbooks);

// add book
app.post("/books",authMiddleware, AddBook);

// get book details by id
app.get("/books/:id", GetbookDetails);

// add review of book
app.post("/books/:id/reviews", authMiddleware, AddBookReview);

// edit own review
app.put("/reviews/:id", authMiddleware, EditBookReview);

// delete own review
app.delete("/reviews/:id", authMiddleware, DeleteOwnReview);

// search route
app.get('/search', SearchBook);



app.listen(port, () => {
  console.log(`listen on port ${port}`);
});
