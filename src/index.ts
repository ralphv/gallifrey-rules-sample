import {
    GallifreyRulesEngine, KafkaConsumerConfig,
    NamespaceSchema, NamespaceSchemaConsumer,
} from "gallifrey-rules";
import path from "node:path";
import NotifyCustomerNewOrderRule from "./modules/plugins/rules/NotifyCustomerNewOrderRule";
import NewOrdersDispatcher from "./modules/providers/NewOrdersDispatcher";

// define the schema that the engine needs to define what is expected from it
const schema: NamespaceSchema = {
    $namespace: "gallifrey-rules-sample",
    $modulesPaths: ['$', path.join(__dirname, 'modules')], // load built in modules using '$' and sample app modules from modules folder
    $entities: {
        // we have 'orders' entity and on orders entity we have a single event 'new-order'
        "orders": {
            "new-order": {
                $rules: [NotifyCustomerNewOrderRule.name]
            }
        }
    },
    $consumers: [
        {
            // create one consumer that listens to topic: new-orders,
            // uses NewOrderDispatcher dispatcher to translate message into gallifrey-rules event
            name: 'new-orders-consumer',
            type: 'kafka',
            eventDispatcher: NewOrdersDispatcher.name,
            config: {
                groupId: 'group-id-1',
                topics: 'new-orders',
                fromBeginning: true,
            }
        } as NamespaceSchemaConsumer<KafkaConsumerConfig>
    ]
};

// entry point of the sample application
void (async () => {
    // create engine instance, initialize schema and then start consumers
    const engine = new GallifreyRulesEngine();
    await engine.initialize(schema);
    await engine.startConsumers();
})();