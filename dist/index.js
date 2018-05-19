define(["require", "exports", "TFS/VersionControl/GitRestClient"], function (require, exports, GitHttpClient) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var projectId = VSS.getWebContext().project.id;
    var client = GitHttpClient.getClient();
    client.getRepositories(projectId).then(function (repos) {
        repos.forEach(console.log);
    });
});
