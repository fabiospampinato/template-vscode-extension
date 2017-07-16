
/* IMPORT */

import * as vscode from 'vscode';
import Config from './config';
import Utils from './utils';

/* COMMANDS */

function command () {

  vscode.window.showInformationMessage ( 'Hello World!' );

}

/* EXPORT */

export {command};
