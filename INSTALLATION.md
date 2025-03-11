# Installation Guide for Rural Hardware Store

This guide will help you set up the Rural Hardware Store application on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:

1. **Node.js** (v14 or higher) - [Download from nodejs.org](https://nodejs.org/)
2. **npm** (v6 or higher) - This comes with Node.js
3. **Git** - [Download from git-scm.com](https://git-scm.com/downloads)

## Installation Options

### Option 1: Automatic Setup (Recommended for macOS/Linux)

1. Open Terminal
2. Run the following commands:

```bash
# Navigate to your home directory
cd ~

# Download the setup script
curl -o setup.sh https://raw.githubusercontent.com/dineshgin/rural-hardware-store/main/setup.sh

# Make the script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

3. Once the setup is complete, navigate to the RetailApp directory:

```bash
cd /Users/dineshkumargopalakrishnan/RetailApp
```

4. Start the application:

```bash
npm start
```

### Option 2: Manual Setup

1. Open Terminal or Command Prompt
2. Create and navigate to the project directory:

```bash
mkdir -p /Users/dineshkumargopalakrishnan/RetailApp
cd /Users/dineshkumargopalakrishnan/RetailApp
```

3. Clone the repository:

```bash
git clone https://github.com/dineshgin/rural-hardware-store.git .
```

4. Install dependencies:

```bash
npm install
```

5. Start the application:

```bash
npm start
```

## Troubleshooting

If you encounter any issues during installation:

1. **Node.js version issues**: Make sure you have Node.js v14 or higher installed. Check with `node -v`
2. **Permission errors**: You might need to use `sudo` for some commands on macOS/Linux
3. **Dependency issues**: Try clearing npm cache with `npm cache clean --force` and then run `npm install` again
4. **Electron errors**: Make sure your system meets the requirements for running Electron apps

## Running in Development Mode

To run the application in development mode with hot reloading:

```bash
npm run dev
```

## Building for Production

To build the application for production:

```bash
npm run build
```

This will create distributable packages in the `dist` directory.

## Support

If you need help, please open an issue on the GitHub repository or contact the development team.