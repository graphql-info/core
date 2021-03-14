const { html } = require('@popeindustries/lit-html-server');

module.exports = (navigation, content, title, assets) => html`
    <!DOCTYPE html>
    <html>
        <head>
            <title>${title}</title>
            <link href="../css/main.css" rel="stylesheet" />
            <link href="../css/prism.css" rel="stylesheet" />
            ${assets.map((item) => html`
                <link href="${item.name}" rel="stylesheet" />
            `)}
        </head>
        <body>
            <div class="navigation">${navigation}</div>
            <main class="content">${content}</main>
        </body>
    </html>
`;
