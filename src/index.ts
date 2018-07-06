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
import TreeView = require("VSS/Controls/TreeView")
import { ExtensionDataService } from "VSS/SDK/Services/ExtensionData"
import Utils_String = require("VSS/Utils/String")
import { Uri } from "VSS/Utils/Url";

export class BusinessProcess {

    public get gitclient() {
        return GitHttpClient.getClient()
    }
    public get tfsclient() {
        return TfvcRestClient.getClient()
    }
    public get projectId(): string {
        return VSS.getWebContext().project.id
    }
    public get projectName(): string {
        return VSS.getWebContext().project.name
    }
    // get config
    public async getConfig() {
        const defaultBaseUrl = "https://graph.dcdc.io/drawio/src/main/webapp/"
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

    public isConfigComplete(config) {
        return config.baseUrl != null
            && config.repositoryId != null
            && config.repositoryPath != null
            && config.repositoryType != null
    }

    public async run() {
        const self = this
        let config = await this.getConfig()
        const gitRepos = await this.gitclient.getRepositories(this.projectId)

        if (this.isConfigComplete(config) === false) {
            config = await this.promptForConfig(gitRepos, config);
        }
        // tslint:disable-next-line:no-console
        console.log("loaded BPM config: ", config)

        // load UI
        const content = $("#content")
        const rootFilePaths = await this.gitclient.getFilePaths(this.projectId,
            config.repositoryId, config.repositoryPath.substring(5))
        const rootXmlFiles = rootFilePaths.paths.filter(path => path.endsWith(".xml"))
        const basedocument = await this.gitclient.getItemText(config.repositoryId,
            rootXmlFiles[0])
        /*
        ?lightbox=1
        &highlight=0000ff
        &edit=https%3A%2F%2Fgraph.dcdc.io%2Fdrawio%2Fsrc%2Fmain%2Fwebapp%2F%3Fui%3Dmin
        &layers=1
        &nav=1
        #U<DATA> - gzipped or raw
        */
        const uri = this.addUrlParameters(config.baseUrl, {
            cors: ".",
            edit: `${this.addUrlParameters(config.baseUrl, { ui: "min" })}`,
            highlight: "0000ff",
            layers: "1",
            lightbox: "1",
            nav: "1",
            splash: "0",
            ui: "min"
        })
        // tslint:disable-next-line:max-line-length
        const base64String = "#R" + encodeURIComponent(basedocument);
        content.append(`<iframe style='width:100%;height:100%' src='${uri}'></iframe>`)
    }

    public async getTree(config) {
        if (config.type === "git") {
            try {
                const files = await this.gitclient.getFilePaths(this.projectId,
                    config.repositoryId)
                let tree = files.paths
                    // tslint:disable-next-line:max-line-length
                    .map(path => ({ name: path.split("/").reverse()[0], path: path.split("/").reverse().slice(1).reverse() }))
                    .reduce((obj, el) => {
                        const orig = obj;
                        for (const key of el.path) {
                            const found = obj.find(e => e.name === key)
                            if (found) {
                                obj = found.children
                            } else {
                                const temp = {name: key, children: []}
                                obj.push(temp)
                                obj = temp.children
                            }
                        }
                        obj.push(el.name)
                        return orig;
                }, [])
                tree = [{ name: "root", children: tree }]
                return this.convertToTreeNodes(tree)
            } catch (e) {
                return null;
            }
        }
    }

    private addUrlParameters(url: string, parameters: object) {
        const uri = new Uri(url)
        for (const key in parameters) {
            if (parameters.hasOwnProperty(key)) {
                uri.addQueryParam(key, parameters[key], true)
            }
        }
        return uri.absoluteUri
    }

    private convertToTreeNodes(items) {
        return items.map((item) => {
            // const node = { name: item.name || item }
            const node = new TreeView.TreeNode(item.name || item)
            node.type = item.name ? "folder" : "file"
            // node.expanded = item.expanded;
            if (item.children && item.children.length > 0) {
              node.addRange(this.convertToTreeNodes(item.children));
              // node.children = convertToTreeNodes(item.children)
            }
            return node;
          });
    }

    private async promptForConfig(gitRepos: VCContracts.GitRepository[], config: {
            baseUrl: string; repositoryId: any; repositoryPath: any; repositoryType: any;
        }): Promise<{baseUrl: string, repositoryId: string, repositoryPath: string, repositoryType: string}> {

        const self = this
        return new Promise<{baseUrl: string,
            repositoryId: string,
            repositoryPath: string,
            repositoryType: string}>((resolve, reject) => {
            const treeSelectedFolder = () => {
                const sel = treeCtrl.getSelectedNode()
                if (sel) {
                    return sel.type === "folder" ? sel.path(null, null) : sel.parent.path(null, null)
                }
                return null
            }
            const isValid = () => (
                repTypeCtrl.getValue() === "TFS" || (repTypeCtrl.getValue() === "git"
                 && gitRepos.some(x => x.name === gitSelectCtrl.getValue()))
                 && treeCtrl.getSelectedNode() != null
                 && treeCtrl.getSelectedNode().type != null
            )
            const validate = async () => {
                const oldRepositoryType = dialog.getDialogResult() ? dialog.getDialogResult().repositoryType : null
                const newRepositoryType = repTypeCtrl.getText()
                const oldGitRepository = dialog.getDialogResult() ? dialog.getDialogResult().repositoryId : null
                const newGitRepository = repoId()
                const oldRepositoryPath = dialog.getDialogResult() ? dialog.getDialogResult().repositoryPath : null
                const newRepositoryPath = treeSelectedFolder()
                gitSelectCtrl.setEnabled(newRepositoryType === "git")
                dialog.setDialogResult({
                    repositoryId: newGitRepository,
                    repositoryPath: newRepositoryPath,
                    repositoryType: newRepositoryType
                })
                // change tree if we've changed repo type
                if ((newRepositoryType !== oldRepositoryType)
                || (newGitRepository !== oldGitRepository)) {
                    if (newRepositoryType === "git") {
                        treeCtrl.rootNode.clear()
                        let nodes = await this.getTree({
                            repositoryId: newGitRepository, repositoryPath: null, type: "git"
                        })
                        if (nodes == null) {
                            nodes = [new TreeView.TreeNode("<no repository>")]
                        }
                        treeCtrl.rootNode.addRange(nodes)
                        treeCtrl.updateNode(treeCtrl.rootNode)
                    } else {
                        // TODO: update tree for TFS
                    }
                }
                const valid = isValid()
                dialog.updateOkButton(valid)
            }
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
                    validate()
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
                    validate()
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
            $("<label />").text("Root Directory:").appendTo(dlg);
            const treeCtrl = Controls.create(TreeView.TreeView, dlg, { width: "400px" })
            const ele = dialog.getElement();
            ele.on("input", "input", e => {
                validate()
            });
            dlg.bind("selectionchanged", () => validate())
        })
    }
}

const bp = new BusinessProcess()
bp.run()
