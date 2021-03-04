import * as path from 'path';
import * as vscode from 'vscode';
import type { API, GitExtension } from './git';
import commitType from './commit-type';
import { CommitMessage } from './commit-message';

export function createQuickPick<T extends vscode.QuickPickItem>({
	placeholder,
	items = [],
}: Partial<vscode.QuickPick<T>>): Promise<T[]> {
	return new Promise(function (resolve) {
		const picker = vscode.window.createQuickPick();
		picker.placeholder = placeholder;
		picker.matchOnDescription = true;
		picker.matchOnDetail = true;
		picker.ignoreFocusOut = true;
		picker.items = items;
		picker.show();
		picker.onDidAccept(function () {
			if (picker.selectedItems.length) {
				const result = picker.selectedItems as T[];
				picker.dispose();
				resolve(result);
			}
		});
	});
}

async function createSimpleQuickPick({
	placeholder,
	items = [],
  }: Partial<vscode.QuickPick<vscode.QuickPickItem>>): Promise<string> {
	const selectedItems = await createQuickPick({
	  placeholder,
	  items,
	});
	return selectedItems[0].label;
  }

export function createInputBox({
	placeholder,
	step,
	totalSteps,
  }: Partial<vscode.InputBox>): Promise<string> {
	return new Promise(function (resolve, reject) {
	  const input = vscode.window.createInputBox();
	  input.step = step;
	  input.totalSteps = totalSteps;
	  input.ignoreFocusOut = true;
	  input.placeholder = placeholder;
	  input.onDidAccept(function () {
			const result = input.value;
		  	input.dispose();
		  	resolve(result);
	  });
	  input.prompt = placeholder;
	  input.show();
	});
  }

export const getGitAPI = (): API | undefined => {
	const vscodeGit = vscode.extensions.getExtension<GitExtension>('vscode.git');
	const gitExtension = vscodeGit && vscodeGit.exports;
	return gitExtension?.getAPI(1);
};

export const getRepository = async (git: API) => {
	const curGitRepo = git.repositories.find(repo => repo.ui.selected);
	if (curGitRepo) {
		return curGitRepo;
	}
	if (git.repositories.length === 0) {
		throw new Error('请确认git仓库是否创建');
	}
	if (git.repositories.length === 1) {
		return git.repositories[0];
	}
	const items = git.repositories.map((repo, index) => {
		const folder = vscode.workspace.workspaceFolders?.find((f) => f.uri.fsPath === repo.rootUri.fsPath);
		return {
			index,
			label: folder?.name || path.basename(repo.rootUri.fsPath),
			description: `${repo.state.HEAD?.name || repo.state.HEAD?.commit?.slice(0, 8) || ''}${repo.state.workingTreeChanges.length ||
				repo.state.mergeChanges.length ||
				repo.state.indexChanges.length}`
		};
	});

	const [{ index }] = await createQuickPick({ items, placeholder: '请选择一个仓库' });

	return git.repositories[index];
};


export const getCommitMessage = async () => {
	const questions = [
		{
			type: createSimpleQuickPick,
			name: 'type',
			placeholder: '请选择类型',
			items: commitType
		},
		{
			type: createInputBox,
			name: 'subject',
			placeholder: '请填写描述',
		}
	];

	let commitMessage = new CommitMessage();

	for (const question of questions) {
		commitMessage[question.name as keyof CommitMessage] = await question.type(question);
	}

	return commitMessage;

};
