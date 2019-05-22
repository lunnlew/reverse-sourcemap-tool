
const path = require('path');
const sourceMap = require('source-map');
const fs = require('fs-extra');

var collectFilesList = function(opts){
    // 将被处理的文件列表
    const fileList = [];

    // 用于匹配文件路径的表达式
    const matcher = new RegExp(opts.match);

    /**
     * 确定给定的路径是文件还是目录，并且根据需要进行过滤及目录递归
     *
     * @param {string} filepath 存在的相对路劲
     * @param {bool} is_recurse 是否目录递归
     * @returns {void}
     */
    const handleFilepath = (filepath, is_recurse) => {
    const stat = fs.statSync(filepath);
    if (stat.isDirectory() && is_recurse) {
        const list = fs.readdirSync(filepath);

        list.forEach((item) => {
        handleFilepath(path.join(filepath, item), opts.recursive);
        });
    }
    else if (filepath.match(matcher) && stat.isFile()) {
        fileList.push(filepath);
    }
    };

    //遍历路径
    opts._.forEach((item) => {
        if (fs.existsSync(item)) {
            //存在路径则处理
            handleFilepath(item, true);
        }
        else {
            console.error(`path (${item}) not exist`);
        }
    });

    if (opts.verbose) {
        console.log(`Start processing a total of ${fileList.length} files`);
    }

    return fileList;
}

var consumerReadyCallback = function (response, opts) {
    let map = {};
    response.sources.forEach((source_filename) => {
      if (opts.verbose) {
        console.log("[Found] " + source_filename)
      }
      //仅提取webpack协议下的文件
      if (source_filename.indexOf('webpack://') !== 0) {
        return
      }
      //返回原始代码内容
      const contents = response.sourceContentFor(source_filename);
      map[path.normalize(source_filename).replace(/^(\.\.[/\\])+/, '').replace(/[|\&#,+()?$~%'":*?<>{}]/g, '').replace(' ', '.')] = contents;
    });
    return map;
  }

  /**
 * @param {string} input sourcemap文件的内容
 * @param {object} opts Object {verbose: boolean}
 *
 * @returns {object} 文件名及源码映射结果集
 */
var getSourceMap = function(input, opts){
    const consumer = new sourceMap.SourceMapConsumer(input);
    return consumer.then((response) => {
        if (response.hasContentsOfAllSources()) {
        if (opts.verbose) {
            console.log('All sources were included in the sourcemap');
        }
        return consumerReadyCallback(response, opts);
        } else if (opts.verbose) {
        console.log('Not all sources were included in the sourcemap');
        }
        return {};
    }).catch((e) => {
        console.log(e);
        return {};
    });
}

var output = function(fileList,opts){
    const outputDir = path.resolve(opts.outputDir);
    if (opts.verbose) {
      console.log(`Outputting to directory: ${outputDir}`);
    }
    
    if (!fs.existsSync(outputDir)) {
      fs.ensureDirSync(outputDir);
    }
    
    // 开始处理
    fileList.forEach((filepath) => {
      if (opts.verbose) {
        console.log(`Processing file ${filepath}`);
      }
    
      // 读取原始map文件内容
      const input = fs.readFileSync(filepath, 'utf8');
    
      // 转换为源码
      const output = getSourceMap(input, { verbose: typeof opts.verbose === 'boolean' ? opts.verbose : false });
    
      // 写入文件
      output.then((output) => {
        Object.keys(output).forEach((item) => {
          const outfile = path.join(outputDir, item);
    
          if (opts.verbose) {
            process.stdout.write('Trying to write ' + outfile.replace(outputDir + "\\", "") + " ");
          }
    
          if (fs.existsSync(outfile)) {
            if (opts.verbose) {
              process.stdout.write('[skipped]');
            }
          } else {
            let dir = path.dirname(outfile);
            fs.ensureDirSync(dir);
            fs.writeFileSync(outfile, output[item], 'utf8');
            if (opts.verbose) {
              process.stdout.write('[success]');
            }
          }
          if (opts.verbose) {
            console.log("");
          }
        });
    
      });
    });
}

exports = module.exports = { collectFilesList, output }