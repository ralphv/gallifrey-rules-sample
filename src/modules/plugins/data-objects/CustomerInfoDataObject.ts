import {DataObjectInterface, EngineDataObjectInterface, GallifreyPlugin, PluginType} from "gallifrey-rules";

/**
 * This defines a dummy DataObject that pulls customer information, given customer ID
 */
@GallifreyPlugin(PluginType.DataObject)
export default class CustomerInfoDataObject implements DataObjectInterface<string, CustomerInfoType>{
    async get(engine: EngineDataObjectInterface<string>): Promise<CustomerInfoType> {
        // A dummy data object, it takes in the customerID and returns customer info
        const customerID = engine.getRequest();

        return {
            customerID,
            name: 'Doctor Who',
            emailAddress: 'doctor@gallifrey-rules.dev',
        }
    }
}

export type CustomerInfoType = {
    customerID: string;
    name: string;
    emailAddress: string;
}