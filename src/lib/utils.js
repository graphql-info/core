const getTypeName = (type) => {
    if (type.kind === 'NonNullType' || type.kind === 'ListType') {
        return getTypeName(type.type);
    }
    if (type.ofType) {
        return getTypeName(type.ofType);
    }
    return typeof type.name === 'string' ? type.name : type.name?.value;
};

const getTypeDisplayName = (type) => {
    if (type.kind === 'NonNullType') {
        return `${getTypeDisplayName(type.type)}!`;
    }
    if (type.kind === 'ListType') {
        return `[${getTypeDisplayName(type.type)}]`;
    }
    return type.name.value;
};

const getTypeNameWithLink = (type, schema, linkPrefix) => {
    if (type.kind === 'NonNullType') {
        return `${getTypeNameWithLink(type.type, schema, linkPrefix)}!`;
    }
    if (type.kind === 'ListType') {
        return `[${getTypeNameWithLink(type.type, schema, linkPrefix)}]`;
    }
    if (type.ofType) {
        return `[${getTypeNameWithLink(type.ofType, schema, linkPrefix)}]`;
    }
    const name = typeof type.name === 'string' ? type.name : type.name.value;

    const originalType = schema.getType(name);
    return originalType?.astNode ? `<a class="type" href="${linkPrefix}/${name}.html">${name}</a>` : `<span class="type">${name}</span>`;
};

const getFolderName = (type) => {
    if (type.ofType) {
        return getFolderName(type.ofType);
    }
    if (!type.astNode) {
        return '';
    }
    switch (type.astNode.kind) {
        case 'InputObjectTypeDefinition':
            return 'input';
        case 'ScalarTypeDefinition':
            return 'scalar';
        case 'UnionTypeDefinition':
            return 'union';
        case 'InterfaceTypeDefinition':
            return 'interface';
        case 'EnumTypeDefinition':
            return 'enum';
        case 'ObjectTypeDefinition':
            return 'object';
        default:
            return '';
    }
};

module.exports = {
    getTypeDisplayName,
    getTypeName,
    getTypeNameWithLink,
    getFolderName
};
