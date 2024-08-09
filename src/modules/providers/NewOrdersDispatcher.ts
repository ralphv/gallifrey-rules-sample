import {EventDispatcherInterface, GallifreyEventType, GallifreyProvider, ProviderType} from "gallifrey-rules";
import * as os from "node:os";
import {ModuleNames} from "../../ModuleNames";

/**
 * Take a message from kafka topic: 'new-orders'
 * of Message Type: NewOrdersMessageType
 * and translate it into Gallifrey-Rules event
 */
@GallifreyProvider(ProviderType.EventDispatcher)
export default class NewOrdersDispatcher implements EventDispatcherInterface<NewOrdersMessageType, NewOrdersMessageType> {
    getModuleName(): string {
        return ModuleNames.NewOrderDispatcher;
    }

    getEvent(message: NewOrdersMessageType): GallifreyEventType<NewOrdersMessageType> {
        // translate the incoming kafka message of type NewOrdersMessageType into a Gallifrey Event type
        return {
            entityName: "orders",
            eventName: "new-order",
            eventId: message.orderID, // the eventID will be the same as orderID
            payload: message,
            source: os.hostname(),
            eventLag: 0,
        };
    }
}

/**
 * This defines the type of message we get from the topic
 */
export type NewOrdersMessageType = {
    customerID: string;
    orderID: string;
    orderItems: OrderItemType[];
}

export type OrderItemType = {
    orderItemID: string;
    orderItemName: string;
    qty: number;
    price: number;
}