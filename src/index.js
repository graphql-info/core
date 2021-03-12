#!/usr/bin/env node

const { loadConfig } = require('graphql-config');
const path = require('path');
const render = require('./lib/render');
const InfoExtension = require('./lib/extension');
const fileWriter = require('./lib/fileWriter');

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
        const query = schema.getQueryType() ? schema.getQueryType().getFields() : {};
        const mutation = schema.getMutationType() ? schema.getMutationType().getFields() : {};
        const subscription = schema.getSubscriptionType() ? schema.getSubscriptionType().getFields() : {};
        const types = {
            query: Object.values(query),
            mutation: Object.values(mutation),
            subscription: Object.values(subscription),
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
        const pages = await render(types, {}, schema);
        await fileWriter(path.resolve(process.cwd(), targetDir), pages);
        console.log('');
        console.log('Done');
    }
}

main();
