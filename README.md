# TaskFlow API

A powerful and flexible REST API for task management, built with Node.js, Express, and MongoDB.

## 🚀 Features

- 👤 User Authentication & Authorization
- 📝 Task Management
- 🔒 Secure Password Handling
- 📨 Email Notifications
- 🛡️ Rate Limiting
- 🌐 CORS Support
- 🔍 Input Validation
- 📊 Session Management
- 👑 Role-based Access Control

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## 🛠️ Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/taskflow-api.git
cd taskflow-api
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

4. Start the server:

```bash
npm start
```

## 📚 API Documentation

Full API documentation is available at:

- [https://taskflowapi.vercel.app/docs](https://taskflowapi.vercel.app/docs)
- [Rate Limits Documentation](https://taskflowapi.vercel.app/docs/rate-limits)

### Quick API Reference

#### Authentication Endpoints

- `POST /api/users/signup` - Create new account
- `POST /api/users/signin` - Sign in to account
- `POST /api/users/signout` - Sign out
- `POST /api/users/refresh` - Refresh access token

#### User Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/reset-password` - Reset password with OTP
- `GET /api/users/sessions` - Get all active sessions
- `POST /api/users/signout-all` - Sign out from all devices

#### Task Management

- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 🔒 Security Features

1. **Rate Limiting**

   - Global: 100 requests per 15 minutes
   - Authentication: 5 requests per hour
   - API: 50 requests per 15 minutes

2. **HTTP Parameter Pollution Protection**

   - Prevents parameter pollution attacks
   - Automatically combines duplicate parameters

3. **Input Validation**

   - Request validation using express-validator
   - Schema validation using Joi

4. **Security Headers**
   - CORS configuration
   - Helmet middleware
   - Content Security Policy

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## 📦 Dependencies

- express
- mongoose
- jsonwebtoken
- bcryptjs
- express-validator
- joi
- nodemailer
- cors
- helmet
- express-rate-limit
- hpp

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, email taskflow.api@taskflow.com or create an issue in the repository.
