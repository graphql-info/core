const { html } = require('@popeindustries/lit-html-server');
const { unsafeHTML } = require('@popeindustries/lit-html-server/directives/unsafe-html');
const loadLanguages = require('prismjs/components/');
const marked = require('marked').marked;

loadLanguages(['graphql']);

module.exports = (query) => {
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
        name: 'values',
        type: 'lit-html',
        value: html`
            <section class="values">
                <h3>values</h3>
                ${query.astNode.values.map((value) => html`
                    <div class="value-list horizontal-list">
                        <dt><span class="type">${value.name.value}</span></dt>
                        <dl>${unsafeHTML(marked(value.description.value))}</dl>
                    </div>
                `)}
            </section>
        `
    }];

    return output;
};
