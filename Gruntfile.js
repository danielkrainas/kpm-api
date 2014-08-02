var fs = require('fs');

module.exports = function(grunt) {
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    fs.exists(__dirname + '/tasks', function(exists) {
        if(exists) {
            fs.readdirSync(__dirname + '/tasks').forEach(function(file) {
                require(__dirname + '/tasks/' + file)(grunt);
            });
        }
    });
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: ['pkg'],
                commit: true,
                commitMessage: 'release v%VERSION%',
                commitFiles: ['package.json'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version v%VERSION%',
                push: false
            }
        },
        
        jshint: {
            all: {
                src: ['index.js'],
                options: {
                    jshintrc: true,
					globalstrict: true,
					globals: {
						require: false,
						__dirname: false,
						exports: false
					}
                }
            }
        },
        
        mochaTest: {
            options: {
                reporter: 'spec'
            },
            src: ['test/mocha/*.js']
        }
    });

    grunt.option('force', true);

    grunt.registerTask('default', ['jshint', 'test']);

    grunt.registerTask('test', ['mochaTest']);
    
    grunt.registerTask('patch', ['bump:patch']);
};
