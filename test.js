const { html } = require('@popeindustries/lit-html-server');
const generateQuery = require('./src/queryGenerator');

module.exports = (page, schema) => {
    const query = generateQuery(page.name, page.type === 'query' ? 'Query' : 'Mutation', '', {}, {}, [], 10, schema);
    page.page.push(html`${query.queryStr}`);
    return page;
};
