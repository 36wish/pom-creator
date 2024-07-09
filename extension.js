const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
	let disposable = vscode.commands.registerCommand('extension.createPlaywrightPage', async () => {
		// Ask for file name
		const fileName = await vscode.window.showInputBox({
			prompt: 'Enter the name for your new page object file'
		});
		if (!fileName) return;

		// Get workspace folders
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) {
			vscode.window.showErrorMessage('No workspace folder open');
			return;
		}

		// Read directories in the D365 folder
		const rootPath = workspaceFolders[0].uri.fsPath;
		const d365Path = path.join(rootPath, 'pages', 'D365');
		const directories = fs.readdirSync(d365Path, { withFileTypes: true })
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);

		// Ask user to choose a folder
		const selectedFolder = await vscode.window.showQuickPick(directories, {
			placeHolder: 'Select a folder for the new file'
		});
		if (!selectedFolder) return;

		// Read template file
		const templatePath = path.join(rootPath, 'pages', 'D365', 'pom.template.js');
		let template;
		try {
			template = fs.readFileSync(templatePath, 'utf8');

			// Replace class name and module.exports
			template = template.replace(/class\s+\w+/g, `class ${fileName}`);
			template = template.replace(/module\.exports\s*=\s*{\s*\w+\s*}/g, `module.exports = { ${fileName} }`);
		} catch (error) {
			template = `
class ${fileName} {
    constructor(page, env) {
        this.page = page;
        this.env = env;
    }

    // Add your page object methods here
}

module.exports = { ${fileName} };
            `;
		}

		// Create new file with template
		const filePath = path.join(d365Path, selectedFolder, `${fileName}.js`);
		fs.writeFileSync(filePath, template);

		// Open the new file in editor
		const document = await vscode.workspace.openTextDocument(filePath);
		await vscode.window.showTextDocument(document);

		// Update PageObjectManager.js
		// Update PageObjectManager.js
		const pomPath = path.join(rootPath, 'pages', 'PageObjectManager.js');
		if (fs.existsSync(pomPath)) {
			let pomContent = fs.readFileSync(pomPath, 'utf8');

			// Add import statement
			const importStatement = `const { ${fileName} } = require("./D365/${selectedFolder}/${fileName}");\n`;
			pomContent = pomContent.replace(
				/(const { PendingInvoices } = require\('\.\/D365\/SalesAndMarketing\/PendingInvoices'\);)/,
				`${importStatement}$1`
			);

			// Add to constructor
			const constructorLine = `this.${fileName} = new ${fileName}(this.page, this.env);`;
			pomContent = pomContent.replace(
				/(this\.PendingInvoices = new PendingInvoices\(this\.page, this\.env\);)/,
				`${constructorLine}\n    $1`
			);

			// Add getter method
			const getterMethod = `get${fileName}() { return this.${fileName}; }`;
			pomContent = pomContent.replace(
				/(getPendingInvoices\(\) { return this\.PendingInvoices; })/,
				`${getterMethod}\n  $1`
			);

			fs.writeFileSync(pomPath, pomContent);
			vscode.window.showInformationMessage('PageObjectManager.js updated successfully');
		} else {
			vscode.window.showWarningMessage('PageObjectManager.js not found. Please add the reference manually.');
		}
	});

	context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
};