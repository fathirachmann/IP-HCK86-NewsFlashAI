## Example Request - NewsAPI
`GET http://localhost:3000/news/search?q=nickel&from=2025-08-01&to=2025-08-18&page=1&pageSize=5`
- Output:
```json
{
  "articles": [
    {
      "sourceId": "reuters",
      "sourceName": "Reuters",
      "title": "Nickel price rebounds after sharp drop",
      "url": "https://reuters.com/article/...",
      "imageUrl": "https://cdn.reuters.com/image.jpg",
      "publishedAt": "2025-08-18T12:00:00Z",
      "description": "Nickel price sees rebound due to ..."
    }
  ],
  "totalResults": 235
}
```

## Example Request - AI Summarize
```http
POST /ai/summarize
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "articleId": 12
}

---------------------------------------------------

POST /ai/summarize
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "url": "https://example.com/interesting-news"
}

---------------------------------------------------

POST /ai/summarize
Content-Type: application/json

{
  "content": "Long article content here ...",
  "persist": false
}


```

Output:
```json
{
  "bullets": [
    "Point 1 ...",
    "Point 2 ...",
    "Point 3 ...",
    "Point 4 ...",
    "Point 5 ..."
  ],
  "sentiment": "neutral",
  "keywords": ["policy", "market", "nickel"],
  "savedArticleId": 12
}
```

npx sequelize db:migrate:undo:all
npx sequelize db:migrate
npx sequelize db:seed:all