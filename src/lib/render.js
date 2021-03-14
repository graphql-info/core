/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const { renderToString } = require('@popeindustries/lit-html-server');
const chalk = require('chalk');
const path = require('path');
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
const subscription = require('../templates/subscription');

const renderPage = ({
    type, template, items, schema, overrides
}) => items.map((item) => {
    let pageRender = (...args) => template(...args);
    if (overrides && overrides.types[type]) {
        if (!Array.isArray(overrides.types[type])) {
            overrides.types[type] = [overrides.types[type]];
        }

        overrides.types[type].reverse().forEach((override) => {
            const renderer = override.startsWith('.') ? require(path.resolve(process.cwd(), override)) : require(override);
            const oldRenderer = pageRender;
            pageRender = (...args) => renderer.render(...args, type, oldRenderer);
        });
    }

    const page = {
        name: item.name,
        type,
        page: pageRender(item, schema)
    };

    process.stdout.write(chalk.green('.'));

    return page;
});

module.exports = async (data, overrides, schema, assets) => {
    let result = [];
    console.log(chalk.green('Rendering pages:'));
    Object.keys(data).forEach((item) => {
        let pages;
        switch (item) {
            case 'object':
                pages = renderPage({
                    type: 'object', template: object, items: data[item], schema, overrides
                });
                break;
            case 'mutation':
                pages = renderPage({
                    type: 'mutation', template: mutation, items: data[item], schema, overrides
                });
                break;
            case 'query':
                pages = renderPage({
                    type: 'query', template: query, items: data[item], schema, overrides
                });
                break;
            case 'scalar':
                pages = renderPage({
                    type: 'scalar', template: scalar, items: data[item], schema, overrides
                });
                break;
            case 'input':
                pages = renderPage({
                    type: 'input', template: input, items: data[item], schema, overrides
                });
                break;
            case 'directive':
                pages = renderPage({
                    type: 'directive', template: directive, items: data[item], schema, overrides
                });
                break;
            case 'enum':
                pages = renderPage({
                    type: 'enum', template: enumPage, items: data[item], schema, overrides
                });
                break;
            case 'interface':
                pages = renderPage({
                    type: 'interface', template: interfacePage, items: data[item], schema, overrides
                });
                break;
            case 'union':
                pages = renderPage({
                    type: 'union', template: union, items: data[item], schema, overrides
                });
                break;
            case 'subscription':
                pages = renderPage({
                    type: 'subscription', template: subscription, items: data[item], schema, overrides
                });
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

    const renderedResult = Promise.all(result.map(async (page) => {
        let navRenderer = (...args) => navigation(...args);
        if (overrides && overrides.navigation) {
            if (!Array.isArray(overrides.navigation)) {
                overrides.navigation = [overrides.navigation];
            }
            overrides.navigation.reverse().forEach((override) => {
                const renderer = override.startsWith('.') ? require(path.resolve(process.cwd(), override)) : require(override);
                const oldRenderer = navRenderer;
                navRenderer = (...args) => renderer.render(...args, oldRenderer);
            });
        }
        const nav = navRenderer(result, page);
        const renderedPage = {
            name: page.name,
            type: page.type,
            page: await renderToString(layout(nav, Array.isArray(page.page) ? page.page.map((item) => item.value) : page.page, page.name, assets))
        };
        return renderedPage;
    }));

    return renderedResult;
};
