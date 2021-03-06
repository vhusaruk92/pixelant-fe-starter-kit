var generators = require('yeoman-generator');
var chalk = require('chalk');
var updateNotifier = require('update-notifier');
var ast = require('ast-query');
const boxen = require('boxen');

// Colors
var warning = chalk.bold.red;
var success = chalk.bold.green;
var yellow = chalk.bold.yellow;
// var blue = chalk.blue;
var gray = chalk.dim.gray;
var magenta = chalk.bold.magenta;
var inverse = chalk.inverse;

module.exports = generators.Base.extend({
    initializing: function() {
        if (process.argv.indexOf('--no-check-updates') === -1) {
            var done = this.async();
            const pkg = require('../package.json');
            const notifier = updateNotifier({
                pkg,
                updateCheckInterval: 0,
                callback: function(err, update) {
                    if (err) {
                        var networkError = boxen(warning('Network error!') + '\n' + 'Might be problems with internet connection or npm remote repo' + '\nRun ' + success('yo fe-kit --no-check-updates') + ' to skip update checking' + '\n' + 'Only if you are sure that you already have latest version.', {
                            padding: { top: 0, right: 2, bottom: 0, left: 2 },
                            margin:{ top: 0, right: 0, bottom: 1, left: 0 },
                            borderColor: 'red',
                            borderStyle: 'round'
                        });
                        console.log(networkError);
                        console.log(err);
                    } else {
                        var generatorNameMessage = boxen(gray('Pixelant Front-End Starter Kit (' + notifier.packageName + ')'), {
                            padding: { top: 0, right: 2, bottom: 0, left: 2 },
                            margin:{ top: 0, right: 0, bottom: 0, left: 0 },
                            borderColor: 'black',
                            borderStyle: 'round'
                        });
                        var noUpdatesMessage = boxen('You are using actual version of generator' + '\n' + success('Feel free to install and use any type of project'), {
                            padding: { top: 0, right: 2, bottom: 0, left: 2 },
                            margin:{ top: 0, right: 0, bottom: 1, left: 0 },
                            borderColor: 'green',
                            borderStyle: 'round'
                        });
                        if (update.latest !== update.current) {
                            var needToUpdateMessage = boxen(warning('Need to update before continuing!') + '\n' + 'Update available ' + gray(update.current) + ' → ' + magenta(update.latest) + ' \nRun ' + success('npm i -g ' + notifier.packageName) + ' to update', {
                                padding: { top: 0, right: 2, bottom: 0, left: 2 },
                                margin:{ top: 0, right: 0, bottom: 1, left: 0 },
                                borderColor: 'red',
                                borderStyle: 'round'
                            });
                            console.log(generatorNameMessage);
                            console.log(needToUpdateMessage);
                        } else {
                            console.log(generatorNameMessage);
                            console.log(noUpdatesMessage);
                        }
                        done();
                    }
                }
            });
        }
    },

    prompting: {
        projectType: function() {
            var done = this.async();
            var that = this;
            var prompts = [
                {
                    type: 'list',
                    name: 'projectType',
                    message: 'Project type:',
                    choices: [
                        {
                            name: gray('Static site'),
                            value: 'site'
                        },
                        {
                            name: gray('Front-End workflow (experimental)'),
                            value: 'fe'
                        },
                        {
                            name: 'felayout_t3kit',
                            value: 'felayout_t3kit'
                        },
                        {
                            name: 'felayout_bluemountain',
                            value: 'felayout_bluemountain'
                        }
                    ],
                },
                {
                    message: 'Is it right type of project?',
                    name: 'confirmed',
                    type: 'confirm',
                    default: true
                }
            ];
            var promptRecursive = function() {
                that.prompt(prompts, function(answers) {
                    if (answers.projectType === 'site' || answers.projectType === 'fe') {
                        that.log(answers.projectType + warning(' under construction. Choose another type'));
                        promptRecursive();
                    } else {
                        if (!answers.confirmed) {
                            promptRecursive();
                        } else {
                            that.projectType = answers.projectType;
                            done();
                        }
                    }
                });
            };
            promptRecursive();
        },

        prompts: function() {
            var done = this.async();
            var that = this;
            var prompts = [];
            //  ============================================
            //  General prompts ============================
            //  ============================================
            var projectName = {
                type: 'input',
                name: 'projectName',
                message: 'Project Name',
                default: this.appname
            };
            var git = {
                message: 'Do you want automatically initialize' + yellow(' git ') + 'repo\nand push it to the server?',
                name: 'autoGit',
                type: 'confirm',
                default: true,
                when: function(answer) {
                    return answer.sshLink !== 'skip' && answer.remoteType !== 'skip';
                }
            };
            var confirm = {
                message: 'Looks good?',
                name: 'confirmed',
                type: 'confirm',
                default: true
            };
            var repo = {
                type: 'input',
                name: 'repo',
                message: 'Need to create new repository on remote server',
                default: 'Done',
                validate: function(answer) {
                    if (answer === 'y' || answer === 'Y' || answer === 'yes' || answer === 'Yes' || answer === 'Done' || answer === 'done') {
                        return true;
                    }
                    return warning('You must create repo before continuing');
                },
                when: function(answer) {
                    return answer.remoteType !== 'skip';
                }
            };
            var remote = {
                type: 'list',
                name: 'remoteType',
                message: 'Remote repo server:',
                choices: [
                    {
                        name: 'Bitbucket',
                        value: 'bitbucket'
                    },
                    {
                        name: 'Github',
                        value: 'github'
                    },
                    {
                        name: 'Skip',
                        value: 'skip'
                    },
                ],
            };
            // var hook = {
            //     type: 'input',
            //     name: 'hook',
            //     message: 'Need to add ' + yellow('POST Hook') + ' to your project on Bitbucket\n' + blue('http://54.216.37.235/bitbucketpost.php'),
            //     default: 'Done',
            //     validate: function(answer) {
            //         if (answer === 'y' || answer === 'Y' || answer === 'yes' || answer === 'Yes' || answer === 'Done' || answer === 'done') {
            //             return true;
            //         }
            //         return warning('You must add POST Hook before continuing');
            //     }
            // };
            var bitbucketsshLink = {
                type: 'input',
                name: 'sshLink',
                message: 'SSH link of your new remote repository \n' + inverse('skip') + ' to skip this step',
                validate: function(answer) {
                    if (answer.length > 25 && answer.slice(0, 17) === 'git@bitbucket.org' && answer.slice(-4) === '.git' || answer === 'skip') {
                        return true;
                    }
                    return warning('Wrong repository link, try again...');
                },
                when: function(answer) {
                    return answer.remoteType === 'bitbucket';
                }
            };
            var githubsshLink = {
                type: 'input',
                name: 'sshLink',
                message: 'SSH link to your new remote repository\n' + inverse('skip') + ' to skip this step',
                validate: function(answer) {
                    if (answer.length > 22 && answer.slice(0, 14) === 'git@github.com' && answer.slice(-4) === '.git' || answer === 'skip') {
                        return true;
                    }
                    return warning('Wrong repository link, try again...');
                },
                when: function(answer) {
                    return answer.remoteType === 'github';
                }
            };

            var installDependencies = {
                message: 'Install npm/bower dependencies?',
                name: 'npmBower',
                type: 'confirm',
                default: true
            };

            //  ============================================
            //  felayout_t3kit =============================
            //  ============================================
            if (this.projectType === 'felayout_t3kit') {
                prompts.push(projectName);
                prompts.push(remote);
                prompts.push(repo);
                prompts.push(bitbucketsshLink);
                prompts.push(githubsshLink);
                prompts.push(git);
                prompts.push(installDependencies);
                prompts.push(confirm);
            }
            //  ********************************************
            //  --------------------------------------------

            //  ============================================
            //  felayout_bluemountain =============================
            //  ============================================
            if (this.projectType === 'felayout_bluemountain') {
                prompts.push(projectName);
                prompts.push(remote);
                prompts.push(repo);
                prompts.push(bitbucketsshLink);
                prompts.push(githubsshLink);
                prompts.push(git);
                prompts.push(installDependencies);
                prompts.push(confirm);
            }
            //  ********************************************
            //  --------------------------------------------

            //  ============================================
            //  prompt recursive  func =====================
            //  ============================================
            var promptRecursive = function() {
                that.prompt(prompts, function(answers) {
                    if (!answers.confirmed) {
                        promptRecursive();
                    } else {
                        var prop;
                        for (prop in answers) {
                            that[prop] = answers[prop];
                        }
                        done();
                    }
                });
            };
            promptRecursive();
        },
    },

    configuring: {
        parsePackageJson: function() {
            this.packageJson = this.fs.readJSON(this.templatePath() + '/' + this.projectType + '/package.json');
            this.packageJsonVersion = this.packageJson.version;
            this.packageJson.name = this.projectName;
            this.packageJson.version = '0.0.1';
            this.packageJson.description = 'Front-End layout for ' + this.projectName + ' project';
        },
        parseBowerJson: function() {
            this.bowerJson = this.fs.readJSON(this.templatePath() + '/' + this.projectType + '/bower.json');
            this.bowerJson.name = this.projectName;
        },
        parseGruntfile: function() {
            this.readGruntfile = this.fs.read(this.templatePath() + '/' + this.projectType + '/Gruntfile.js');
            this.gruntfileTree = ast(this.readGruntfile);
            if (this.remoteType === 'github') {
                this.gruntfileTree.var('remoteBranch').value('\'gh-pages\'');
            } else {
                this.gruntfileTree.var('remoteBranch').value('\'site\'');
            }
            this.gruntfileTree.var('remoteRepo').value('\'' + this.sshLink + '\'');
        },

    },

    // default: {
    // },

    writing: function() {
        this.fs.copy([
            this.templatePath() + '/' + this.projectType + '/**',
            this.templatePath() + '/' + this.projectType + '/**/.*',
            '!**/{Gruntfile.js, bower.json,package.json,.git,.npmignore,.gitignore,wct.conf.js,docs,test,README.md, LICENSE,CHANGELOG.md,CONTRIBUTING.md,.travis.yml}/**'],
            this.destinationPath()
        );
        this.fs.writeJSON(this.destinationPath('package.json'), this.packageJson);
        this.fs.writeJSON(this.destinationPath('bower.json'), this.bowerJson);
        this.fs.write(this.destinationPath('Gruntfile.js'), this.gruntfileTree.toString());
        this.fs.copyTpl(
            this.templatePath('README.md'),
            this.destinationPath('README.md'),
            { projectName: this.projectName,  projectType: this.projectType,  packageVersion: this.packageJsonVersion }
        );

        // Handle bug where npm has renamed .gitignore to .npmignore
        // https://github.com/npm/npm/issues/3763
        if (this.fs.exists(this.templatePath() + '/' + this.projectType + '/.npmignore')) {
            this.fs.copy(
                this.templatePath() + '/' + this.projectType + '/.npmignore',
                this.destinationPath('.gitignore')
            );
        } else {
            this.fs.copy(
                this.templatePath() + '/' + this.projectType + '/.gitignore',
                this.destinationPath('.gitignore')
            );
        }

        // if (this.projectType === 'felayout_t3kit') {
        //     this.fs.writeJSON( this.destinationPath('package.json'), this.packageJson);
        // }
    },
    install: {
        installDependencies: function() {
            if (this.npmBower) {
                this.npmInstall();
                this.bowerInstall();
            }
        },
        gitInit: function() {
            var that = this;
            if (this.autoGit && this.sshLink !== 'skip') {
                this.spawnCommand('git', ['init', '-q']).on('close', function() {
                    that.spawnCommand('git', ['add', '--all']).on('close', function() {
                        that.spawnCommand('git', ['commit', '-m', '"[INITIAL COMMIT]"', '-q']).on('close', function() {
                            that.spawnCommand('git', ['remote', 'add', 'origin', that.sshLink]).on('close', function() {
                                that.spawnCommand('git', ['push', '-u', '-q', 'origin', 'master']);
                            });
                        });
                    });
                });
            }
        },
    },
    end: {
        endLog: function() {
            if (!this.npmBower) {
                this.log(warning('\nYou need to install npm/bower dependencies manually\n') +
                    inverse('npm install\n' + 'bower install\n')
                );
            }
            if (!this.autoGit) {
                this.log(warning('\nYou need to initialize new git repo\nand push it to remote server manually\n') +
                    inverse('git init\n' +
                        'git add .\n' +
                        'git commit -m \'[INITIAL COMMIT]\'\n' +
                        'git remote add origin <<repo-link>>' + '\n' +
                        'git push -u origin master\n'
                        )
                    );
            }
            this.log(success('\nYou are all set now. ') + magenta('Happy coding!'));
        }
    }
});
