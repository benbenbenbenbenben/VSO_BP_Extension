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

export class BusinessProcess {

    // get config
    public async getConfig() {
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

    public async run() {
        let config = await this.getConfig()
        const projectId = VSS.getWebContext().project.id
        const projectName = VSS.getWebContext().project.name
        const gitclient = GitHttpClient.getClient()
        const tfclient = TfvcRestClient.getClient()
        const gitRepos = await gitclient.getRepositories(projectId)

        if (config.repositoryType == null) {

            const validate = () => (repType.value === "TFS"
                || (repTypeCtrl.getValue() === "git" && gitRepos.some(x => x.name === gitSelectCtrl.getValue())))

            const dlg = $("<div />")
            dlg.append(`<h3>Project: ${projectName}`)
            dlg.append(`<p>Where are your business process models stored?</p>`)

            const gitSelect = {
                enabled: gitRepos.length > 0,
                mode: "drop",
                source: gitRepos.map(r => r.name),
                width: "400px",
                change() {
                    dialog.setDialogResult({
                        repositoryId: gitRepos.find(x => x.name === gitSelectCtrl.getValue()).id,
                        repositoryType: repTypeCtrl.getValue()
                    })
                    dialog.updateOkButton(validate())
                }
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
                    dialog.setDialogResult({
                        repositoryId: gitRepos.find(x => x.name === gitSelectCtrl.getValue()).id,
                        repositoryType: repTypeCtrl.getValue()
                    })
                    dialog.updateOkButton(validate())
                }
            } as Combos.IComboOptions

            $("<label />").text("Repository Type:").appendTo(dlg);
            const repTypeCtrl = Controls.create(Combos.Combo, dlg, repType)
            $("<label />").text("Git Repository:").appendTo(dlg);
            const gitSelectCtrl = Controls.create(Combos.Combo, dlg, gitSelect)

            const dialog = Dialogs.show(Dialogs.ModalDialog, {
                content: dlg,
                title: "Configure",
                async okCallback(result: any) {
                    config = {...config, ...result}
                }
            } as Dialogs.IModalDialogOptions)
            const ele = dialog.getElement()
            ele.on("input", "input", e => {
                dialog.updateOkButton(validate())
            })

        }

        return null
    }
}

const bp = new BusinessProcess()
bp.run()
