# POM Creator

POM Creator helps you quickly create Page Object Model (POM) files for Playwright tests in a Dynamics 365 project structure.

## Features

- Create new POM files from a template
- Choose the folder to save the new POM file
- Automatically update PageObjectManager.js with the new POM reference

## How to Use

1. Open the command palette (Ctrl+Shift+P or Cmd+Shift+P)
2. Type "Create Playwright Page Object POM" and select it
3. Enter a name for your new POM file
4. Choose the folder where you want to save the file
5. The extension will create the file and open it in the editor
6. PageObjectManager.js will be updated automatically

## Requirements

- Your project should have a `pages/D365` folder structure
- A `pom.template.js` file in the `pages/D365` folder 
- The `PageObjectManager` file should be in the `pages` folder


