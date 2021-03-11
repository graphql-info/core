const { renderToString, html } = require('@popeindustries/lit-html-server');
const chalk = require('chalk');
const navigation = require('../templates/navigation');
const layout = require('../templates/layout');
const object = require('../templates/object');
const mutation = require('../templates/mutation');
const query = require('../templates/query');
const scalar = require('../templates/scalar');
const input = require('../templates/input');
const directive = require('../templates/directive');
const enumPage = require('../templates/enum');
const interfacePage = require('../templates/interface');
const union = require('../templates/union');
const intro = require('../templates/intro');

const renderPage = (type, template, items, schema) => items.map((item) => ({
    name: item.name,
    type,
    page: template.call(null, item, schema)
}));

module.exports = async (data, overrides, schema) => {
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

    // add index page
    result.push({
        name: 'index',
        type: 'intro',
        page: intro()
    });

    console.log(chalk.green('Rendering pages:'));
    const renderedResult = Promise.all(result.map(async (page) => {
        const renderedPage = {
            name: page.name,
            type: page.type,
            page: await renderToString(layout(navigation(result, page), Array.isArray(page.page) ? html`${page.page.map((item) => item.value)}` : page.page, page.name))
        };
        process.stdout.write(chalk.green('.'));
        return renderedPage;
    }));

    return renderedResult;
};
