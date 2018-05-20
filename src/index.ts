import Utils_String = require("VSS/Utils/String")
import Controls = require("VSS/Controls")
import Combos = require("VSS/Controls/Combos")
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

        var dlg = $("<div>")
        dlg.append(`<h2>Configure</h2>`)
        dlg.append(`<h3>Project: ${projectName}`)
        dlg.append(`<p>Where are your business process models stored?</p>`)

        var gitSelect = <Combos.IComboOptions>{
            source: await gitclient.getRepositories(projectId)
        }
        
        var repType = <Combos.IComboOptions>{
            source: [
                "TFS",
                "git"
            ],
            change: function() {
                gitSelectCtrl.setEnabled(this.getText() == "git")
            }
        }
        var repTypeCtrl = Controls.create(Combos.Combo, dlg, repType)
        var gitSelectCtrl = Controls.create(Combos.Combo, dlg, gitSelect)

        Dialogs.show(Dialogs.ModalDialog, <Dialogs.IModalDialogOptions>{
            title: "Configure",
            content: dlg.clone(),
            okCallback: (result: any) => {
                
            }
        })
    }

    return null
}

main()