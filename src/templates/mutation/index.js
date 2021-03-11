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
        name: 'input',
        type: 'lit-html',
        value: html`
            <section class="input"></section>`
    }];

    if (query.astNode.arguments && query.astNode.arguments.length > 0) {
        output.push({
            name: 'inputs',
            type: 'lit-html',
            value: html`
                <section class="inputs">
                    <h3>Inputs:</h3>
                    ${query.astNode.arguments.map((input) => html`
                        <div class="input-list horizontal-list">
                            <dd>${input.name.value}</dd>
                            <dt>
                                ${unsafeHTML(getTypeNameWithLink(input.type, schema, '../input'))}
                            </dt>
                            <dl>
                                ${unsafeHTML(marked(schema.getType(getTypeName(input.type)).description || ''))}
                            </dl>
                        </div>`)}
                </section>`
        });
    }

    if (query.astNode.type) {
        const outputType = schema.getType(getTypeName(query.astNode.type));
        output.push({
            name: 'output',
            type: 'lit-html',
            value: html`
                <section class="output">
                    <h3>Output:</h3>
                    <div class="output-list horizontal-list">
                        <dt>
                            ${unsafeHTML(getTypeNameWithLink(query.astNode.type, schema, `../${getFolderName(outputType)}`))}
                        </dt>
                        <dl>${outputType.description}</dl>
                    </div>
                </section>`
        });
    }

    return output;
};
