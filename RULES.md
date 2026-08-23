# Application Execution Rules

- **Node.js Environment Path**: The application must be run using the Node.js executable located at `C:\Users\mbare-chm\Documents\pelaiah\node-v25.2.1-win-x64`.

To run the application manually in Powershell, prepend the Node.js directory to your PATH:
```powershell
$env:PATH = "C:\Users\mbare-chm\Documents\pelaiah\node-v25.2.1-win-x64;" + $env:PATH
npm run dev
```
- **Git Execution Path**: Whenever you need to use Git, ALWAYS use the absolute path to the executable: `"C:\Users\mbare-chm\AppData\Local\Programs\Git\bin\git.exe"`
