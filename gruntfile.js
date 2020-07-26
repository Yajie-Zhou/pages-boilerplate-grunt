const sass = require('sass')
const loadGruntTasks = require('load-grunt-tasks')
const browserSync = require('browser-sync')
const bs = browserSync.create()

const param = {
    env: 'dev',
    open: false,
    port: '2080',
    branch: 'gh-pages'
  }

const data = {
    menus: [
      {
        name: 'Home',
        icon: 'aperture',
        link: 'index.html'
      },
      {
        name: 'Features',
        link: 'features.html'
      },
      {
        name: 'About',
        link: 'about.html'
      },
      {
        name: 'Contact',
        link: '#',
        children: [
          {
            name: 'Twitter',
            link: 'https://twitter.com/w_zce'
          },
          {
            name: 'About',
            link: 'https://weibo.com/zceme'
          },
          {
            name: 'divider'
          },
          {
            name: 'About',
            link: 'https://github.com/zce'
          }
        ]
      }
    ],
    pkg: require('./package.json'),
    date: new Date()
}

module.exports = grunt => {
    grunt.initConfig({
        clean: {
            main: ['temp/**', 'dist/**']
        },
        sass: {
            options: {
                sourceMap: false,
                implementation: sass
            },
            main: {
                expand: true,
                cwd: 'src/',
                src: 'assets/styles/*.scss',
                dest: 'temp/',
                ext: '.css'
            }
        },
        babel: {
            options: {
                sourceMap: false,
                presets: ['@babel/preset-env']
            },
            main: {
                expand: true,
                cwd: 'src/',
                src: 'assets/scripts/*.js',
                dest: 'temp/'
            }
        },
        swig_precompile: {
            options: {
                active: '',
                locals: data,
                beautify: {
                    indent_size: 2
                },
                cache: false
            },
            main: {
                expand: true,
                cwd: 'src/',
                src: '*.html',
                dest: 'temp/'
            }
        },
        htmlmin: {
            main: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    minifyCSS: true
                },
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: '*.html',
                    dest: 'dist/'
                }]
            }
        },
        imagemin: {
            main: {
                options: {
                    optimizationLevel: 3 //定义 PNG 图片优化水平
                },
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['assets/images/**.{png,jpg,jpeg,gif,svg}', 'assets/fonts/**.{png,jpg,jpeg,gif,svg}'],
                    dest: 'dist/'
                }]
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: 'public',
                        src: '**',
                        dest: 'dist/'
                    },
                    {
                        expand: true,
                        cwd: 'src',
                        src: ['assets/fonts/**', '!assets/fonts/**.svg'],
                        dest: 'dist/'
                    },
                    {
                        expand: true,
                        cwd: 'temp',
                        src: '**',
                        dest: 'dist/'
                    }
                ]
            }
        },
        useref_yj: {
            html: 'dist/*.html',
            temp: 'dist'
        },
        sasslint: {
            main: {
              options: {
                configFile: 'config/.sass-lint.yml',
                rulePaths: ['config/rules/']
              },
              target: ['src/assets/styles/*.scss']
            }
        },
        eslint: {
            options: {
                configFile: 'config/eslint.json',
                rulePaths: ['config/rules']
            },
            target: ['src/assets/scripts/*.js']
        },

        ghDeploy: {
            options: {
                repository: 'https://github.com/Yajie-Zhou/pages-boilerplate-grunt.git',
                deployPath: 'dist',
                branch: grunt.option('branch') || 'gh-pages',
                message: 'Auto deplyment ' + grunt.template.today()
            }
        },
        watch: {
            js: {
                files: ['src/assets/scripts/*.js'],
                tasks: ['babel', 'serve_reload'] // 文件发生改变时，需要执行的任务
            },
            css: {
                files: ['src/assets/styles/*.scss'],
                tasks: ['sass', 'serve_reload']
            },
            html: {
                files: ['src/*.html'],
                tasks: ['swig_precompile', 'serve_reload']
            }
        }
    })

    loadGruntTasks(grunt) // 自动加载所有的 grunt插件中的任务

    grunt.registerTask('_sass', ['sass'])
    grunt.registerTask('_js', ['babel'])
    grunt.registerTask('_html', ['swig_precompile'])
    grunt.registerTask('_img', ['imagemin'])
    grunt.registerTask('_c', ['copy'])
    grunt.registerTask('_b', ['browserSync'])
    grunt.registerTask('_clean', ['clean'])
    grunt.registerTask('_co', ['concat'])
    grunt.registerTask('_sl', ['sasslint', 'eslint'])

    // console.log(grunt.option('port'))
    grunt.registerTask('_serve', function() {
        const done = this.async();

        // 初始化web服务器的配置
        bs.init({
            notify: false, 
            open: grunt.option('open') || param.open,
            port: grunt.option('port') || param.port, 
            server: { 
                baseDir: [param.env=='prod'?'dist':'temp', 'src', 'public'],  
                routes: {  
                    '/node_modules': 'node_modules'
                }
            }
        }, function (err, bs) {
            done();
        });
    })


    grunt.registerTask('serve_reload', function() {
        bs.reload()
    })

    grunt.registerTask('_u', ['copy', 'useref_yj', 'concat', 'uglify', 'cssmin', 'htmlmin'])


    grunt.registerTask('compile', ['sass', 'babel', 'swig_precompile'])
    grunt.registerTask('lint', ['sasslint', 'eslint'])
    grunt.registerTask('serve', ['compile', '_serve', 'watch'])
    grunt.registerTask('build', ['clean', 'compile', '_u'])
    grunt.registerTask('deploy', ['clean', 'compile', '_u', 'ghDeploy'])
}