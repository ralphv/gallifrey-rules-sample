import {
    GallifreyRulesEngineForTesting,
    NamespaceSchema,
    TestingModuleNames
} from "gallifrey-rules";
import SendEmailAction, {SendEmailActionRequest} from "../../../src/modules/plugins/actions/SendEmailAction";
import path from "node:path";
import sinon from 'sinon';
import {afterEach, beforeEach} from "mocha";
import {expect} from "chai";
import {
    TestingJournalLoggerProviderTestingMethods
} from "gallifrey-rules/dist/testing-modules/TestingJournalLoggerProvider";
import CustomerInfoDataObject, {
    CustomerInfoType
} from "../../../src/modules/plugins/data-objects/CustomerInfoDataObject";
import exp = require("node:constants");
import NotifyCustomerNewOrderRule from "../../../src/modules/plugins/rules/NotifyCustomerNewOrderRule";
import NewOrdersDispatcher, {NewOrdersMessageType} from "../../../src/modules/providers/NewOrdersDispatcher";
import * as os from "node:os";
import {EntityNames} from "../../../src/EntityNames";
import {EventNames} from "../../../src/EventNames";

describe('EntityName: orders, EventName: new-order', () => {
    let infoSpy: sinon.SinonSpy;
    let warnSpy: sinon.SinonSpy;
    beforeEach(() => {
        warnSpy = sinon.spy(console, 'warn');
        infoSpy = sinon.spy(console, 'info');
    });
    afterEach(async () => {
        warnSpy.restore();
        infoSpy.restore();
    });
    it('test rule orders/new-order event', async () => {
        const engine = new GallifreyRulesEngineForTesting();
        await engine.initialize({
            $namespace: 'test-namespace',
            $entities: {
                [EntityNames.Orders]:
                    {
                        [EventNames.NewOrder]:
                            {
                                $rules: [NotifyCustomerNewOrderRule.name]
                            }
                    }
            },
            $providers: {
                // specifying TestingJournalLoggerProvider gives us a powerful way to validate all the steps that were done in any event
                journalLogger: TestingModuleNames.TestingJournalLoggerProvider,
                scheduledEvents: TestingModuleNames.TestingDummyScheduledEventsProvider,
            },
            $modulesPaths: ['$', '$testing', path.join(__dirname, '../../../src/modules')],
            $consumers: [{
                name: 'new-orders',
                type: 'kafka',
                eventDispatcher: NewOrdersDispatcher.name,
                config: {
                    groupId: `group-id-1`,
                    topics: 'sample-topic',
                    fromBeginning: true,
                    brokers: [],
                },
            }]
        });

        await engine.testEventOnTopic('sample-topic',     {
            customerID: "10-0-11-00:02",
            orderID: "13",
            orderItems: [{
            orderItemID: "456",
            orderItemName: "Children of Earth",
            qty: 1,
            price: 12.43,
        }, {
            orderItemID: "42",
            orderItemName: "Type 40 TT Capsule",
            qty: 500,
            price: 26,
        }]
    });

        const journalLogger = engine.getLastCreatedJournalLogger<TestingJournalLoggerProviderTestingMethods>();

        expect(journalLogger.isDataObjectPulled(CustomerInfoDataObject.name)).to.be.true;
        expect(journalLogger.isActionRun(SendEmailAction.name)).to.be.true;
        expect(journalLogger.getErrorsCount()).to.equal(0);
        expect(
            infoSpy.calledWithMatch(
                sinon.match((value: string | string[]) =>
                    value.includes('Email sent to:'),
                ),
            ),
        ).to.be.true;
    });
});
