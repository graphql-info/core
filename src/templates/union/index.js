/* eslint-disable indent */
const { html } = require('@popeindustries/lit-html-server');
const { unsafeHTML } = require('@popeindustries/lit-html-server/directives/unsafe-html');
const { print } = require('graphql/language');
const prism = require('prismjs');
const loadLanguages = require('prismjs/components/');
const { marked } = require('marked');
const { getTypeName, getFolderName, getTypeNameWithLink } = require('../../lib/utils');

loadLanguages(['graphql']);

module.exports = (query, schema) => {
    // remove leading description so it doesn't show up in the code
    const { description } = query;
    delete query.astNode.description;

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
    }, {
        name: 'code block',
        type: 'lit-html',
        value: html`
            <section class="code"><pre class="language-graphql">${unsafeHTML(prism.highlight(print(query.astNode), prism.languages.graphql, 'graphql'))}</pre></section>`
    }, {
        name: 'fields',
        type: 'lit-html',
        value: html`
            <section class="types">
                <h3>Types</h3>
                ${query.astNode.types.map((type) => {
                    const unionType = schema.getType(getTypeName(type));
                    return html`
                        <div class='fields-list horizontal-list'>
                            <dd>${getTypeName(unionType)}</dd>
                            <dt>${unsafeHTML(getTypeNameWithLink(type, schema, `../${getFolderName(unionType)}`))}</dt>
                            <dl>${unsafeHTML(marked((type.description && type.description.value) || unionType.description || ''))}</dl>
                        </div>
                    `;
                })}
            </section>`
    }];

    return output;
};
