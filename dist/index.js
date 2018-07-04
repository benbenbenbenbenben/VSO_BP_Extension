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
define(["require", "exports", "TFS/VersionControl/GitRestClient", "TFS/VersionControl/TfvcRestClient", "VSS/Controls", "VSS/Controls/Combos", "VSS/Controls/Dialogs", "VSS/Controls/TreeView"], function (require, exports, GitHttpClient, TfvcRestClient, Controls, Combos, Dialogs, TreeView) {
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
                            defaultBaseUrl = "https://graph.dcdc.io/extensions/VSO_BP_Extension";
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
                var self, config, gitRepos;
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
                            if (config.repositoryType === "git") {
                                // const files = await gitclient.getFilePaths(this.projectId, config.repositoryId, config.repositoryPath)
                                // tslint:disable-next-line:no-console
                                console.log(this.getTree(config));
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        BusinessProcess.prototype.getTree = function (config) {
            return __awaiter(this, void 0, void 0, function () {
                var files, tree;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(config.type === "git")) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.gitclient.getFilePaths(this.projectId, config.repositoryId, config.repositoryPath)];
                        case 1:
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
                            return [2 /*return*/, this.convertToTreeNodes(tree)];
                        case 2: return [2 /*return*/];
                    }
                });
            });
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
                            var isValid = function () { return (repTypeCtrl.getValue() === "TFS"
                                || (repTypeCtrl.getValue() === "git" && gitRepos.some(function (x) { return x.name === gitSelectCtrl.getValue(); }))); };
                            var validate = function () { return __awaiter(_this, void 0, void 0, function () {
                                var valid, _a, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            valid = isValid();
                                            gitSelectCtrl.setEnabled(repTypeCtrl.getText() === "git");
                                            dialog.setDialogResult({
                                                repositoryId: repoId(),
                                                repositoryType: repTypeCtrl.getValue()
                                            });
                                            if (!valid) return [3 /*break*/, 2];
                                            if (!(repTypeCtrl.getText() === "git")) return [3 /*break*/, 2];
                                            treeCtrl.rootNode.clear();
                                            _b = (_a = treeCtrl.rootNode).addRange;
                                            return [4 /*yield*/, this.getTree({
                                                    repositoryId: repoId(), repositoryPath: null, type: "git"
                                                })];
                                        case 1:
                                            _b.apply(_a, [_c.sent()]);
                                            treeCtrl.updateNode(treeCtrl.rootNode);
                                            _c.label = 2;
                                        case 2:
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