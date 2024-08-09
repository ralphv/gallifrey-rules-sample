import {EngineRuleInterface, GallifreyPlugin, PluginType, RuleInterface} from "gallifrey-rules";
import {NewOrdersMessageType, OrderItemType} from "../../providers/NewOrdersDispatcher";
import {ModuleNames} from "../../../ModuleNames";
import {CustomerInfoType} from "../data-objects/CustomerInfoDataObject";
import {SendEmailActionRequest} from "../actions/SendEmailAction";

/**
 * This defines the rule that runs to notify a customer when a new order is created
 */
@GallifreyPlugin(PluginType.Rule)
export default class NotifyCustomerNewOrderRule implements RuleInterface<NewOrdersMessageType> {
    getModuleName(): string {
        return ModuleNames.NotifyCustomerNewOrderRule;
    }

    async trigger(engine: EngineRuleInterface<NewOrdersMessageType>): Promise<void> {
        // 1. Pull customer information using customerID
        const customerInfo = await engine.pullDataObject<string, CustomerInfoType>(
            ModuleNames.CustomerInfoDataObject,
            engine.getEventPayload().customerID);

        // 2. Create an email body
        const emailContents = this.getEmailContents(customerInfo, engine.getEventPayload());

        // 3. Send an email notifying new order
        await engine.doAction<SendEmailActionRequest, void>(ModuleNames.SendEmailAction, {
            emailAddress: customerInfo.emailAddress,
            emailContents,
            recipientName: customerInfo.name,
        })
    }

    private getOrderItemDesc(orderItem: OrderItemType) {
        return `Name: ${orderItem.orderItemName}, Qty: ${orderItem.qty}, Price: ${orderItem.price}`;
    }

    private getEmailContents(customerInfo: CustomerInfoType, eventPayload: NewOrdersMessageType) {
        return `
Hello ${customerInfo.name}

Thank you so much for your recent order ID: ${eventPayload.orderID}

Your order contains the following items:

${eventPayload.orderItems.map((orderItem) => this.getOrderItemDesc(orderItem)).join('\n')}

Have a great day!
`
    }
}