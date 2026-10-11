# Library API Design

This is a REST API for a library's `books` resource. A book has `id`, `title`, `author`, `year` and `available`.

## Endpoints

### 1. List all books

- **Method:** GET
- **Path:** `/books`
- **Description:** Returns every book in the library.
- **Success status:** 200 OK

### 2. Get one book

- **Method:** GET
- **Path:** `/books/{id}`
- **Description:** Returns the book with the given id.
- **Success status:** 200 OK

### 3. Create a book

- **Method:** POST
- **Path:** `/books`
- **Description:** Adds a new book to the library.
- **Example request body:**

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "year": 1958
}
```

- **Success status:** 201 Created

### 4. Update a book

- **Method:** PATCH
- **Path:** `/books/{id}`
- **Description:** Changes only the fields sent for the given book.
- **Example request body:**

```json
{
  "available": false
}
```

- **Success status:** 200 OK

### 5. Delete a book

- **Method:** DELETE
- **Path:** `/books/{id}`
- **Description:** Removes the book with the given id.
- **Success status:** 204 No Content

### 6. List books by an author

- **Method:** GET
- **Path:** `/books?author=Chinua%20Achebe`
- **Description:** Returns only the books written by the given author, using the `author` query parameter.
- **Success status:** 200 OK

## Error codes

- **400 Bad Request:** the request is invalid. Example: `POST /books` with an empty title, or with `year` sent as text.
- **404 Not Found:** the book does not exist. Example: `GET /books/9999` when no book has that id.
