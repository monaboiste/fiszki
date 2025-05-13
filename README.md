# Fiszki: AI-Powered Flashcards

## Project Description

Fiszki is a web application designed to simplify the process of creating and managing educational
flashcards. It leverages artificial intelligence to automatically generate flashcards from any
input text, while also allowing users to manually create, edit, and delete flashcards.
Additionally, the application integrates with a spaced repetition algorithm to enhance the
learning experience.

Live Demo available here: [https://fiszki-eight.vercel.app](https://fiszki-eight.vercel.app).

## Tech Stack

- **Frontend:**

  - Astro 5
  - React 19
  - TypeScript 5
  - Tailwind CSS 4
  - Shadcn/ui

- **Backend:**

  - Supabase

- **AI Integration:**

  - Openrouter.ai (access to various AI models such as OpenAI, Anthropic, Google, etc.)

- **Testing:**

  - Vitest & React Testing Library (unit and integration tests)
  - Playwright (end-to-end tests)

- **CI/CD & Hosting:**
  - GitHub Actions
  - vercel.app (serverless)

## Getting Started Locally

To get started with the project locally, follow these steps:

1. **Clone the repository:**

   ```sh
   git clone git@github.com:monaboiste/fiszki.git
   ```

2. **Install Node.js:**
   Make sure you have Node.js version as specified in the `.nvmrc` file.
   Current supported version is **22.14.0**.

3. **Install dependencies:**

   ```sh
   npm install
   ```

4. **Run the development server:**
   ```sh
   npm run dev
   ```

Your application should now be running locally on [http://localhost:3000](http://localhost:3000).

## Available Scripts

The following scripts are available in the project:

- **dev:** Starts the Astro development server

  ```sh
  npm run dev
  ```

- **build:** Builds the project for production

  ```sh
  npm run build
  ```

- **preview:** Previews the production build

  ```sh
  npm run preview
  ```

- **astro:** Runs Astro CLI commands

  ```sh
  npm run astro
  ```

- **lint:** Runs ESLint to analyze code quality

  ```sh
  npm run lint
  ```

- **lint:fix:** Automatically fixes ESLint issues

  ```sh
  npm run lint:fix
  ```

- **format:** Formats the codebase using Prettier
  ```sh
  npm run format
  ```

## Project Scope

The scope of the project includes:

- **User Management:**

  - User registration and login using email and password.

- **Flashcards Generation & Management:**

  - Automatic generation of flashcards using AI based on user-provided text.
  - Manual creation, editing, and deletion of flashcards.
  - Displaying a list of flashcards sorted by modification date with search functionality.

- **Learning Integration:**
  - Integration with an existing spaced repetition algorithm to plan effective learning sessions.
  - Monitoring learning progress through interactive study sessions.

## Testing

This project includes a comprehensive testing setup with Vitest for unit/integration tests and Playwright for E2E tests.

### Running Tests

```bash
# Run unit tests
npm test

# Run unit tests with watch mode
npm run test:watch

# Run unit tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run E2E tests
npm run e2e

# Run E2E tests with UI
npm run e2e:ui

# Run E2E tests in debug mode
npm run e2e:debug
```

For more details on the testing setup, see [TESTING.md](TESTING.md).

## Project Status

This project is currently under active development. New features and improvements are being continuously integrated.

## License

This project is licensed under the MIT License.
