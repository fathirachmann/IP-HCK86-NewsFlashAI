const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/AuthController");
const ArticleController = require("../controllers/ArticleController");
const NewsController = require("../controllers/NewsController");
const AiController = require("../controllers/AiController");
const NotesController = require("../controllers/NoteController");
const checkArticleOwner = require("../middlewares/checkArticleOwner");
const auth = require("../middlewares/auth");

// Auth
router.post("/auth/google", AuthController.googleSignIn);

// Public
router.get("/news/search", NewsController.search);

// Articles
router.get("/articles", auth, ArticleController.getAll);
router.post("/articles", auth, ArticleController.create);
router.put("/articles/:id", auth, checkArticleOwner, ArticleController.update);
router.delete("/articles/:id", auth, checkArticleOwner, ArticleController.delete);

// Notes
router.get("/articles/:id/notes", auth, NotesController.listByArticle);
router.post("/articles/:id/notes", auth, NotesController.create);
router.put("/articles/:id/notes/:noteId", auth, checkArticleOwner, NotesController.update);
router.delete("/articles/:id/notes/:noteId", auth, checkArticleOwner, NotesController.destroy);

// AI
router.post("/ai/summarize", auth, AiController.summarize);

module.exports = router;
