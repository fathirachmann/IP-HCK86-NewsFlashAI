# Server API Documentation

## Authentication

### POST /auth/google

- **Authorization:** none
- **Request Body:**

```json
  - `idToken` (string, required)
```
# Server API Documentation

This document lists the server routes, required authorization, request examples (including query parameters where applicable), and precise response schemas.

Use the Authorization header with a bearer token where indicated:

Authorization example:
```http
Authorization: Bearer <access_token>
```

---

## POST /auth/google
### Route request
Authorization:
```json
{}
```

Request Body (if any):
```json
{
  "idToken": "string (required)"
}
```

Responses:
- 200 OK
```json
{
  "id": 3,
  "email": "user@gmail.com",
  "name": "User name",
  "picture": "https://...",
  "access_token": "string"
}
```

Errors:
- 400 Bad Request when `idToken` is missing or invalid.

---

## GET /news/search
### Route request
Authorization:
```json
{}
```

Query Parameters (example):
```json
{
  "q": "covid",
  "page": 1,
  "pageSize": 20
}
```

Notes:
- `q` is required and must be at least 2 characters. `page` and `pageSize` are optional and control pagination.

Responses:
- 200 OK
```json
{
  "articles": [
    {
      "title": "News title",
      "url": "https://...",
      "source": "Source Name",
      "publishedAt": "2025-08-22T12:00:00.000Z"
    }
  ],
  "totalResults": 124,
  "page": 1,
  "pageSize": 20
}
```

Errors:
- 400 when `q` is missing or too short.

---

## GET /articles
### Route request
Authorization:
```json
{
  "Authorization": "Bearer <access_token>"
}
```

Query Parameters (optional):
```json
{
  "page": 1,
  "pageSize": 20,
  "tags": "tag1,tag2"
}
```

Request Body (if any):
```json
{}
```

Responses:
- 200 OK
```json
{
  "data": [
    {
      "id": 1,
      "userId": 1,
      "sourceId": "source-123",
      "url": "https://...",
      "title": "Article title",
      "imageUrl": "https://...",
      "publishedAt": "2025-08-22T00:00:00.000Z",
      "tags": "tag1,tag2",
      "createdAt": "2025-08-22T00:01:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 42
}
```

---

## POST /articles
### Route request
Authorization:
```json
{
  "Authorization": "Bearer <access_token>"
}
```

Request Body (example):
```json
{
  "sourceId": "source-123",
  "url": "https://example.com/article",
  "title": "Article title",
  "imageUrl": "https://.../image.jpg",
  "publishedAt": "2025-08-22T00:00:00.000Z",
  "tags": "technology,ai"
}
```

Validation:
- `url` is required. Other fields are optional.

Responses:
- 201 Created
```json
{
  "id": 12,
  "userId": 1,
  "sourceId": "source-123",
  "url": "https://example.com/article",
  "title": "Article title",
  "imageUrl": "https://.../image.jpg",
  "publishedAt": "2025-08-22T00:00:00.000Z",
  "tags": "technology,ai",
  "createdAt": "2025-08-22T00:02:00.000Z"
}
```

Errors:
- 400 Bad Request when required fields are missing or invalid.

---

## PUT /articles/:id
### Route request
Authorization:
```json
{
  "Authorization": "Bearer <access_token>"
}
```

Path Parameters example:
```json
{ "id": 2 }
```

Request Body (example):
```json
{
  "tags": "updated,tag"
}
```

Behavior & Validation:
- User must own the article to update it (checked by `checkArticleOwner`).

Responses:
- 200 OK
```json
{
  "id": 2,
  "userId": 1,
  "tags": "updated,tag",
  "updatedAt": "2025-08-22T00:10:00.000Z"
}
```

Errors:
- 403 Forbidden when the authenticated user does not own the article.
- 404 Not Found when the article does not exist.

---

## DELETE /articles/:id
### Route request
Authorization:
```json
{
  "Authorization": "Bearer <access_token>"
}
```

Path Parameters example:
```json
{ "id": 2 }
```

Responses:
- 200 OK
```json
{
  "message": "Article deleted"
}
```

Errors:
- 404 Not Found when the article does not exist.

---

## GET /articles/:id/notes
### Route request
Authorization:
```json
{
  "Authorization": "Bearer <access_token>"
}
```

Path Parameters example:
```json
{ "id": 5 }
```

Responses:
- 200 OK
```json
[
  {
    "id": 1,
    "articleId": 5,
    "content": "note text",
    "createdAt": "2025-08-22T00:20:00.000Z"
  }
]
```

