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

## Deployment

To deploy the app to GitHub Pages:

- Update the ./github/workflows/deploy.yml

## Scripts

- `npm start`: Start the development server.
- `npm run build`: Build the app for production.
- `npm test`: Run tests.
- `npm run eject`: Eject the Create React App configuration.
- `npm run deploy:github`: Build and deploy the app to GitHub Pages.

## Technologies Used

- **React**: Frontend framework.
- **TypeScript**: Type-safe JavaScript.
- **Styled Components**: CSS-in-JS for styling.
- **FontAwesome**: Icons for buttons and UI elements.
- **Web Vitals**: Performance monitoring.

## API Integration

The app uses an API endpoint (`https://note.henryk.co.za/api/translate`) to translate sentences. Ensure the API is accessible for the app to function correctly.

## Testing

The project uses Jest and React Testing Library for testing. To run tests:

```bash
npm test
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- [Create React App](https://create-react-app.dev/) for the project setup.
- [FontAwesome](https://fontawesome.com/) for icons.
- [Styled Components](https://styled-components.com/) for styling.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## Contact

For any questions or feedback, please contact [Henryk91](https://github.com/Henryk91).
