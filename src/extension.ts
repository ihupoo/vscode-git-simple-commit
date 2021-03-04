import * as vscode from 'vscode';
import { serialize } from './commit-message';
import { getGitAPI, getRepository, getCommitMessage } from './utils';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'extension.gitSimpleCommit',
    async () => {
		try{
			const git = getGitAPI();
			if (!git) {
			  throw new Error('未安装git插件');
			}
			const repository = await getRepository(git);
			const commitMessage = await getCommitMessage();
			const message = serialize(commitMessage);
			vscode.commands.executeCommand('workbench.view.scm');
        	repository.inputBox.value = message;
			const autoCommit = vscode.workspace.getConfiguration().get('gitSimpleCommit.autoCommit');
			if(autoCommit){
				await vscode.commands.executeCommand('git.commit', repository);
			}

		}catch(e){
			vscode.window.showErrorMessage(`git-simple-commit：${e.message}`);
		}
     
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
