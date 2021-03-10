const { renderToString, html } = require('@popeindustries/lit-html-server');
const path = require('path');
const fs = require('fs/promises');
const navigation = require('./templates/navigation');
const layout = require('./templates/layout');
const object = require('./templates/object');
const mutation = require('./templates/mutation');
const query = require('./templates/query');
const scalar = require('./templates/scalar');
const input = require('./templates/input');
const directive = require('./templates/directive');
const enumPage = require('./templates/enum');
const interfacePage = require('./templates/interface');
const union = require('./templates/union');

const renderPage = (type, template, items, schema) => items.map((item) => ({
    name: item.name,
    type,
    page: template.call(null, item, schema)
}));

module.exports = async (data, overrides, target, schema) => {
    let result = [];
    Object.keys(data).forEach((item) => {
        let pages;
        switch (item) {
            case 'object':
                pages = renderPage('object', object, data[item], schema);
                break;
            case 'mutation':
                pages = renderPage('mutation', mutation, data[item], schema);
                break;
            case 'query':
                pages = renderPage('query', query, data[item], schema);
                break;
            case 'scalar':
                pages = renderPage('scalar', scalar, data[item], schema);
                break;
            case 'input':
                pages = renderPage('input', input, data[item], schema);
                break;
            case 'directive':
                pages = renderPage('directive', directive, data[item], schema);
                break;
            case 'enum':
                pages = renderPage('enum', enumPage, data[item], schema);
                break;
            case 'interface':
                pages = renderPage('interface', interfacePage, data[item], schema);
                break;
            case 'union':
                pages = renderPage('union', union, data[item], schema);
                break;
            default:
                pages = [];
                break;
        }
        result = result.concat(pages);
    });

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
    await fs.copyFile(path.resolve(__dirname, './assets/css/main.css'), path.resolve(target, './css/main.css'));
    await fs.copyFile(path.resolve(__dirname, './assets/css/prism.css'), path.resolve(target, './css/prism.css'));

    // created directories
    await Promise.all(Object.keys(data).map(async (type) => {
        if (data[type] && data[type].length > 0) {
            await fs.mkdir(path.resolve(target, type));
        }
    }));

    // render pages
    await Promise.all(result.map(async (page) => {
        const pageName = path.resolve(target, page.type, `${page.name}.html`);
        let renderedPage;
        try {
            renderedPage = await renderToString(layout(navigation(data, page), Array.isArray(page.page) ? html`${page.page.map((item) => item.value)}` : page.page, page.name));
        } catch (e) {
            console.log(e);
        }
        await fs.writeFile(pageName, renderedPage);
    }));
};
