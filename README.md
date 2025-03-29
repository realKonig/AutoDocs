# AutoDocs

AutoDocs is an AI-powered documentation generator that creates comprehensive project documentation from simple project descriptions. It helps developers, product managers, and teams quickly generate structured documentation for their software projects.

## Features

- **AI-Powered Document Generation**: Uses GPT-4 to generate detailed documentation
- **Multiple Document Types**: Generates 9 different types of documents:
  - Project Requirements Document (PRD)
  - Application Flow
  - Technology Stack
  - Frontend Guidelines
  - Backend Structure
  - Cursor Rules
  - Implementation Plan
  - Best Practices
  - Prompt Guide (AI Development Guide)
- **Project Type Support**: Tailored documentation for different project types:
  - Web Applications
  - Mobile Apps
  - Desktop Applications
  - AI/ML Projects
  - Other Custom Projects
- **Dark Mode UI**: Modern, clean interface with dark mode for better readability
- **Knowledge Base Export**: Download all generated documents as a ZIP file

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd autodocs
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage

1. Select your project type from the dropdown menu
2. Enter a detailed description of your project
3. Click "Generate Documentation"
4. Wait for all documents to be generated
5. Download the complete Knowledge Base as a ZIP file

## Development

### Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- OpenAI API
- React Hook Form
- Zod for validation

### Project Structure

```
autodocs/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate/
│   │   │       └── route.ts
│   │   ├── components/
│   │   │   └── DocumentViewer.tsx
│   │   ├── utils/
│   │   │   └── zip.ts
│   │   ├── page.tsx
│   │   └── layout.tsx
│   └── ...
├── public/
└── ...
```

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run lint`: Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
