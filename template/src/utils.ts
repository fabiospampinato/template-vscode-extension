
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

    open ( filePath, isTextDocument = true ) {

      filePath = path.normalize ( filePath );

      const fileuri = vscode.Uri.file ( filePath );

      if ( isTextDocument ) {

        return vscode.workspace.openTextDocument ( fileuri )
                                .then ( vscode.window.showTextDocument );

      } else {

        return vscode.commands.executeCommand ( 'vscode.open', fileuri );

      }

    },

    async make ( filePath, content ) {

      await pify ( mkdirp )( path.dirname ( filePath ) );

      return Utils.file.write ( filePath, content );

    },

    async read ( filePath ) {

      try {
        return ( await pify ( fs.readFile )( filePath, { encoding: 'utf8' } ) ).toString ();
      } catch ( e ) {
        return;
      }

    },

    readSync ( filePath ) {

      try {
        return ( fs.readFileSync ( filePath, { encoding: 'utf8' } ) ).toString ();
      } catch ( e ) {
        return;
      }

    },

    async write ( filePath, content ) {

      return pify ( fs.writeFile )( filePath, content, {} );

    },

    async delete ( filePath ) {

      return pify ( fs.unlink )( filePath );

    },

    deleteSync ( filePath ) {

      return fs.unlinkSync ( filePath );

    }

  },

  folder: {

    open ( folderPath, inNewWindow? ) {

      vscode.commands.executeCommand ( 'vscode.openFolder', vscode.Uri.parse ( `file://${folderPath}` ), inNewWindow );

    },

    exists ( folderPath ) {

      try {
        fs.accessSync ( folderPath );
        return true;
      } catch ( e ) {
        return false;
      }

    },

    getParentPath ( basePath? ) {

      return basePath && absolute ( basePath ) && path.dirname ( basePath );

    },

    getAllRootPaths () {

      const {workspaceFolders} = vscode.workspace;

      if ( !workspaceFolders ) return [];

      return workspaceFolders.map ( folder => folder.uri.fsPath );

    },

    getRootPath ( basePath? ) {

      const {workspaceFolders} = vscode.workspace;

      if ( !workspaceFolders ) return;

      const firstRootPath = workspaceFolders[0].uri.fsPath;

      if ( !basePath || !absolute ( basePath ) ) return firstRootPath;

      const rootPaths = workspaceFolders.map ( folder => folder.uri.fsPath ),
            sortedRootPaths = _.sortBy ( rootPaths, [path => path.length] ).reverse (); // In order to get the closest root

      return sortedRootPaths.find ( rootPath => basePath.startsWith ( rootPath ) );

    },

    getActiveRootPath () {

      const {activeTextEditor} = vscode.window,
            editorPath = activeTextEditor && activeTextEditor.document.uri.fsPath;

      return Utils.folder.getRootPath ( editorPath );

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
