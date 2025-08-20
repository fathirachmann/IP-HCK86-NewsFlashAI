const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/AuthController");
const ArticleController = require("../controllers/ArticleController");
const auth = require("../middlewares/auth");
const NewsController = require("../controllers/NewsController");
const AiController = require("../controllers/AiController");

router.get("/health", (req, res) => res.json({ status: "ok" }));
router.post("/auth/google", AuthController.googleSignIn);

// Public
router.get("/news/search", NewsController.search);

// News
router.post("/ai/summarize-public", AiController.summarize);

// Articles
router.get("/articles", auth, ArticleController.getAll);
router.post("/articles", auth, ArticleController.create);
router.put("/articles/:id", auth, ArticleController.update);
router.delete("/articles/:id", auth, ArticleController.delete);

// AI
router.post("/ai/summarize", auth, AiController.summarize);

module.exports = router;
