[TOC]
# Grunt 自动化构建说明文档

###  1.熟悉项目结构，确认自动化需求
	
	└── pages-boilerplate ································· project root
	   ├─ public ········································· static folder
	   │  └─ favicon.ico ································· static file 
	   ├─ src ············································ source folder
	   │  ├─ assets ······································ assets folder
	   │  │  ├─ fonts ···································· fonts folder
	   │  │  │  └─ pages.ttf ····························· font file (imagemin)
	   │  │  ├─ images ··································· images folder
	   │  │  │  └─ logo.png、brands.svg ······························ image file
	   │  │  ├─ scripts ·································· scripts folder
	   │  │  │  └─ main.js ······························· script file (babel / uglify)
	   │  │  └─ styles ··································· styles folder
	   │  │     ├─ _variables.scss ······················· partial sass file (dont output)
	   │  │     └─ main.scss ····························· entry scss file (scss / postcss)
	   │  ├─ layouts ····································· layouts folder
	   │  │  └─ basic.html ······························· layout file (dont output)
	   │  ├─ partials ···································· partials folder
	   │  │  └─ header.html ······························ partial file (dont output)
	   │  ├─ about.html ·································· page file (use layout & partials)
	   │  └─ index.html ·································· page file (use layout & partials)
	   ├─ .csscomb.json ·································· csscomb config file
	   ├─ .editorconfig ·································· editor config file
	   ├─ .gitignore ····································· git ignore file
	   ├─ .travis.yml ···································· travis ci config file
	   ├─ CHANGELOG.md ··································· repo changelog
	   ├─ LICENSE ········································ repo license
	   ├─ README.md ······································ repo readme
	   ├─ gulpfile.js ···································· gulp tasks file
	   ├─ package.json ··································· package file
	   └─ yarn.lock ······································ yarn lock file
	
- html 文件：使用了swig模版，使用插件 `gulp-swig` 进行编译、`gulp-htmlmin` 进行压缩;
- sass 文件：使用 `grunt-sass` 进行编译，`gulp-clean-css` 进行压缩；
- js 文件：使用 `babel` 进行es6+ 编译、`gulp-uglify` 进行压缩；
- image 文件：使用 `gulp-imagemin` 进行压缩；
- font：可能会有svg文件，也需要使用 `gulp-imagemin`  进行压缩，其余文件直接拷贝到输出目录即可；
- 开发服务器：使用 `browser-sync`，项目的自动编译、自动刷新浏览器页面；


### 2.使用 load-grunt-tasks 自动加载所有的 grunt插件中的任务
- 插件安装：	`yarn add load-grunt-tasks --dev`
- gruntfile.js

	```
	const loadGruntTasks = require('load-grunt-tasks')
	module.exports = grunt => {
		loadGruntTasks(grunt) // 自动加载所有的 grunt插件中的任务
	}
	```
	
### 3.样式编译
- 插件安装： `yarn add grunt-sass sass --dev`
- gruntfile.js

	```
	module.exports = grunt => {
		grunt.initConfig({
			sass: {
		            options: {
		                sourceMap: true,
		                implementation: sass
		            },
		            main: {
		                expand: true,
		                cwd: 'src/',
		                src: 'assets/styles/*.scss',
		                dest: 'dist/'
		            }
		        }
		})
		
		grunt.registerTask('_sass', ['sass']) // 测试样式编译
	}
	```
	
### 4.脚本编译
- 插件安装： `yarn add grunt-babel @babel/core @babel/preset-env --dev`
- gruntfile.js

	```
	module.exports = grunt => {
		grunt.initConfig({
			babel: {
		            options: {
		                sourceMap: true,
		                presets: ['@babel/preset-env']
		            },
		            main: {
		                expand: true,
		                cwd: 'src/',
		                src: 'assets/scripts/*.js',
		                dest: 'dist/'
		            }
		        }
		})
		
		grunt.registerTask('_js', ['babel']) // 测试脚本编译
	}
	```

### 5.页面模版编译
- 插件安装： `yarn add grunt-swig-precompile --dev`
- gruntfile.js

	```
	module.exports = grunt => {
		grunt.initConfig({
			swig_precompile: {
		            options: {
		                active: '',
		                locals: data,
		                beautify: {
		                    indent_size: 2
		                },
		                cache: false
		            },
		            build: {
		                expand: true,
		                cwd: 'src/',
		                src: '*.html',
		                dest: 'dist/'
		            }
		        }
		})
		
		grunt.registerTask('_html', ['swig_precompile']) // 测试页面模版编译
	}
	```	
	
### 6.图片和文字文件转换、其他文件 
- 插件安装： `yarn add grunt-contrib-imagemin --dev`
- gruntfile.js

	```
	module.exports = grunt => {
		grunt.initConfig({
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
		                    }
		                ]
		            }
		        }
		})
		
		grunt.registerTask('_img', ['imagemin']) // 测试图片压缩
		grunt.registerTask('_c', ['copy']). // 测试文字文件、其他文件转换
	}
	```

### 7.开发服务器的基本配置
- 插件安装： `yarn add browser-sync --dev`
- gruntfile.js
	
	```
	const browserSync = require('browser-sync')
	const bs = browserSync.create()
	module.exports = grunt => {
		grunt.registerTask('_serve', function() {
	        const done = this.async();
	
	        // 初始化web服务器的配置
	        bs.init({
	            notify: false, 
	            port: '2080',
	            // open: false, // 取消自动打开浏览器
	            server: { 
	                baseDir: ['temp', 'src', 'public'],  
	                routes: {  
	                    '/node_modules': 'node_modules'
	                }
	            }
	        })
	    })
	}
	```
	
### 8.文件清除	
- 插件安装： `yarn add grunt-contrib-clean --dev`
- gruntfile.js

	```
	module.exports = grunt => {
		grunt.initConfig({
			clean: {
		            main: ['temp/**', 'dist/**']
		        }
		})
		
		grunt.registerTask('_clean', ['clean']) // 测试文件清除
	}
	```
	
### 9.html构建注释的处理及各类型文件的压缩
- 插件安装： `yarn add grunt-useref-zyj --dev`
- gruntfile.js

	```
	module.exports = grunt => {
		grunt.initConfig({
			useref_yj: {
		            html: 'dist/*.html',
		            temp: 'dist'
		        }
		})
		
		 grunt.registerTask('_u', ['copy', 'useref_yj', 'concat', 'uglify', 'cssmin'])
	}
	```
	
### 10.JS、Sass 标准化
- 插件安装： `yarn add  --dev`
- gruntfile.js

	```
	module.exports = grunt => {
		grunt.initConfig({
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
		        }
		})
		
		 grunt.registerTask('_sl', ['sasslint', 'eslint']) // 测试JS、Sass 标准化
	}
	```
	
	
	
	
### 4.
- 插件安装： `yarn add  --dev`
- gruntfile.js

	```
	module.exports = grunt => {
		grunt.initConfig({
			
		})
	}
	```
	
	
	
	





























