#!/bin/bash

# TODO:
# - Use a variable for the port
# - Use a variable for the repository URL

print_status() {
    echo -e "\033[1;34m>>> $1\033[0m"
}

print_warning() {
    echo -e "\033[1;33m>>> $1\033[0m"
}

set -e
trap 'echo -e "\033[1;31mError: An error occurred during setup. Please check the error message above.\033[0m"' ERR

print_status "Setting up Ducky..."

print_status "Checking if git is installed..."
if ! command -v git &> /dev/null; then
    echo "Error: git is not installed. Please install git first."
    exit 1
fi
print_status "✓ Git is installed"

print_status "Checking for available package managers..."
PACKAGE_MANAGER=""
if command -v pnpm &> /dev/null; then
    print_status "✓ Found pnpm (recommended)"
    PACKAGE_MANAGER="pnpm"
elif command -v bun &> /dev/null; then
    print_status "✓ Found bun"
    PACKAGE_MANAGER="bun"
elif command -v yarn &> /dev/null; then
    print_status "✓ Found yarn"
    PACKAGE_MANAGER="yarn"
elif command -v npm &> /dev/null; then
    print_status "✓ Found npm"
    PACKAGE_MANAGER="npm"
else
    echo "Error: No supported package manager found, aborting. Please install one and re-run the script. The recommended package manager is pnpm."
    exit 1
fi

DUCKY_DIR="$HOME/ducky"
if [ -d "$DUCKY_DIR" ]; then
    print_warning "A Ducky directory already exists at $DUCKY_DIR"
    read -p "Would you like to delete it and continue? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Removing existing Ducky directory..."
        rm -rf "$DUCKY_DIR"
    else
        print_status "Setup aborted by user."
        exit 0
    fi
fi

print_status "Cloning Ducky repository to $DUCKY_DIR..."
git clone https://github.com/ShalevAri/ducky.git "$DUCKY_DIR"
cd "$DUCKY_DIR"

read -p "Would you like to run Ducky in the background? (y/N) " -n 1 -r
echo
RUN_IN_BACKGROUND=false
if [[ $REPLY =~ ^[Yy]$ ]]; then
    RUN_IN_BACKGROUND=true
    print_status "Ducky will run in the background"
fi

case $PACKAGE_MANAGER in
    "pnpm")
        print_status "Installing dependencies with pnpm..."
        pnpm install
        print_status "Starting development server with pnpm..."
        if [ "$RUN_IN_BACKGROUND" = true ]; then
            pnpm dev &
            print_status "Ducky is running in the background at http://localhost:49152"
        else
            pnpm dev
        fi
        ;;
    "bun")
        print_status "Installing dependencies with bun..."
        bun install
        print_status "Starting development server with bun..."
        if [ "$RUN_IN_BACKGROUND" = true ]; then
            bun dev &
            print_status "Ducky is running in the background at http://localhost:49152"
        else
            bun dev
        fi
        ;;
    "yarn")
        print_status "Installing dependencies with yarn..."
        yarn install
        print_status "Starting development server with yarn..."
        if [ "$RUN_IN_BACKGROUND" = true ]; then
            yarn dev &
            print_status "Ducky is running in the background at http://localhost:49152"
        else
            yarn dev
        fi
        ;;
    "npm")
        print_status "Installing dependencies with npm..."
        npm install
        print_status "Starting development server with npm..."
        if [ "$RUN_IN_BACKGROUND" = true ]; then
            npm run dev &
            print_status "Ducky is running in the background at http://localhost:49152"
        else
            npm run dev
        fi
        ;;
esac

if [ "$RUN_IN_BACKGROUND" = true ]; then
    print_status "To use Ducky, add 'http://localhost:49152?q=%s' as a custom search engine in your browser."
    print_status "To stop Ducky later, you can use: pkill -f 'vite'"
    print_status "If you want to stop Ducky, run 'lsof -i :49152' and then 'kill -9 <PID>'. Replace 49152 if you've set a custom port, and <PID> with the actual PID of the process."
fi