
/* IMPORT */

import * as _ from 'lodash';
import * as absolute from 'absolute';
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

  isInsiders () {

    return !!vscode.env.appName.match ( /insiders/i );

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

    },

    getParentPath ( basePath? ) {

      return basePath && absolute ( basePath ) && path.dirname ( basePath );

    },

    getRootPath ( basePath? ) {

      const {workspaceFolders} = vscode.workspace;

      if ( !workspaceFolders ) return;

      const firstRootPath = workspaceFolders[0].uri.path;

      if ( !basePath || !absolute ( basePath ) ) return firstRootPath;

      const rootPaths = workspaceFolders.map ( folder => folder.uri.path ),
            sortedRootPaths = _.sortBy ( rootPaths, [path => path.length] ).reverse (); // In order to get the closest root

      return sortedRootPaths.find ( rootPath => basePath.startsWith ( rootPath ) );

    },

    getWrapperPath ( basePath, root? ) {

      const parentPath = () => Utils.folder.getParentPath ( basePath ),
            rootPath = () => Utils.folder.getRootPath ( basePath );

      return root ? rootPath () : parentPath () || rootPath ();

    }

  }

};

/* EXPORT */

export default Utils;
