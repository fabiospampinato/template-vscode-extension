
/* IMPORT */

import vscode from 'vscode';
import * as Commands from './commands';

/* MAIN */

const activate = (): void => {

  vscode.commands.registerCommand ( '{{settingsName}}.command', Commands.command );

};

/* EXPORT */

export {activate};
