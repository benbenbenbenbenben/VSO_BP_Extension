import BuildContracts = require("TFS/Build/Contracts")
import VCContracts = require("TFS/VersionControl/Contracts")
import GitHttpClient = require("TFS/VersionControl/GitRestClient")
import TfvcRestClient = require("TFS/VersionControl/TfvcRestClient");
import WitContracts = require("TFS/WorkItemTracking/Contracts")
import WitClient = require("TFS/WorkItemTracking/RestClient")
import Controls = require("VSS/Controls")
import Combos = require("VSS/Controls/Combos")
import Dialogs = require("VSS/Controls/Dialogs")
import StatusIndicator = require("VSS/Controls/StatusIndicator")
import { ExtensionDataService } from "VSS/SDK/Services/ExtensionData"
import Utils_String = require("VSS/Utils/String")

// get config
const getConfig = async () => {
    const defaultBaseUrl = "https://graph.dcdc.io/extensions/VSO_BP_Extension"
    const defaultconfig = {
        baseUrl: defaultBaseUrl,
        repositoryId: null,
        repositoryPath: null,
        repositoryType: null
    }
    const service = await VSS.getService<ExtensionDataService>(VSS.ServiceIds.ExtensionData)
    const savedconfig = await service.getValue("global.config")
    return { ...defaultconfig, ...savedconfig }
}

const main = async () => {
    const config = await getConfig()
    const projectId = VSS.getWebContext().project.id
    const projectName = VSS.getWebContext().project.name
    const gitclient = GitHttpClient.getClient()
    const tfclient = TfvcRestClient.getClient()
    const gitRepos = await gitclient.getRepositories(projectId)

    if (config.repositoryType == null) {

        const dlg = $("<div />")
        dlg.append(`<h3>Project: ${projectName}`)
        dlg.append(`<p>Where are your business process models stored?</p>`)

        const gitSelect = {
            enabled: gitRepos.length > 0,
            mode: "drop",
            source: gitRepos.map(r => r.name),
            width: "400px"
        } as Combos.IComboOptions

        const repType = {
            mode: "drop",
            source: [
                "TFS",
                "git"
            ],
            value: gitRepos.length > 0 ? "git" : "TFS",
            width: "400px",
            change() {
                gitSelectCtrl.setEnabled(this.getText() === "git")
            }
        } as Combos.IComboOptions

        $("<label />").text("Repository Type:").appendTo(dlg);
        const repTypeCtrl = Controls.create(Combos.Combo, dlg, repType)
        $("<label />").text("Git Repository:").appendTo(dlg);
        const gitSelectCtrl = Controls.create(Combos.Combo, dlg, gitSelect)

        Dialogs.show(Dialogs.ModalDialog, {
            content: dlg,
            title: "Configure",
            okCallback(result: any) {
                return
            }
        } as Dialogs.IModalDialogOptions)
    }

    return null
}

main()
