
/* IMPORT */

import * as _ from 'lodash';
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

  getExtension ( extension = 'projects' ) {

    const config = vscode.workspace.getConfiguration ().get ( extension );

    if ( !config['configPath'] ) delete config['configPath'];

    return config;

  },

  async getFile ( filepath ) {

    const file = await Utils.file.read ( filepath );

    if ( !file ) return;

    const config = _.attempt ( JSON.parse, file );

    if ( _.isError ( config ) ) return;

    return config;

  },

  async get () {

    const defaults = Config.getDefaults (),
          extension: any = Config.getExtension (),
          configPath: string = extension.configPath || defaults.configPath,
          config = configPath && await Config.getFile ( configPath );

    return _.merge ( {}, defaults, extension, config );

  },

  async write ( filepath, config ) {

    const newConfig = _.omit ( config, ['configPath'] );

    return Utils.file.write ( filepath, JSON.stringify ( newConfig, undefined, 2 ) );

  }

};

/* EXPORT */

export default Config;
