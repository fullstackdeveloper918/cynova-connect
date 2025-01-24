# Cynova Video Platform

A powerful video creation and editing platform built with React, TypeScript, and Supabase.

## Project Info

**URL**: https://lovable.dev/projects/5fcdc4d6-6994-4087-9f5e-92dbf0f6aad0

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase
- **State Management**: TanStack Query
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)

## Getting Started

### Prerequisites

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Git
- Supabase project (for backend functionality)

### Environment Setup

1. Create a `.env.local` file in the root directory with:
```sh
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Installation

```sh
# Clone the repository
git clone <YOUR_REPO_URL>

# Navigate to project directory
cd cynova

# Install dependencies
npm install

# Start development server
npm run dev
```

## Development Workflow

1. Create a new branch for your feature/fix
```sh
git checkout -b feature/your-feature-name
```

2. Make your changes and commit them
```sh
git add .
git commit -m "Description of changes"
```

3. Push to GitHub and create a Pull Request
```sh
git push origin feature/your-feature-name
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── integrations/  # Third-party integrations
└── lib/          # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Database Schema

The project uses Supabase as the backend with the following main tables:
- projects
- exports
- quiz_questions
- would_you_rather_questions
- video_segments
- user_credits
- subscriptions

For detailed schema information, please refer to the Supabase dashboard.

## Deployment

The project can be deployed using:
1. Lovable's built-in deployment (recommended)
2. Custom deployment (Vercel, Netlify, etc.)

For custom domain setup, refer to our [Custom Domains Guide](https://docs.lovable.dev/tips-tricks/custom-domain/).

## Support

For questions or issues:
1. Create a GitHub issue
2. Contact the maintainers
3. Check the [Lovable documentation](https://docs.lovable.dev)# cynova-connect
