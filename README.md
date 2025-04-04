# Pixel Probe

Pixel Probe is a web application built with [Next.js](https://nextjs.org) that analyzes websites to detect Google Tag Manager (GTM) implementations and identify custom domain analytics requests. It uses Puppeteer and Chromium to inspect outgoing network requests and provides a user-friendly interface to display the results.

## Features

- Detects Google Tag Manager (GTM) implementations on websites.
- Identifies obfuscated or custom domain analytics requests.
- Displays results in a clean and interactive UI.
- Allows users to expand truncated URLs for detailed inspection.
- Works seamlessly in both local and production environments.

## Technologies Used

- **Next.js**: Framework for building the application.
- **Puppeteer & Puppeteer-Core**: For headless browser automation.
- **Chromium-Min**: Lightweight Chromium binary for serverless environments.
- **Tailwind CSS**: For styling the UI.
- **Framer Motion**: For animations.
- **Vercel**: For deployment.

---

## Getting Started

### Prerequisites

- **Node.js**: Ensure you have Node.js installed (v18 or later is recommended).
- **npm**: Comes with Node.js. Alternatively, you can use `yarn`, `pnpm`, or `bun`.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/pixel-probe.git
   cd pixel-probe
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```properties
   CHROMIUM_URL=https://pixel-probe.s3.us-east-1.amazonaws.com/chromium/chromium-v133.0.0-pack.tar
   NODE_ENV=development
   ```

   - Replace `CHROMIUM_URL` with the URL to your Chromium tarball if hosting your own binary.
   - Set `NODE_ENV` to `production` for production builds.

---

### Running the Development Server

To start the development server, run:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

---

### Building for Production

To build the application for production, run:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

---

### Deployment

The easiest way to deploy this application is to use [Vercel](https://vercel.com). Follow these steps:

1. Push your code to a GitHub repository.
2. Connect your repository to Vercel.
3. Set the environment variables (`CHROMIUM_URL` and `NODE_ENV`) in the Vercel dashboard.
4. Deploy the application.

---

## How It Works

1. **User Input**:
   - The user enters a website URL in the input field and clicks "Analyze Website."

2. **Server-Side Analysis**:
   - The server uses Puppeteer and Chromium to navigate to the provided URL.
   - Outgoing network requests are intercepted and analyzed to detect GTM-related requests and obfuscated analytics requests.

3. **Results Display**:
   - The results are displayed in the UI, showing:
     - Whether GTM was detected.
     - A list of GTM-related requests.
     - A list of obfuscated requests.
   - Long URLs are truncated with a "Show More" button to expand them.

---

## Project Structure

- **app**: Contains the main application logic.
  - **`/api/check-tracking`**: API route for analyzing websites.
  - **`/page.tsx`**: Main UI for the application.
- **`/components`**: Reusable UI components.
- **`/lib`**: Utility functions.
- **public**: Static assets.

---

## Example Usage

1. Enter a  URLwebsite (e.g., `https://example.com`) in the input field.
2. Click "Analyze Website."
3. View the results:
   - **GTM Requests**: Displays detected GTM-related requests.
   - **Obfuscated Requests**: Displays custom domain analytics requests.

---

## Troubleshooting

### Common Issues

1. **Chromium Binary Not Found**:
   - Ensure the `CHROMIUM_URL` in your .env file points to a valid tarball.
   - Verify that the tarball contains a valid Chromium binary.

2. **Timeout Errors**:
   - Increase the `maxDuration` in your Vercel configuration if using serverless functions.
   - Ensure the website being analyzed is accessible and not blocking requests.

3. **Local vs Production Differences**:
   - Use `puppeteer-core` with `chromium-min` in production and `puppeteer` locally for compatibility.

---

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
```

---

### Key Sections in the README
1. **Overview**: Explains what the project does and its purpose.
2. **Getting Started**: Provides clear instructions for installation and running the project locally.
3. **How It Works**: Describes the flow of the application.
4. **Troubleshooting**: Addresses common issues like binary compatibility and timeouts.
5. **Deployment**: Guides users on deploying the app to Vercel.

Let me know if you'd like to customize any part of this README further!---

### Key Sections in the README
1. **Overview**: Explains what the project does and its purpose.
2. **Getting Started**: Provides clear instructions for installation and running the project locally.
3. **How It Works**: Describes the flow of the application.
4. **Troubleshooting**: Addresses common issues like binary compatibility and timeouts.
5. **Deployment**: Guides users on deploying the app to Vercel.

Let me know if you'd like to customize any part of this README further!