
/* IMPORT */

import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as pify from 'pify';
import * as vscode from 'vscode';
import * as Commands from './commands';

/* UTILS */

const Utils = {

  initCommands ( context: vscode.ExtensionContext ) {

    const {commands} = vscode.extensions.getExtension ( '{{owner}}.{{name}}' ).packageJSON.contributes;

    commands.forEach ( ({ command, title }) => {

      const commandName = _.last ( command.split ( '.' ) ) as string,
            handler = Commands[commandName],
            disposable = vscode.commands.registerCommand ( command, () => handler () );

      context.subscriptions.push ( disposable );

    });

    return Commands;

  },

  file: {

    open ( filepath ) {

      return vscode.commands.executeCommand ( 'vscode.open', vscode.Uri.parse ( `file://${filepath}` ) );

    },

    async make ( filepath, content ) {

      await pify ( mkdirp )( path.dirname ( filepath ) );

      return Utils.file.write ( filepath, content );

    },

    async read ( filepath ) {

      try {
        return ( await pify ( fs.readFile )( filepath, { encoding: 'utf8' } ) ).toString ();
      } catch ( e ) {
        return;
      }

    },

    readSync ( filepath ) {

      try {
        return ( fs.readFileSync ( filepath, { encoding: 'utf8' } ) ).toString ();
      } catch ( e ) {
        return;
      }

    },

    async write ( filepath, content ) {

      return pify ( fs.writeFile )( filepath, content, {} );

    }

  },

  folder: {

    open ( folderpath, inNewWindow? ) {

      vscode.commands.executeCommand ( 'vscode.openFolder', vscode.Uri.parse ( `file://${folderpath}` ), inNewWindow );

    },

    exists ( folderpath ) {

      try {
        fs.accessSync ( folderpath );
        return true;
      } catch ( e ) {
        return false;
      }

    }

  }

};

/* EXPORT */

export default Utils;
