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
define(["require", "exports", "TFS/VersionControl/GitRestClient", "TFS/VersionControl/TfvcRestClient", "VSS/Controls", "VSS/Controls/Combos", "VSS/Controls/Dialogs"], function (require, exports, GitHttpClient, TfvcRestClient, Controls, Combos, Dialogs) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BusinessProcess = /** @class */ (function () {
        function BusinessProcess() {
        }
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
                            return [4 /*yield*/, service.getValue("global.config")];
                        case 2:
                            savedconfig = _a.sent();
                            return [2 /*return*/, __assign({}, defaultconfig, savedconfig)];
                    }
                });
            });
        };
        BusinessProcess.prototype.run = function () {
            return __awaiter(this, void 0, void 0, function () {
                var config, projectId, projectName, gitclient, tfclient, gitRepos, validate_1, repoId_1, dlg, gitSelect, repType, repTypeCtrl_1, gitSelectCtrl_1, dialog_1, ele;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getConfig()];
                        case 1:
                            config = _a.sent();
                            projectId = VSS.getWebContext().project.id;
                            projectName = VSS.getWebContext().project.name;
                            gitclient = GitHttpClient.getClient();
                            tfclient = TfvcRestClient.getClient();
                            return [4 /*yield*/, gitclient.getRepositories(projectId)];
                        case 2:
                            gitRepos = _a.sent();
                            if (config.repositoryType == null) {
                                validate_1 = function () { return (repTypeCtrl_1.getValue() === "TFS"
                                    || (repTypeCtrl_1.getValue() === "git" && gitRepos.some(function (x) { return x.name === gitSelectCtrl_1.getValue(); }))); };
                                repoId_1 = function () {
                                    var r = gitRepos.find(function (x) { return x.name === gitSelectCtrl_1.getValue(); });
                                    return r == null ? null : r.id;
                                };
                                dlg = $("<div />");
                                dlg.append("<h3>Project: " + projectName);
                                dlg.append("<p>Where are your business process models stored?</p>");
                                gitSelect = {
                                    enabled: gitRepos.length > 0,
                                    mode: "drop",
                                    source: gitRepos.map(function (r) { return r.name; }),
                                    width: "400px",
                                    change: function () {
                                        dialog_1.setDialogResult({
                                            repositoryId: repoId_1,
                                            repositoryType: repTypeCtrl_1.getValue()
                                        });
                                        dialog_1.updateOkButton(validate_1());
                                    }
                                };
                                repType = {
                                    mode: "drop",
                                    source: [
                                        "TFS",
                                        "git"
                                    ],
                                    value: gitRepos.length > 0 ? "git" : "TFS",
                                    width: "400px",
                                    change: function () {
                                        gitSelectCtrl_1.setEnabled(this.getText() === "git");
                                        dialog_1.setDialogResult({
                                            repositoryId: repoId_1,
                                            repositoryType: repTypeCtrl_1.getValue()
                                        });
                                        dialog_1.updateOkButton(validate_1());
                                    }
                                };
                                $("<label />").text("Repository Type:").appendTo(dlg);
                                repTypeCtrl_1 = Controls.create(Combos.Combo, dlg, repType);
                                $("<label />").text("Git Repository:").appendTo(dlg);
                                gitSelectCtrl_1 = Controls.create(Combos.Combo, dlg, gitSelect);
                                dialog_1 = Dialogs.show(Dialogs.ModalDialog, {
                                    content: dlg,
                                    title: "Configure",
                                    okCallback: function (result) {
                                        return __awaiter(this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                config = __assign({}, config, result);
                                                return [2 /*return*/];
                                            });
                                        });
                                    }
                                });
                                ele = dialog_1.getElement();
                                ele.on("input", "input", function (e) {
                                    dialog_1.updateOkButton(validate_1());
                                });
                            }
                            return [2 /*return*/, null];
                    }
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