---

## POST /articles/:id/notes
### Route request
Authorization:
```json
{
  "Authorization": "Bearer <access_token>"
}
```

Path Parameters example:
```json
{ "id": 5 }
```

Request Body (example):
```json
{
  "content": "This is my note about the article."
}
```

Validation:
- `content` is required and cannot be empty.

Responses:
- 201 Created
```json
{
  "id": 2,
  "articleId": 5,
  "content": "This is my note about the article.",
  "createdAt": "2025-08-22T00:21:00.000Z"
}
```

Errors:
- 400 Bad Request when `content` is missing.
- 403 Forbidden when the user does not own the article.

---

## PUT /articles/:id/notes/:noteId
### Route request
Authorization:
```json
{
  "Authorization": "Bearer <access_token>"
}
```

Path Parameters example:
```json
{ "id": 5, "noteId": 2 }
```

Request Body (example):
```json
{
  "content": "Updated note content"
}
```

Responses:
- 200 OK
```json
{
  "id": 2,
  "articleId": 5,
  "content": "Updated note content",
  "updatedAt": "2025-08-22T00:22:00.000Z"
}
```

Errors:
- 400 Bad Request when `content` is missing.
- 404 Not Found when note is not found.
- 403 Forbidden when user does not own the article.

---

## DELETE /articles/:id/notes/:noteId
### Route request
Authorization:
```json
{
  "Authorization": "Bearer <access_token>"
}
```

Path Parameters example:
```json
{ "id": 5, "noteId": 2 }
```

Responses:
- 200 OK
```json
{
  "message": "Note deleted"
}
```

Errors:
- 404 Not Found when note is not found.
- 403 Forbidden when user does not own the article.

---

## POST /ai/summarize
### Route request
Authorization:
```json
{
  "Authorization": "Bearer <access_token>"
}
```

Request Body (examples):
- Summarize raw text
```json
{
  "content": "Long article text to summarize...",
  "persist": true
}
```
- Summarize by URL
```json
{
  "url": "https://example.com/article",
  "persist": false
}
```
- Summarize an existing article by id
```json
{
  "articleId": 12
}
```

Behavior:
- The controller accepts either `content`, `url`, or `articleId`. If `persist` is true or omitted, the generated summary may be saved as an Article.

Responses:
- 200 OK
```json
{
  "bullets": ["Key point 1","Key point 2","Key point 3","Key point 4","Key point 5"],
  "sentiment": "neutral",
  "keywords": ["keyword1","keyword2"],
  "impact": "Short impact statement",
  "savedArticleId": 123
}
```

Errors:
- 400 Bad Request when no input (`content`, `url`, or `articleId`) is provided or input is too short.
- 500 Internal Server Error for unexpected failures from AI provider or scraping.

---

## Global Error Format
### Route request
Authorization:
```json
{}
```

Request Body (if any):
```json
{}
```

Responses:
- Any error status (400/401/403/404/500)
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { "field": "optional details" }
  }
}
```

Unknown routes return:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Route <METHOD> <PATH> not found"
  }
}
```
  "articleId": 5,
  "content": "updated content"
}
```

Errors:
- 400 when content is missing
- 404 when note not found
- 403 when user does not own the article

## DELETE /articles/:id/notes/:noteId
### Route request
Authorization:
```json
{
  "Authorization": "Bearer <access_token>"
}
```

Request Body (if any):
```json
{}
```

Responses:
- 200
```json
{
  "message": "Note deleted"
}
```

## POST /ai/summarize
### Route request
Authorization:
```json
{
  "Authorization": "Bearer <access_token>"
}
```

Request Body (if any):
```json
{
  "content": "string (optional, raw text to summarize)",
  "url": "string (optional, article URL to fetch and summarize)",
  "articleId": "integer (optional, ID of existing article)",
  "persist": "boolean (optional, default true)"
}
```

Responses:
- 200
```json
{
  "bullets": ["bullet1","bullet2","bullet3","bullet4","bullet5"],
  "sentiment": "positive|neutral|negative",
  "keywords": ["k1","k2"],
  "impact": "short description",
  "savedArticleId": 123
}
```

## Global Error Format
### Route request
Authorization:
```json
{}
```

Request Body (if any):
```json
{}
```

Responses:
- Any error status (400/401/403/404/500)
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

Unknown routes return:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Route <METHOD> <PATH> not found"
  }
}
```
