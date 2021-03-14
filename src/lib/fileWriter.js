const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');

module.exports = async (target, pages, assets) => {
    try {
        await fs.access(path.resolve(target));
    } catch (e) {
        await fs.mkdir(path.resolve(target));
    }

    // cleanup
    await fs.remove(path.resolve(target));

    // copy assets
    await fs.copy(path.resolve(__dirname, '../assets/'), path.resolve(target), { overwrite: true, recursive: true });
    await Promise.all(assets.map(async (item) => {
        await fs.copy(item.path, path.resolve(target, 'css', item.name), { overwrite: true });
    }));

    console.log('');
    console.log(chalk.cyan('Writing files:'));

    // render pages
    await Promise.all(pages.map(async (page) => {
        const dir = path.resolve(target, page.type);
        const pageName = path.resolve(dir, `${page.name}.html`);
        try {
            process.stdout.write(chalk.cyan('.'));
            await fs.outputFile(pageName, page.page);
        } catch (e) {
            console.error(e);
        }
    }));
};
