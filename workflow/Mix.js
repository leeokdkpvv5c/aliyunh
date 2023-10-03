/**
 * Tencent is pleased to support the open source community by making QMUI Web available.
 * Copyright (C) 2019 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */


// 声明插件以及配置文件的依赖
const plugins = require('gulp-load-plugins')({
        rename: {
            'gulp-file-include': 'include',
            'gulp-merge-link': 'merge',
            'gulp-better-sass-inheritance': 'sassInheritance'
        }
    });
const packageInfo = require('../package.json');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const colors = require('ansi-colors');
const defaultsDeep = require('lodash/defaultsDeep');

let configDefault;
let configUser = {};

// 读取项目配置表
try {
    configDefault = require('../../qmui.config.js');
} catch (event) {
    log(colors.red('QMUI Config: ') + '找不到项目配置表，请按照 http://qmuiteam.com/web/index.html 的说明进行项目配置');
}

try {
    configUser = require('../../qmui.config.user.js');
} catch (event) {
    // 没有个人用户配置，无需额外处理
}

// 创建 common 对象
class Mix {
    constructor() {
        this.plugins = plugins;
        this.config = defaultsDeep(configUser, configDefault);
        this.packageInfo = packageInfo;
        this.browserSync = browserSync;
        this.reload = reload;

        this.timeFormat = new (require('./TimeFormat'))();
        this.util = new (require('./Util'))();

        this.tasks = {};
    }

    /**
     * 增加任务说明的接口。
     */
    addTaskDescription(name, description, options) {
        this.tasks[name] = {
            description: description,
            options: options
        };
    }

    /**
     * 获取所有任务。
     */
    getAllTask() {
        return this.tasks;
    }

    /**
     * 获取单个任务的信息。
     */
    getTask(name) {
        return this.tasks[name];
    }
}


module.exports = Mix;
