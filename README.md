# ChatGenie 2.0

ChatGenie 2.0 is a next-generation chat application designed to provide seamless real-time messaging with enhanced features and a modular, scalable architecture. It builds upon the foundation of ChatGenie 1.0 with significant improvements to both the backend and frontend.

## Features
- **User Authentication**: Secure user registration and login using JWT.
- **Real-Time Messaging**: Send and receive messages in real time using WebSockets.
- **Channel Management**: Create and join channels dynamically.
- **File Uploads**: Upload and share files with validation (size and format).
- **User Presence Tracking**: See who is online and track connection statuses.
- **Improved UI**: A cleaner, more user-friendly interface using React.
- **Modular Architecture**: Backend and frontend organized into reusable components for better maintainability.

## Tech Stack
### Backend
- **Node.js**: Backend runtime.
- **Express**: Web framework.
- **Socket.IO**: Real-time communication.
- **Sequelize**: ORM for database interactions.
- **SQLite**: Lightweight relational database.

### Frontend
- **React**: Component-based UI library.
- **HTML/CSS/JavaScript**: For additional responsiveness and styling.

## Installation and Setup
### Clone the Repository
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/chatgenie-2.0.git
   ```
2. Navigate to the project directory:
   ```bash
   cd chatgenie-2.0
   ```

### Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Sync the database:
   ```bash
   node syncDB.js
   ```
4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the `chatgenie-frontend` folder:
   ```bash
   cd chatgenie-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm start
   ```

## Folder Structure
```
chatgenie-2.0/
├── backend/
│   ├── config/
│   │   ├── config.json
│   │   ├── dbConfig.js
│   │   └── chatgenie.db
│   ├── migrations/            # For database migrations (if used)
│   ├── models/
│   │   ├── Channel.js
│   │   ├── Message.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── channels.js
│   │   └── messages.js
│   ├── seeders/               # For adding initial data (if used)
│   ├── utils/
│   │   └── addTestUser.js
│   ├── app.js                 # Main backend entry point
│   ├── server.js              # Initializes server
│   └── syncDB.js              # Syncs database models
├── chatgenie-frontend/
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Chat.js
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── App.test.js
│   │   ├── index.js
│   │   └── index.css
├── .gitignore
├── README.md
├── package.json
└── package-lock.json
```

## Database Setup
- **Sync Database**: Use `syncDB.js` to synchronize database models with the SQLite database:
  ```bash
  node syncDB.js
  ```
- **Add Test Users**: Use `addTestUser.js` to populate the database with initial test users.

## Testing
- All backend endpoints have been tested using `cURL`.
- Frontend React components (`Chat.js`, `Login.js`, `Register.js`) tested locally in the browser.

## Future Enhancements
- **Threaded Conversations**: Enable better message organization.
- **Emoji Reactions**: Interactive message responses.
- **Database Optimization**: Plan a scalable database schema for larger datasets.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request if you'd like to contribute.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

---



