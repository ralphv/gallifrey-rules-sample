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

describe('CustomerInfoDataObject', () => {
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
    it('testDoAction', async () => {
        const engine = new GallifreyRulesEngineForTesting();
        await engine.initialize({
            $namespace: 'test-namespace',
            $entities: {},
            $providers: {
                // specifying TestingJournalLoggerProvider gives us a powerful way to validate all the steps that were done in any event
                journalLogger: TestingModuleNames.TestingJournalLoggerProvider,
                scheduledEvents: TestingModuleNames.TestingDummyScheduledEventsProvider,
            },
            $modulesPaths: ['$', '$testing', path.join(__dirname, '../../../src/modules')],
        } as NamespaceSchema);
        const response = await engine.testPullDataObject<string, CustomerInfoType>(CustomerInfoDataObject.name, 1234);

        const journalLogger = engine.getLastCreatedJournalLogger<TestingJournalLoggerProviderTestingMethods>();
        expect(journalLogger.isDataObjectPulled(CustomerInfoDataObject.name)).to.be.true;

        expect(response.customerID).to.equal(1234);
        expect(response.name).to.equal('Doctor Who');
        expect(response.emailAddress).to.equal('doctor@gallifrey-rules.dev');
    });
});
