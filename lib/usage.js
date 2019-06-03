
const optionator = require('optionator');
const path = require('path');
const fs = require('fs-extra');

var optsParser = function (argv, pkginfo) {
    const _optsParser = optionator({
        prepend: `Usage: ${pkginfo.name} [options] <file|directory>`,
        append: `Version ${pkginfo.version}`,
        options: [
            {
                option: 'help',
                alias: 'h',
                type: 'Boolean',
                default: false,
                description: 'Help and usage instructions'
            },
            {
                option: 'version',
                alias: 'V',
                type: 'Boolean',
                default: false,
                description: 'Version number'
            },
            {
                option: 'verbose',
                alias: 'v',
                type: 'Boolean',
                default: false,
                description: 'Verbose output, will print which file is currently being processed'
            },
            {
                option: 'output-dir',
                alias: 'o',
                type: 'String',
                default: '.',
                description: 'Output directory'
            },
            {
                option: 'match',
                alias: 'M',
                type: 'String',
                default: '\\.(map|js|css)$',
                description: 'Regular expression for matching and filtering files'
            },
            {
                option: 'recursive',
                alias: 'r',
                type: 'Boolean',
                default: false,
                description: 'Recursively search matching files'
            }
        ]
    });



    let opts;
    try {
        opts = _optsParser.parse(argv);
    }
    catch (error) {
        console.error(error.message);
        process.exit(1);
    }


    if (opts.version) {
        console.log((opts.verbose ? pkginfo.name + ' v' : '') + pkginfo.version);
        process.exit();
    }


    if (opts.help || opts._.length === 0) {
        console.log(_optsParser.generateHelp());
        process.exit();
    }

    console.log(`${pkginfo.name} - ${pkginfo.description}`);

    return opts;
}

var parsePackageInfo = function () {
    let pkg;
    try {
        const packageJson = fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8');
        pkg = JSON.parse(packageJson);
    }
    catch (error) {
        console.error('Cannot read or parse the file "package.json"');
        console.error(error);
        process.exit(1);
    }
    return pkg;
}
exports = module.exports = { parsePackageInfo, optsParser }