"use strict";
const { Note } = require("../models");
const { httpError } = require("../utils/httpError");

class NotesController {
  // GET /articles/:id/notes
  static async listByArticle(req, res, next) {
    try {
      const { id: articleId } = req.params;

      const notes = await Note.findAll({
        where: { articleId },
        order: [["createdAt", "ASC"]],
      });
      res.json(notes);
    } catch (err) {
      next(err);
    }
  }

  // POST /articles/:id/notes
  static async create(req, res, next) {
    try {
      const { id: articleId } = req.params;
      const { content } = req.body;

      if (!content || !content.trim()) {
        throw httpError.badRequest("content is required", "BAD_REQUEST");
      }

      const note = await Note.create({ articleId, content: content.trim() });
      res.status(201).json(note);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { noteId } = req.params;
      const { content } = req.body;

      const note = await Note.findByPk(noteId);
      if (!note) throw httpError.notFound("Note not found");

      if (!content || !content.trim()) {
        throw httpError.badRequest("content is required", "BAD_REQUEST");
      }

      await note.update({ content: content.trim() });
      res.json(note);
    } catch (err) {
      next(err);
    }
  }

  static async destroy(req, res, next) {
    try {
      const { noteId } = req.params;

      const note = await Note.findByPk(noteId);
      if (!note) throw httpError.notFound("Note not found");

      await note.destroy();
      res.json({ message: "Note deleted" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = NotesController;
