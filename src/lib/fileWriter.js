const path = require('path');
const fs = require('fs').promises;
const chalk = require('chalk');

module.exports = async (target, pages) => {
    try {
        await fs.access(path.resolve(target));
    } catch (e) {
        await fs.mkdir(path.resolve(target));
    }

    // cleanup
    const cleanUp = async (dir) => {
        const files = await fs.readdir(path.resolve(dir));
        await Promise.all(files.map(async (file) => {
            if ((await fs.lstat(path.resolve(dir, file))).isDirectory()) {
                await cleanUp(path.resolve(dir, file));
                await fs.rmdir(path.resolve(dir, file));
            } else {
                await fs.unlink(path.resolve(dir, file));
            }
        }));
    };
    await cleanUp(target);

    // copy assets
    await fs.mkdir(path.resolve(target, './css'));
    await fs.copyFile(path.resolve(__dirname, '../assets/css/main.css'), path.resolve(target, './css/main.css'));
    await fs.copyFile(path.resolve(__dirname, '../assets/css/prism.css'), path.resolve(target, './css/prism.css'));

    const createdDirs = [];

    console.log('');
    console.log(chalk.cyan('Writing files:'));

    // render pages
    await Promise.all(pages.map(async (page) => {
        const dir = path.resolve(target, page.type);
        await (async () => {
            if (!createdDirs.includes(dir)) {
                createdDirs.push(dir);
                await fs.mkdir(dir);
            }
        })();
        const pageName = path.resolve(dir, `${page.name}.html`);
        try {
            await fs.writeFile(pageName, page.page);
            process.stdout.write(chalk.cyan('.'));
        } catch (e) {
            console.error(e);
        }
    }));
};
