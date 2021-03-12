const { html, nothing } = require('@popeindustries/lit-html-server');

module.exports = (pages, currentItem) => {
    const navGroups = {};
    pages.forEach((page) => {
        if (page.type === 'intro') {
            return;
        }
        if (!navGroups[page.type]) {
            navGroups[page.type] = [];
        }
        navGroups[page.type].push(page);
    });
    return html`
    <nav>
        ${Object.keys(navGroups).map((item) => html`
            ${navGroups[item] && navGroups[item].length > 0 ? html`
                <details ?open=${item === currentItem.type}>
                    <summary>${item}</summary>
                    <ul>
                    ${navGroups[item] && navGroups[item].map((subitem) => html`
                        <ol class="${subitem.name === currentItem.name && subitem.type === currentItem.type ? 'selected' : nothing}">
                            <a href="../${item}/${subitem.name}.html" class="link" title="${subitem.name}">${subitem.name}</a>
                        </ol>
                    `)}
                    </ul>
                </details>
            ` : nothing}
        `)}
    </nav>`;
};
