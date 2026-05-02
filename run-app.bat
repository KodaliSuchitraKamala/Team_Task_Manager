@echo off
echo Checking for Java installation...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Java is not installed or not in PATH
    echo Please install Java 17 or higher and add it to your PATH
    echo You can download Java from: https://adoptium.net/
    pause
    exit /b 1
)

echo Java found! Now checking for Maven...
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Maven is not installed or not in PATH
    echo Installing Maven using winget...
    winget install Apache.Maven
    if %errorlevel% neq 0 (
        echo Failed to install Maven automatically
        echo Please install Maven manually:
        echo 1. Download Maven from: https://maven.apache.org/download.cgi
        echo 2. Extract to a directory (e.g., C:\Program Files\Apache\maven)
        echo 3. Add MAVEN_HOME environment variable pointing to Maven directory
        echo 4. Add %MAVEN_HOME%\bin to your PATH
        pause
        exit /b 1
    )
    echo Maven installed successfully!
    echo Please restart your command prompt and run this script again
    pause
    exit /b 0
)

echo Maven found! Starting the application...
mvn spring-boot:run
