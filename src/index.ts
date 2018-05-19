import Utils_String = require("VSS/Utils/String")
import Controls = require("VSS/Controls")
import VCContracts = require("TFS/VersionControl/Contracts")
import GitHttpClient = require("TFS/VersionControl/GitRestClient")
import TfvcRestClient = require("TFS/VersionControl/TfvcRestClient");
import BuildContracts = require("TFS/Build/Contracts")
import WitContracts = require("TFS/WorkItemTracking/Contracts")
import WitClient = require("TFS/WorkItemTracking/RestClient")
import { ExtensionDataService } from "VSS/SDK/Services/ExtensionData";

// get config
const getConfig = async () => {
    var defaultconfig = {
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
    var gitclient = GitHttpClient.getClient()
    var tfclient = TfvcRestClient.getClient()

    if (config.repositoryType == null) {
        debugger
        var content = $("#content")
        var drawing = $("<iframe>")
        
    }

    return null
}

main()