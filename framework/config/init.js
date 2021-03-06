import conf from './config'//系统默认配置变量
import fs from 'fs'

export default function (opt) {
    //定义全局配置方法 可以直接用 G. 调用
    global.G = conf(opt)
    //创建项目目录
    if (!fs.existsSync(opt.app_path))fs.mkdirSync(opt.app_path)
    /**
     * @G.system_mod Array 判断 生成对应的服务模式 api socket page , 默认值为[api,socket,page]
     */
    let module_folder = ['model','config']
    if(opt.extend_dir)module_folder = _.extend(module_folder,opt.extend_dir)
    if(G.system_mod.indexOf('api')>-1){
        module_folder.push('api')
    }
    if(G.system_mod.indexOf('socket')>-1){
        module_folder.push('socket')
    }
    if(G.system_mod.indexOf('module')>-1){
        module_folder.push('module')
    }
    //当需要上传目录且上传目录为CDN时 屏蔽上传目录
    if(opt.upload_path&&opt.upload_path.indexOf('http')>-1){
        let index = module_folder.indexOf('upload')
        module_folder.splice(index,1)
    }

    _.forEach(G.path, (v, k) => {
        if (!fs.existsSync(v) && module_folder.indexOf(k) > -1){
            fs.mkdirSync(v)
        }
    })



    //全局定位变量 module 模式
    if(G.system_mod.indexOf('module')>-1) {

        let default_app_path = [
            G.path.module + '/' + G.web.module,
            //G.path.module + '/' + G.web.module,
            G.path.module + '/' + G.web.module + '/' + G.web.controller
        ]
        _.forEach(default_app_path, (v, k) => {
            if (!fs.existsSync(v))fs.mkdirSync(v)
        })

        //创建文件
        let defaultJs = G.path.module + '/' + G.web.module + '/' + G.web.controller + '.js'
        let defaultHtml = G.path.module + '/' + G.web.module + '/' + G.web.controller + '/' + G.web.action + '.html'
        if (!fs.existsSync(defaultJs)) {
            fs.createReadStream(G.path.core + '/controller/_default.js').pipe(fs.createWriteStream(defaultJs))
        }
        if (!fs.existsSync(defaultHtml)) {
            fs.createReadStream(G.path.core + '/view/_default.html').pipe(fs.createWriteStream(defaultHtml))
        }

    }


    //微服务 全局调用 目前增加 config 以及 service service 通过 G.service.common_load 进行引用
    opt.common_path = opt.common_path || opt.root_path+'/common'
    if(opt.common_path) {
        if (!fs.existsSync(opt.common_path)){
            fs.mkdirSync(opt.common_path)
            fs.mkdirSync(opt.common_path+'/config')
            fs.mkdirSync(opt.common_path+'/service')
        }
        G.path.common = opt.common_path
    }

    //检查是否存在外部应用配置项 ./config
    //***全局配置文件
    fs.readdirSync(G.path.common+'/config').forEach((name)=> {
        if (name.indexOf('.js') > -1) {
            let conf = require(G.path.common+'/config' + '/' + name)
            _.extend(G, conf);
        }
    })

    //***环境变量
    let env_val = ['production','test']//生产环境 测试环境

    if(env_val.indexOf(opt.env)>-1){
        fs.readdirSync(G.path.common+'/config/'+opt.env).forEach((name)=> {
            if (name.indexOf('.js') > -1) {
                let conf = require(G.path.common+'/config' + '/'+opt.env+'/' + name)
                _.extend(G, conf);
            }
        })
    }else{
        fs.readdirSync(G.path.common+'/config').forEach((name)=> {
            if (name.indexOf('.js') > -1) {
                let conf = require(G.path.common+'/config/' + name)
                _.extend(G, conf);
            }
        })
    }
    if(env_val.indexOf(opt.env)>-1) {
        //***模块配置文件
        fs.readdirSync(G.path.config+'/'+opt.env).forEach((name)=> {
            if (name.indexOf('.js') > -1) {
                let conf = require(G.path.config + '/'+opt.env+'/'  + name)
                _.extend(G, conf);
            }
        })
    }else{
        fs.readdirSync(G.path.config).forEach((name)=> {
            if (name.indexOf('.js') > -1) {
                let conf = require(G.path.config + '/' + name)
                _.extend(G, conf);
            }
        })
    }
}