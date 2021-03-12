const { html } = require('@popeindustries/lit-html-server');
const generateQuery = require('./src/queryGenerator');

module.export = (page, schema) => {
    const query = generateQuery(page.name, page.type, '', {}, [], 10, schema);
    page.page.push(html`${query.queryStr}`);
};
