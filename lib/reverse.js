
const path = require('path');
const sourceMap = require('source-map');
const fs = require('fs-extra');
const findFiles = require('./find-files');

const MATCH_MAPFILE = /\.map$/iu;
const MATCH_CODEFILE = /\.(js|css)$/iu;
const FIND_INLINE_SOURCE_BASE64 = /\/\*?\/?#\s*sourceMappingURL=([.\w\-/=;:]*)base64,(([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==))/iu;

var collectFilesList = function(opts){
    let fileList = [];
    const matcher = new RegExp(opts.match);
    opts._.forEach((item) => {
        if (fs.existsSync(item)) {
            fileList = fileList.concat(findFiles(item,matcher,opts.recursive));
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
      const contents = response.sourceContentFor(source_filename);
      map[path.normalize(source_filename).replace(/^(\.\.[/\\])+/, '').replace(/[|\&#,+()?$~%'":*?<>{}]/g, '').replace(' ', '.')] = contents;
    });
    return map;
  }

/**
 * @param {string} input sourcemap
 * @param {object} opts Object {verbose: boolean}
 *
 * @returns {object}
 */
var parseSourceMap = function(input, opts){
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
var outputOriginal = function(sourceMapContent,outputDir,verbose){
  const sourceMaps = parseSourceMap(sourceMapContent, verbose);
    sourceMaps.then((output) => {
      Object.keys(output).forEach((item) => {
        const outfile = path.join(outputDir, item);
  
        if (verbose) {
          process.stdout.write('Trying to write ' + outfile.replace(outputDir + "\\", "") + " ");
        }
  
        if (fs.existsSync(outfile)) {
          if (verbose) {
            process.stdout.write('[skipped]');
          }
        } else {
          let dir = path.dirname(outfile);
          fs.ensureDirSync(dir);
          fs.writeFileSync(outfile, output[item], 'utf8');
          if (verbose) {
            process.stdout.write('[success]');
          }
        }
        if (verbose) {
          console.log("");
        }
      });
    });
}

var exec = function(opts){
    opts.verbose = typeof opts.verbose === 'boolean' ? opts.verbose : false;
    const outputDir = path.resolve(opts.outputDir);

    if (opts.verbose) {
      console.log(`Outputting to directory: ${outputDir}`);
    }
    
    if (!fs.existsSync(outputDir)) {
      fs.ensureDirSync(outputDir);
    }
    
    collectFilesList(opts).forEach((filepath) => {
      if (opts.verbose) {
        console.log(`Processing file ${filepath}`);
      }
      const input = fs.readFileSync(filepath, 'utf8');

      // see: https://webpack.docschina.org/configuration/devtool
      // Canot support [devtool:eval] mode
      if (filepath.match(MATCH_MAPFILE)) {
        outputOriginal(input,outputDir,opts.verbose);
      }else if (filepath.match(MATCH_CODEFILE)) {
        let sourceMappingMatch = input.match(FIND_INLINE_SOURCE_BASE64)
        if (sourceMappingMatch && sourceMappingMatch.length > 2) {
          if (opts.verbose) {
            console.log(`Input file "${filepath}" contains Base64 of ${sourceMappingMatch[2].length} length`);
          }
          outputOriginal(Buffer.from(sourceMappingMatch[2], 'base64').toString('utf8'),outputDir,opts.verbose);
        }
      }
      
    });
}

exports = module.exports = {collectFilesList, exec}