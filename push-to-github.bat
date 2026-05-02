@echo off
echo Pushing Team Task Manager to GitHub Repository...
echo Repository: https://github.com/KodaliSuchitraKamala/Team_Task_Manager
echo.

echo Step 1: Initializing Git repository...
git init
if %errorlevel% neq 0 (
    echo Git initialization failed. Please make sure Git is installed.
    pause
    exit /b 1
)

echo.
echo Step 2: Adding remote repository...
git remote add origin https://github.com/KodaliSuchitraKamala/Team_Task_Manager.git

echo.
echo Step 3: Adding all files to staging...
git add .

echo.
echo Step 4: Creating initial commit...
git commit -m "Initial commit: Team Task Manager full-stack application with React frontend and Node.js mock backend"

echo.
echo Step 5: Setting main branch and pushing to GitHub...
git branch -M main
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo SUCCESS! Your code has been pushed to GitHub.
    echo Repository URL: https://github.com/KodaliSuchitraKamala/Team_Task_Manager
) else (
    echo.
    echo Push failed. Please check your GitHub credentials and repository access.
    echo You may need to:
    echo 1. Create a GitHub Personal Access Token
    echo 2. Use: git push -u origin main
    echo 3. Authenticate with GitHub when prompted
)

echo.
pause
