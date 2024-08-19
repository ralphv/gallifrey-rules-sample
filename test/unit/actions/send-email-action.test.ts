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

describe('SendEmailAction', () => {
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
        await engine.testDoAction<SendEmailActionRequest, void>(SendEmailAction.name, {
            emailAddress: "from@from.com",
            emailContents: "This is the email",
            recipientName: "Doctor"
        });
        const journalLogger = engine.getLastCreatedJournalLogger<TestingJournalLoggerProviderTestingMethods>();

        expect(
            infoSpy.calledWithMatch(
                sinon.match((value: string | string[]) =>
                    value.includes('Email sent to:'),
                ),
            ),
        ).to.be.true;

        expect(journalLogger.isActionRun(SendEmailAction.name)).to.be.true;
    });
});
