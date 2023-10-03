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


// Gulp 服务入口
const argv = require('yargs').argv;
const spawn = require('child_process').spawn;
const os = require('os');

module.exports = (gulp, mix) => {

    // 判断 browserSync 的值是否正确
    if (mix.config.browserSync.browserSyncMod !== 'server' && mix.config.browserSync.browserSyncMod !== 'proxy' && mix.config.browserSync.browserSyncMod !== 'close') {
        gulp.task('main', done => {
            mix.util.error('Config', `Config 中的 browserSyncMod 仅支持 ${mix.plugins.util.colors.yellow('server')}, ${mix.plugins.util.colors.yellow('proxy')}, ${mix.plugins.util.colors.yellow('close')} 三个值`);
            done();
        });
    } else {
        // 常规启动任务
        const mainTasks = ['include', 'sass', 'watch'];

        // 根据 broserSync 的类型加入对应的任务
        if (mix.config.browserSync.browserSyncMod === 'server' || mix.config.browserSync.browserSyncMod === 'proxy') {
            mainTasks.push(mix.config.browserSync.browserSyncMod);
        }

        // 加入用户自定义任务
        if (mix.config.customTasks) {
            Object.keys(mix.config.customTasks).forEach(customTaskName => {
                mainTasks.push(customTaskName);
            });
        }

        gulp.task('main', gulp.series(mainTasks));
    }

    const taskName = 'default';

    if (os.platform() === 'linux' || os.platform() === 'darwin') {

        gulp.task('start', done => {
            if (argv.debug) {
                mix.util.log('Debug: ', 'QMUI 进入 Debug 模式');
            }

            let mainTaskProcess; // 记录当前 gulp 运行时的进程

            const restart = () => {
                if (mainTaskProcess) {
                    mainTaskProcess.kill();
                }

                const mainTask = ['main'];
                if (typeof argv.color !== 'undefined' && !argv.color) {
                    mainTask.push('--no-color');
                }
                mainTaskProcess = spawn('gulp', mainTask, {stdio: 'inherit'});
            };

            gulp.watch('package.json').on('all', () => {
                mix.util.log('');
                mix.util.warn('Update', '检测到 QMUI Web 的 npm 包，为了避免出现错误，建议你停止目前的 gulp，请使用 npm install 命令更新后再启动 gulp');
                mix.util.beep(3);
            });

            gulp.watch(['gulpfile.js', 'workflow', 'workflow/**/*']).on('all', () => {
                mix.util.log('');
                if (argv.debug) {
                    mix.util.warn('Debug', '目前为 Debug 模式，检测到工作流源码有被更新，将自动重启 gulp');
                    mix.util.beep(3);
                    restart();
                } else {
                    mix.util.warn('Update', '检测到工作流源码有被更新，建议你停止目前的 gulp 任务，再重新启动 gulp，以载入最新的代码。如果 npm 包也需要更新，请先更新 npm 包再重启 gulp');
                    mix.util.beep(3);

                }
            });

            // 获取第一次进入时 gulp 的进程
            const mainTask = ['main'];
            if (argv.debug) {
                mainTask.push('--debug');
            }
            if (typeof argv.color !== 'undefined' && !argv.color) {
                mainTask.push('--no-color');
            }
            mainTaskProcess = spawn('gulp', mainTask, {stdio: 'inherit'});

            done();
        });

        // 默认任务
        gulp.task(taskName, gulp.parallel('start'));
    } else {
        gulp.task(taskName, gulp.parallel('main'));
    }

    // 任务说明
    mix.addTaskDescription(taskName, '默认任务，自动执行一次 include 和 sass 任务，并调用 watch 任务', {
        'debug': 'debug 模式下 gulpfile.js 有变动时会自动重启 default 任务'
    });
};
