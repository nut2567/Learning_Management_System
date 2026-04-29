# Learning Management System

Next.js LMS project backed by MongoDB through Mongoose and Typesense for course search indexing.

## Local Services

Start MongoDB and Typesense with Docker Compose:

```powershell
docker compose up -d
```

The default local service URLs are:

```text
MongoDB: mongodb://127.0.0.1:27017/learning_management_system
Typesense: http://127.0.0.1:8108
Typesense API key: xyz
```

You can override them with environment variables:

```text
MONGODB_URI
TYPESENSE_HOST
TYPESENSE_API_KEY
TYPESENSE_COURSES_COLLECTION
```

## App

Run the Next.js app:

```powershell
npm run dev
```

Open:

```text
http://localhost:4400
```

## Seed Data

Seed MongoDB and index all courses into Typesense:

```powershell
Invoke-RestMethod -Uri "http://localhost:4400/api/seed?reset=true" -Method Post
```

The seed route also accepts a JSON body:

```json
{
  "reset": true,
  "instructors": [
    {
      "Instructor_Name": "Ariya Wong",
      "age": 34,
      "email": "ariya.wong@example.com",
      "image": "/bukky.jpg",
      "phone": "081-234-5678"
    }
  ],
  "courses": [
    {
      "Course_Title": "Next.js Foundations",
      "instructorName": "Ariya Wong",
      "Course_Duration": 6.3,
      "Level": "Beginner",
      "Enrollment_Count": 1480,
      "Status": "Open",
      "image": "/16_9.png"
    }
  ]
}
```
