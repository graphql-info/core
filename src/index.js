#!/usr/bin/env node
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

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
        const { targetDir = './docs', overrides = {} } = info;
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

        let assets = [];

        Object.keys(overrides).forEach((override) => {
            if (Array.isArray(overrides[override])) {
                overrides[override].forEach((item) => {
                    const overridePackage = item.startsWith('.') ? require(path.resolve(process.cwd(), item)) : require(item);
                    assets = assets.concat(overridePackage.init ? overridePackage.init(path.resolve(process.cwd(), targetDir), schema) : []);
                });
            } else if (typeof overrides[override] === 'string') {
                const overridePackage = overrides[override].startsWith('.') ? require(path.resolve(process.cwd(), overrides[override])) : require(overrides[override]);
                assets = assets.concat(overridePackage.init ? overridePackage.init(path.resolve(process.cwd(), targetDir), schema) : []);
            } else {
                Object.keys(overrides[override]).forEach((key) => {
                    const overridePath = overrides[override][key];
                    if (Array.isArray(overridePath)) {
                        overridePath.forEach((item) => {
                            const overridePackage = item.startsWith('.') ? require(path.resolve(process.cwd(), item)) : require(item);
                            assets = assets.concat(overridePackage.init ? overridePackage.init(path.resolve(process.cwd(), targetDir), schema) : []);
                        });
                    } else {
                        const overridePackage = overridePath.startsWith('.') ? require(path.resolve(process.cwd(), overridePath)) : require(overridePath);
                        assets = assets.concat(overridePackage.init ? overridePackage.init(path.resolve(process.cwd(), targetDir), schema) : []);
                    }
                });
            }
        });

        assets = assets.map((item) => ({ name: path.relative(path.resolve(process.cwd(), targetDir, './query'), path.resolve(process.cwd(), targetDir, item.name)), path: item.path }));

        const pages = await render(types, overrides, schema, assets);

        await fileWriter(path.resolve(process.cwd(), targetDir), pages, assets);
        console.log('');
        console.log('Done');
    }
}

main();
