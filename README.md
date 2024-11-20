Here's the updated README file with values for email API, JWT token configuration, and MySQL database setup:


---

Health Tracking System

This repository contains the source code for a Health Tracking System that enables users to:

1. Order Test Kits


2. Access Telemedicine Services


3. Use an AI Symptom Checker



The project is divided into two main parts:

Frontend: Built using JSX (React.js)

Backend: Built using Node.js (located in the backend branch)



---

Features

1. Order Test Kits

Users can browse and order medical test kits directly from the platform.

2. Telemedicine Services

The system includes a video and chat feature for users to consult with medical professionals remotely.

3. AI Symptom Checker

The AI-powered symptom checker allows users to input their symptoms and receive guidance on possible conditions.


---

Folder Structure

Main Branch (Frontend)

The main branch contains the frontend code written in JSX using React.js.

/src  
  ├── components  
  │   ├── OrderTestKit.jsx  
  │   ├── Telemedicine.jsx  
  │   ├── SymptomChecker.jsx 
  │   └── Header.jsx  
  ├── assets  
  │   ├── images/  
  │   └── styles/  
  ├── App.jsx  
  └── index.jsx

Backend Branch

The backend branch contains the Node.js server code. It handles API endpoints, authentication, database interactions, and the integration with AI models for the symptom checker.


---

Installation

Prerequisites

Ensure you have the following installed:

Node.js

npm (Node Package Manager)

MySQL



---

Frontend Setup

1. Clone the repository and navigate to the main branch:

git clone <repository-url>  
cd health-tracking-system


2. Install dependencies:

npm install


3. Run the development server:

npm run dev



The frontend should now be running at http://localhost:3000.


---

Backend Setup

1. Switch to the backend branch:

git checkout backend


2. Install backend dependencies:

npm install


3. Configure the .env file for database connection, email API, and JWT settings:

DB_HOST=localhost  
DB_USER=<your-mysql-username>  
DB_PASSWORD=<your-mysql-password>  
DB_NAME=health_tracking  

EMAIL_HOST=smtp.example.com  
EMAIL_PORT=587  
EMAIL_USER=<your-email-address>  
EMAIL_PASSWORD=<your-email-password>  

JWT_SECRET=<your-secret-key>  
JWT_EXPIRATION=1d  
PORT=5000


4. Initialize the MySQL database:

Use the provided SQL scripts (if available) to create the necessary tables.



5. Start the server:

npm start



The backend API should now be running at http://localhost:5000.


---

Technologies Used

Frontend

React.js

JSX

CSS (with a focus on responsive design)


Backend

Node.js

Express.js

MySQL

Nodemailer (for Email API)

JWT (for authentication)

OpenAI API (for AI Symptom Checker)



---

Contribution Guidelines

1. Fork the repository.


2. Create a new branch:

git checkout -b feature-branch-name


3. Commit your changes and push to your branch.


4. Submit a pull request for review.




---

License

This project is licensed under the MIT License.


---

Contact

For questions or support, reach out at mwantech005@gmail.com

