import Utils_String = require("VSS/Utils/String")
import Controls = require("VSS/Controls")
import VCContracts = require("TFS/VersionControl/Contracts")
import GitHttpClient = require("TFS/VersionControl/GitRestClient")
import TfvcRestClient = require("TFS/VersionControl/TfvcRestClient");
import BuildContracts = require("TFS/Build/Contracts")
import WitContracts = require("TFS/WorkItemTracking/Contracts")
import WitClient = require("TFS/WorkItemTracking/RestClient")
import { ExtensionDataService } from "VSS/SDK/Services/ExtensionData";
import Dialogs = require("VSS/Controls/Dialogs");

// get config
const getConfig = async () => {
    var defaultBaseUrl = "https://graph.dcdc.io/extensions/VSO_BP_Extension"
    var defaultconfig = {
        baseUrl: defaultBaseUrl,
        repositoryType: null,
        repositoryId: null,
        repositoryPath: null
    }
    var service = await VSS.getService<ExtensionDataService>(VSS.ServiceIds.ExtensionData)
    var savedconfig = await service.getValue("global.config")
    var config = { ...defaultconfig, ...savedconfig }
    return config
}


const main = async () => {
    var config = await getConfig()
    var projectId = VSS.getWebContext().project.id
    var projectName = VSS.getWebContext().project.name
    var gitclient = GitHttpClient.getClient()
    var tfclient = TfvcRestClient.getClient()

    if (config.repositoryType == null) {
        Dialogs.show(Dialogs.ModalDialog, <Dialogs.IModalDialogOptions>{
            title: "Configure",
            content: `<div class="dialog-content">
                <h2 id="header">Configure Business Process</h2>
                <p>
                    <h3>Project: ${projectName}</h3>
                    <p></p>
                </p>
                <p>
                    <label>Repository:</label>
                    <input id="inpRepository"/>
                </p>
                <p>
                    <label>Path:</label>
                    <input id="inpName"/>
                </p>
            </div>`,
            okCallback: (result: any) => {
                $("<li />").text(result).appendTo(".person-list");
            }
        })
    }

    return null
}

main()