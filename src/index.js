const { loadConfig } = require('graphql-config');
const path = require('path');
const render = require('./lib/render');
const InfoExtension = require('./lib/extension');

async function main() {
    let config;
    try {
        config = await loadConfig({ throwOnMissing: true, throwOnEmpty: true, extensions: [InfoExtension] });
    } catch (e) {
        console.log(e);
        throw new Error('Error loading config file', e);
    }
    if (config) {
        const project = config.getDefault();
        const info = project.extension('graphql-info');
        const { targetDir } = info;
        const schema = await project.getSchema();
        const types = {
            query: Object.values(schema.getQueryType()?.getFields() || {}),
            mutation: Object.values(schema.getMutationType()?.getFields() || {}),
            subscription: Object.values(schema.getSubscriptionType()?.getFields() || {}),
            directive: schema.getDirectives(),
            object: [],
            input: [],
            scalar: [],
            union: [],
            interface: [],
            enum: []
        };
        const allTypes = schema.getTypeMap();
        Object.keys(allTypes).forEach((type) => {
            if (allTypes[type].astNode) {
                switch (allTypes[type].astNode.kind) {
                    case 'InputObjectTypeDefinition':
                        types.input.push(allTypes[type]);
                        break;
                    case 'ScalarTypeDefinition':
                        types.scalar.push(allTypes[type]);
                        break;
                    case 'UnionTypeDefinition':
                        types.union.push(allTypes[type]);
                        break;
                    case 'InterfaceTypeDefinition':
                        types.interface.push(allTypes[type]);
                        break;
                    case 'EnumTypeDefinition':
                        types.enum.push(allTypes[type]);
                        break;
                    case 'ObjectTypeDefinition':
                        if (!['Mutation', 'Query', 'Subscription'].includes(type)) {
                            types.object.push(allTypes[type]);
                        }
                        break;
                    default:
                        break;
                }
            }
        });
        render(types, {}, path.resolve(process.cwd(), targetDir), schema);
    }
}

main();
