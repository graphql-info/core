const { html } = require('@popeindustries/lit-html-server');
const { unsafeHTML } = require('@popeindustries/lit-html-server/directives/unsafe-html');
const { print } = require('graphql/language');
const prism = require('prismjs');
const loadLanguages = require('prismjs/components/');
const marked = require('marked');
const { getTypeNameWithLink, getTypeName, getFolderName } = require('../../lib/utils');

loadLanguages(['graphql']);

module.exports = (query, schema) => {
    // remove leading description so it doesn't show up in the code
    const { description } = query;
    if (query.astNode) {
        delete query.astNode.description;
    } else {
        delete query.description;
    }

    const output = [{
        name: 'title',
        type: 'lit-html',
        value: html`
            <h1>${query.name}</h1>`
    }, {
        name: 'description',
        type: 'lit-html',
        value: html`
            <section class="description">${unsafeHTML(marked(description || ''))}</section>`
    }];

    if (query.astNode) {
        output.push({
            name: 'code block',
            type: 'lit-html',
            value: html`
                <section class="code"><pre class="language-graphql">${unsafeHTML(prism.highlight(print(query.astNode), prism.languages.graphql, 'graphql'))}</pre></section>`
        });
    }

    if (query.args && query.args.length > 0) {
        output.push({
            name: 'inputs',
            type: 'lit-html',
            value: html`
                <section class="inputs">
                    <h3>Inputs:</h3>
                    ${query.args.map((input) => html`
                        <div class="input-list horizontal-list">
                            <dd>${input.name}</dd>
                            <dt>
                                ${unsafeHTML(getTypeNameWithLink(input.type, schema, `../${getFolderName(input.type)}`))}
                            </dt>
                            <dl>
                                ${unsafeHTML(marked(schema.getType(getTypeName(input.type))?.description || ''))}
                            </dl>
                        </div>`)}
                </section>`
        });
    }
    return output;
};
