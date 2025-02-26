# Admin Portal React Application

This is the React version of the Admin Portal for SSO-as-a-Service. It provides a modern, responsive user interface for managing OAuth clients, users, and system settings.

## Features

- **Dashboard**: Overview of system metrics and recent activity
- **Clients Management**: Create, view, edit, and delete OAuth clients
- **User Management**: Create, view, edit, and delete users
- **Settings**: Configure system settings including security policies and appearance

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Navigate to the admin-portal-react directory:
   ```
   cd services/admin-portal-react
   ```
3. Install dependencies:
   ```
   npm install
   ```

### Development

To start the development server:

```
npm start
```

This will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Building for Production

To build the app for production:

```
npm run build
```

This builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

## Project Structure

```
services/admin-portal-react/
├── public/                 # Static files
├── src/                    # Source code
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   ├── services/           # API and service functions
│   ├── App.js              # Main application component
│   ├── index.js            # Application entry point
│   └── index.css           # Global styles
└── package.json            # Project dependencies and scripts
```

## Authentication

The application uses a token-based authentication system. For development purposes, you can use the following credentials:

- Username: `admin`
- Password: `password`

In a production environment, you would connect this to your actual authentication backend.

## API Integration

The application is configured to proxy API requests to `http://localhost:3001` during development. Update the `proxy` field in `package.json` if your API is running on a different port.

## License

This project is part of the SSO-as-a-Service platform and is subject to its licensing terms. 