const { html } = require('@popeindustries/lit-html-server');
const { unsafeHTML } = require('@popeindustries/lit-html-server/directives/unsafe-html');
const generateQuery = require('./src/queryGenerator');
const prism = require('prismjs');
const loadLanguages = require('prismjs/components/');

loadLanguages(['graphql']);

module.exports = (page, schema) => {
    const query = generateQuery(page.name, page.type === 'query' ? 'Query' : 'Mutation', '', {}, {}, [], 10, schema);
    page.page.push({
        name: 'input',
        type: 'lit-html',
        value: html`
            <div class="documents">
                <h3>Documents:</h3>
                <section class="code">
                    <pre class="language-graphql">${unsafeHTML(prism.highlight(query.queryStr, prism.languages.graphql, 'graphql'))}</pre>
                </section>
            </div>`
    });
    return page;
};
