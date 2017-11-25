
/* IMPORT */

import * as _ from 'lodash';
import * as JSON5 from 'json5';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import Utils from './utils';

/* CONFIG */

const Config = {

  getDefaults () {

    return {
      configPath: ''
    };

  },

  getExtension ( extension = '{{settingsName}}' ) {

    const config = vscode.workspace.getConfiguration ().get ( extension );

    if ( !config['configPath'] ) delete config['configPath'];

    return config;

  },

  async getFile ( filePath ) {

    const content = await Utils.file.read ( filePath );

    if ( !content || !content.trim () ) return;

    const config: any = _.attempt ( JSON5.parse, content );

    if ( _.isError ( config ) ) {

      const option = await vscode.window.showErrorMessage ( '[{{displayName}}] Your configuration file contains improperly formatted JSON', { title: 'Overwrite' }, { title: 'Edit' } );

      if ( option && option.title === 'Overwrite' ) {

        await Utils.file.write ( filePath, '{}' );

        return {};

      } else {

        if ( option && option.title === 'Edit' ) {

          Utils.file.open ( filePath );

        }

        throw new Error ( 'Can\'t read improperly formatted configuration file' );

      }

    }

    return config;

  },

  async get () {

    const defaults = Config.getDefaults (),
          extension: any = Config.getExtension (),
          configPath: string = extension.configPath || defaults.configPath,
          config = configPath && await Config.getFile ( configPath );

    return _.merge ( {}, defaults, extension, config );

  },

  async write ( filePath, config ) {

    const newConfig = _.omit ( config, ['configPath'] );

    return Utils.file.write ( filePath, JSON.stringify ( newConfig, undefined, 2 ) );

  }

};

/* EXPORT */

export default Config;
