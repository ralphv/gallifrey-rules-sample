import {ActionInterface, EngineActionInterface, GallifreyPlugin, PluginType} from "gallifrey-rules";
import {ModuleNames} from "../../../ModuleNames";

/**
 * This defines a dummy Action that queues an email
 */
@GallifreyPlugin(PluginType.Action)
export default class SendEmailAction implements ActionInterface<SendEmailActionRequest, void>{
    getModuleName(): string {
        return ModuleNames.SendEmailAction;
    }

    async trigger(engine: EngineActionInterface<SendEmailActionRequest>): Promise<void> {
        const smtpServer = await engine.getConfigurationAccessor().getStringValue(`smtp-server`, 'default-smtp-server');

        // a dummy action that should queue an email
        console.log(`Email sent to: "${engine.getPayload().recipientName}" <${engine.getPayload().emailAddress}> using SMTP: ${smtpServer}
----------------------------------------------------------
${engine.getPayload().emailContents}
----------------------------------------------------------
`);
    }
}

export type SendEmailActionRequest = {
    recipientName: string;
    emailAddress: string;
    emailContents: string;
}