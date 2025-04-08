# ResumeMe

ResumeMe is a full-stack application that helps users create, manage, and optimize their resumes. The project consists of a React TypeScript frontend and a Python backend with Ollama integration for AI capabilities.

## Project Structure

```
ResumeMe/
├── frontend/       # React TypeScript application
├── backend/        # Python backend application
└── readme.md       # This file
```

## Frontend

The frontend is built with React, TypeScript, and Vite. It uses Tailwind CSS for styling and various Radix UI components for the interface.

### Technologies Used

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Radix UI components
- Axios for API requests

### Setup Instructions

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Build for production:

   ```bash
   npm run build
   ```

5. Preview the production build:
   ```bash
   npm run preview
   ```

## Backend

The backend is built with Python and likely uses a web framework such as Flask or FastAPI. It integrates with Gemini for AI-powered resume analysis and optimization.
   ```bash
   ```

### Technologies Used

- Python
- Virtual environment for dependency management
- Pydantic for data validation
- Gemini for AI capabilities

### Ollama Integration

The application uses Ollama to provide AI-powered features:

- Resume content optimization
- Skills gap analysis
- Job description matching
- Tailored suggestions for specific roles

### Setup Instructions

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Set up a virtual environment:

   ```bash
   python -m env resumeme
   ```

3. Activate the virtual environment:

   - On Windows:
     ```bash
     source resumeme/bin/activate

     ```
   - On macOS/Linux:
     ```bash
     source resumeme/bin/activate
     ```

4. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Ensure Ollama is installed and running according to the [official documentation](https://ollama.ai/download)

6. Start the backend server:
   ```bash
   python app.py  # Or the appropriate entry point file
   ```

## Development

### Frontend Development

The frontend is configured with ESLint for code quality. You can run the linter with:

```bash
npm run lint
```

The project uses path aliases for cleaner imports. Import components and utilities from `@/` instead of using relative paths.

### Backend Development

Ensure you're working within the activated virtual environment when developing the backend.

## Deployment

### Frontend Deployment

1. Build the frontend:

   ```bash
   cd frontend
   npm run build
   ```

2. Deploy the contents of the `dist` directory to your web server or hosting platform.

### Backend Deployment

1. Ensure all dependencies are documented in `requirements.txt`:

   ```bash
   pip freeze > requirements.txt
   ```

2. Deploy according to your chosen hosting platform's instructions.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

[Include license information here]
