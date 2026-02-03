# Translation Practice

Translation Practice is a React-based web application designed to help users practice translating English sentences into another language. The app provides sentences categorized by language proficiency levels (A1 to C2) and offers feedback on translations.

## Features

- **Sentence Levels**: Practice sentences categorized by CEFR levels (A1, A2, B1, B2, C1, C2).
- **Translation Feedback**: Get feedback on your translations, word by word.
- **Modes**: Choose between "Easy" mode (ignores punctuation and capitalization) and "Hard" mode (strict matching).
- **Responsive Design**: Fully responsive layout for desktop and mobile devices.
- **Custom Input**: Enter your own English text for translation practice.

## Live Demo

Check out the live application here: [Translation Practice Live](https://henryk.co.za/translation-practice)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Henryk91/translation-practice.git
   cd translation-practice
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

   The app will be available at `http://localhost:3000`.

## Available Scripts

### `npm start`

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser. The app will connect to your real backend API.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run test:ci`

Runs all tests with coverage reporting. This is used in CI/CD pipelines and enforces coverage thresholds (80% global, 100% for helpers).

### `npx playwright test`

Runs end-to-end tests using Playwright across Chromium, Firefox, and WebKit browsers. MSW (Mock Service Worker) is automatically enabled for E2E tests.

### `npm run build`

Builds the app for production to the `build` folder.

## Testing

This project has comprehensive test coverage across multiple levels:

### Unit Tests

- **Helpers**: Core logic in `src/helpers/` (score-logic, feedback-logic, etc.)
- **Hooks**: Custom React hooks with behavior-focused tests
- **Components**: Individual component testing with React Testing Library

### Integration Tests

- Full feature flows testing multiple components together
- MSW for API mocking
- Redux state management testing

### End-to-End Tests (Playwright)

- Cross-browser testing (Chromium, Firefox, WebKit)
- User journey validation
- Mobile responsiveness testing

**Current Status**: 58/60 Jest tests passing, 9/9 Playwright tests passing

### Mock Service Worker (MSW)

MSW is used to mock API calls during testing:

- **Development**: Disabled by default (uses real backend)
- **E2E Tests**: Automatically enabled via `REACT_APP_USE_MSW=true`
- **Jest Tests**: Always enabled via `setupTests.ts`

To enable MSW in development (for testing without backend):

```bash
REACT_APP_USE_MSW=true npm start
```

### Coverage Thresholds

The project enforces code coverage thresholds:

- **Global**: 80% (branches, functions, lines, statements)
- **Helpers**: 100% for all files in `src/helpers/`

Run `npm run test:ci` to check coverage against these thresholds.

## Technologies Used

- **React**: Frontend framework
- **TypeScript**: Type-safe JavaScript
- **Redux Toolkit**: State management
- **React Router**: Client-side routing
- **TanStack Query**: Server state management and data fetching
- **Styled Components**: CSS-in-JS for styling
- **FontAwesome**: Icons for buttons and UI elements
- **MSW**: API mocking for tests
- **Playwright**: End-to-end testing
- **Jest & React Testing Library**: Unit and integration testing

## API Integration

The app uses an API endpoint (`https://note.henryk.co.za/api/`) for:

- Fetching translation levels and sentences
- Validating translations
- Storing user progress (when authenticated)

Ensure the API is accessible for the app to function correctly.

## Deployment

To deploy the app to GitHub Pages:

- Update the `.github/workflows/deploy.yml`

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- [Create React App](https://create-react-app.dev/) for the project setup
- [FontAwesome](https://fontawesome.com/) for icons
- [Styled Components](https://styled-components.com/) for styling
- [MSW](https://mswjs.io/) for API mocking
- [Playwright](https://playwright.dev/) for E2E testing

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## Contact

For any questions or feedback, please contact [Henryk91](https://github.com/Henryk91).
