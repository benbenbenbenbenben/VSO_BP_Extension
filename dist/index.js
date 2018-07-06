var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "TFS/VersionControl/GitRestClient", "TFS/VersionControl/TfvcRestClient", "VSS/Controls", "VSS/Controls/Combos", "VSS/Controls/Dialogs", "VSS/Controls/TreeView", "VSS/Utils/Url"], function (require, exports, GitHttpClient, TfvcRestClient, Controls, Combos, Dialogs, TreeView, Url_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BusinessProcess = /** @class */ (function () {
        function BusinessProcess() {
        }
        Object.defineProperty(BusinessProcess.prototype, "gitclient", {
            get: function () {
                return GitHttpClient.getClient();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BusinessProcess.prototype, "tfsclient", {
            get: function () {
                return TfvcRestClient.getClient();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BusinessProcess.prototype, "projectId", {
            get: function () {
                return VSS.getWebContext().project.id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BusinessProcess.prototype, "projectName", {
            get: function () {
                return VSS.getWebContext().project.name;
            },
            enumerable: true,
            configurable: true
        });
        // get config
        BusinessProcess.prototype.getConfig = function () {
            return __awaiter(this, void 0, void 0, function () {
                var defaultBaseUrl, defaultconfig, service, savedconfig;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            defaultBaseUrl = "https://graph.dcdc.io/drawio/src/main/webapp/";
                            defaultconfig = {
                                baseUrl: defaultBaseUrl,
                                repositoryId: null,
                                repositoryPath: null,
                                repositoryType: null
                            };
                            return [4 /*yield*/, VSS.getService(VSS.ServiceIds.ExtensionData)];
                        case 1:
                            service = _a.sent();
                            return [4 /*yield*/, service.getValue("global_" + this.projectId)];
                        case 2:
                            savedconfig = _a.sent();
                            return [2 /*return*/, __assign({}, defaultconfig, savedconfig)];
                    }
                });
            });
        };
        BusinessProcess.prototype.setConfig = function (config) {
            return __awaiter(this, void 0, void 0, function () {
                var service;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, VSS.getService(VSS.ServiceIds.ExtensionData)];
                        case 1:
                            service = _a.sent();
                            return [4 /*yield*/, service.setValue("global_" + this.projectId, config)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        BusinessProcess.prototype.isConfigComplete = function (config) {
            return config.baseUrl != null
                && config.repositoryId != null
                && config.repositoryPath != null
                && config.repositoryType != null;
        };
        BusinessProcess.prototype.run = function () {
            return __awaiter(this, void 0, void 0, function () {
                var self, config, gitRepos, content, basedocument, uri;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            self = this;
                            return [4 /*yield*/, this.getConfig()];
                        case 1:
                            config = _a.sent();
                            return [4 /*yield*/, this.gitclient.getRepositories(this.projectId)];
                        case 2:
                            gitRepos = _a.sent();
                            if (!(this.isConfigComplete(config) === false)) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.promptForConfig(gitRepos, config)];
                        case 3:
                            config = _a.sent();
                            _a.label = 4;
                        case 4:
                            // tslint:disable-next-line:no-console
                            console.log("loaded BPM config: ", config);
                            content = $("#content");
                            return [4 /*yield*/, this.gitclient.getItemContent(config.repositoryId, config.repositoryPath + "/README.md")
                                /*
                                ?lightbox=1
                                &highlight=0000ff
                                &edit=https%3A%2F%2Fgraph.dcdc.io%2Fdrawio%2Fsrc%2Fmain%2Fwebapp%2F%3Fui%3Dmin
                                &layers=1
                                &nav=1
                                #U<DATA> - gzipped or raw
                                */
                            ];
                        case 5:
                            basedocument = _a.sent();
                            uri = this.addUrlParameters(config.baseUrl, {
                                edit: "" + this.addUrlParameters(config.baseUrl, { ui: "min" }),
                                highlight: "0000ff",
                                layers: "1",
                                lightbox: "1",
                                nav: "1",
                                splash: "0",
                                ui: "min"
                            });
                            content.append("<iframe style='width:100%;height:100%' src='" + uri + "'></iframe>");
                            return [2 /*return*/];
                    }
                });
            });
        };
        BusinessProcess.prototype.getTree = function (config) {
            return __awaiter(this, void 0, void 0, function () {
                var files, tree, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(config.type === "git")) return [3 /*break*/, 4];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.gitclient.getFilePaths(this.projectId, config.repositoryId, config.repositoryPath)];
                        case 2:
                            files = _a.sent();
                            tree = files.paths
                                // tslint:disable-next-line:max-line-length
                                .map(function (path) { return ({ name: path.split("/").reverse()[0], path: path.split("/").reverse().slice(1).reverse() }); })
                                .reduce(function (obj, el) {
                                var orig = obj;
                                var _loop_1 = function (key) {
                                    var found = obj.find(function (e) { return e.name === key; });
                                    if (found) {
                                        obj = found.children;
                                    }
                                    else {
                                        var temp = { name: key, children: [] };
                                        obj.push(temp);
                                        obj = temp.children;
                                    }
                                };
                                for (var _i = 0, _a = el.path; _i < _a.length; _i++) {
                                    var key = _a[_i];
                                    _loop_1(key);
                                }
                                obj.push(el.name);
                                return orig;
                            }, []);
                            tree = [{ name: "root", children: tree }];
                            return [2 /*return*/, this.convertToTreeNodes(tree)];
                        case 3:
                            e_1 = _a.sent();
                            return [2 /*return*/, null];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        BusinessProcess.prototype.addUrlParameters = function (url, parameters) {
            var uri = new Url_1.Uri(url);
            for (var key in parameters) {
                if (parameters.hasOwnProperty(key)) {
                    uri.addQueryParam(key, parameters[key], true);
                }
            }
            return uri.absoluteUri;
        };
        BusinessProcess.prototype.convertToTreeNodes = function (items) {
            var _this = this;
            return items.map(function (item) {
                // const node = { name: item.name || item }
                var node = new TreeView.TreeNode(item.name || item);
                node.type = item.name ? "folder" : "file";
                // node.expanded = item.expanded;
                if (item.children && item.children.length > 0) {
                    node.addRange(_this.convertToTreeNodes(item.children));
                    // node.children = convertToTreeNodes(item.children)
                }
                return node;
            });
        };
        BusinessProcess.prototype.promptForConfig = function (gitRepos, config) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                var self;
                return __generator(this, function (_a) {
                    self = this;
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var treeSelectedFolder = function () {
                                var sel = treeCtrl.getSelectedNode();
                                if (sel) {
                                    return sel.type === "folder" ? sel.path(null, null) : sel.parent.path(null, null);
                                }
                                return null;
                            };
                            var isValid = function () { return (repTypeCtrl.getValue() === "TFS" || (repTypeCtrl.getValue() === "git"
                                && gitRepos.some(function (x) { return x.name === gitSelectCtrl.getValue(); }))
                                && treeCtrl.getSelectedNode() != null
                                && treeCtrl.getSelectedNode().type != null); };
                            var validate = function () { return __awaiter(_this, void 0, void 0, function () {
                                var oldRepositoryType, newRepositoryType, oldGitRepository, newGitRepository, oldRepositoryPath, newRepositoryPath, nodes, valid;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            oldRepositoryType = dialog.getDialogResult() ? dialog.getDialogResult().repositoryType : null;
                                            newRepositoryType = repTypeCtrl.getText();
                                            oldGitRepository = dialog.getDialogResult() ? dialog.getDialogResult().repositoryId : null;
                                            newGitRepository = repoId();
                                            oldRepositoryPath = dialog.getDialogResult() ? dialog.getDialogResult().repositoryPath : null;
                                            newRepositoryPath = treeSelectedFolder();
                                            gitSelectCtrl.setEnabled(newRepositoryType === "git");
                                            dialog.setDialogResult({
                                                repositoryId: newGitRepository,
                                                repositoryPath: newRepositoryPath,
                                                repositoryType: newRepositoryType
                                            });
                                            if (!((newRepositoryType !== oldRepositoryType)
                                                || (newGitRepository !== oldGitRepository))) return [3 /*break*/, 2];
                                            if (!(newRepositoryType === "git")) return [3 /*break*/, 2];
                                            treeCtrl.rootNode.clear();
                                            return [4 /*yield*/, this.getTree({
                                                    repositoryId: newGitRepository, repositoryPath: null, type: "git"
                                                })];
                                        case 1:
                                            nodes = _a.sent();
                                            if (nodes == null) {
                                                nodes = [new TreeView.TreeNode("<no repository>")];
                                            }
                                            treeCtrl.rootNode.addRange(nodes);
                                            treeCtrl.updateNode(treeCtrl.rootNode);
                                            return [3 /*break*/, 2];
                                        case 2:
                                            valid = isValid();
                                            dialog.updateOkButton(valid);
                                            return [2 /*return*/];
                                    }
                                });
                            }); };
                            var repoId = function () {
                                var r = gitRepos.find(function (x) { return x.name === gitSelectCtrl.getValue(); });
                                return r == null ? null : r.id;
                            };
                            var dlg = $("<div />");
                            dlg.append("<h3>Project: " + _this.projectName);
                            dlg.append("<p>Where are your business process models stored?</p>");
                            var gitSelect = {
                                enabled: gitRepos.length > 0,
                                mode: "drop",
                                source: gitRepos.map(function (r) { return r.name; }),
                                width: "400px",
                                change: function () {
                                    validate();
                                }
                            };
                            var repType = {
                                mode: "drop",
                                source: [
                                    "TFS",
                                    "git"
                                ],
                                value: gitRepos.length > 0 ? "git" : "TFS",
                                width: "400px",
                                change: function () {
                                    validate();
                                }
                            };
                            $("<label />").text("Repository Type:").appendTo(dlg);
                            var repTypeCtrl = Controls.create(Combos.Combo, dlg, repType);
                            $("<label />").text("Git Repository:").appendTo(dlg);
                            var gitSelectCtrl = Controls.create(Combos.Combo, dlg, gitSelect);
                            var dialog = Dialogs.show(Dialogs.ModalDialog, {
                                close: reject,
                                content: dlg,
                                title: "Configure",
                                okCallback: function (result) {
                                    return __awaiter(this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            config = __assign({}, config, result);
                                            self.setConfig(config);
                                            resolve(config);
                                            return [2 /*return*/];
                                        });
                                    });
                                }
                            });
                            $("<label />").text("Root Directory:").appendTo(dlg);
                            var treeCtrl = Controls.create(TreeView.TreeView, dlg, { width: "400px" });
                            var ele = dialog.getElement();
                            ele.on("input", "input", function (e) {
                                validate();
                            });
                            dlg.bind("selectionchanged", function () { return validate(); });
                        })];
                });
            });
        };
        return BusinessProcess;
    }());
    exports.BusinessProcess = BusinessProcess;
    var bp = new BusinessProcess();
    bp.run();
});
//# sourceMappingURL=index.js.map