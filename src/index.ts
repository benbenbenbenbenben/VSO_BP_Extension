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

    public get projectId(): string {
        return VSS.getWebContext().project.id
    }
    public get projectName(): string {
        return VSS.getWebContext().project.name
    }
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
        const savedconfig = await service.getValue("global_" + this.projectId)
        return { ...defaultconfig, ...savedconfig }
    }

    public async setConfig(config) {
        const service = await VSS.getService<ExtensionDataService>(VSS.ServiceIds.ExtensionData)
        await service.setValue("global_" + this.projectId, config)
    }

    public async run() {
        const self = this
        let config = await this.getConfig()
        const gitclient = GitHttpClient.getClient()
        const tfclient = TfvcRestClient.getClient()
        const gitRepos = await gitclient.getRepositories(this.projectId)

        if (config.repositoryType == null) {
            config = await this.promptForConfig(gitRepos, config);
        }
        // tslint:disable-next-line:no-console
        console.log("loaded BPM config: ", config)

        if (config.repositoryType === "git") {
            const files = await gitclient.getFilePaths(this.projectId, config.repositoryId, config.repositoryPath)
            // tslint:disable-next-line:no-console
            console.log(files)
        }
    }

    private async promptForConfig(gitRepos: VCContracts.GitRepository[], config: {
            baseUrl: string; repositoryId: any; repositoryPath: any; repositoryType: any;
        }): Promise<{baseUrl: string, repositoryId: string, repositoryPath: string, repositoryType: string}> {

        const self = this
        return new Promise<{baseUrl: string,
            repositoryId: string,
            repositoryPath: string,
            repositoryType: string}>((resolve, reject) => {
            const validate = () => (repTypeCtrl.getValue() === "TFS"
                || (repTypeCtrl.getValue() === "git" && gitRepos.some(x => x.name === gitSelectCtrl.getValue())));
            const repoId = () => {
                const r = gitRepos.find(x => x.name === gitSelectCtrl.getValue());
                return r == null ? null : r.id;
            };
            const dlg = $("<div />");
            dlg.append(`<h3>Project: ${this.projectName}`);
            dlg.append(`<p>Where are your business process models stored?</p>`);
            const gitSelect = {
                enabled: gitRepos.length > 0,
                mode: "drop",
                source: gitRepos.map(r => r.name),
                width: "400px",
                change() {
                    dialog.setDialogResult({
                        repositoryId: repoId(),
                        repositoryType: repTypeCtrl.getValue()
                    });
                    dialog.updateOkButton(validate());
                }
            } as Combos.IComboOptions;
            const repType = {
                mode: "drop",
                source: [
                    "TFS",
                    "git"
                ],
                value: gitRepos.length > 0 ? "git" : "TFS",
                width: "400px",
                change() {
                    gitSelectCtrl.setEnabled(this.getText() === "git");
                    dialog.setDialogResult({
                        repositoryId: repoId(),
                        repositoryType: repTypeCtrl.getValue()
                    });
                    dialog.updateOkButton(validate());
                }
            } as Combos.IComboOptions;
            $("<label />").text("Repository Type:").appendTo(dlg);
            const repTypeCtrl = Controls.create(Combos.Combo, dlg, repType);
            $("<label />").text("Git Repository:").appendTo(dlg);
            const gitSelectCtrl = Controls.create(Combos.Combo, dlg, gitSelect);
            const dialog = Dialogs.show(Dialogs.ModalDialog, {
                close: reject,
                content: dlg,
                title: "Configure",
                async okCallback(result: any) {
                    config = { ...config, ...result };
                    self.setConfig(config);
                    resolve(config)
                }
            } as Dialogs.IModalDialogOptions);
            const ele = dialog.getElement();
            ele.on("input", "input", e => {
                dialog.updateOkButton(validate());
            });
        })
    }
}

const bp = new BusinessProcess()
bp.run()
