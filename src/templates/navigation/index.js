const { html, nothing} = require('@popeindustries/lit-html-server');

module.exports = (data, currentItem) => html`
    <nav>
        ${Object.keys(data).map((item) => html`
            ${data[item] && data[item].length > 0 ? html`
                <details ?open=${item === currentItem.type}>
                    <summary>${item}</summary>
                    <ul>
                    ${data[item] && data[item].map((subitem) => html`
                        <ol><a href="../${item}/${subitem.name}.html" class="link">${subitem.name}</a></ol>
                    `)}
                    </ul>
                </details>
            ` : nothing}
        `)}
    </nav>
`;
