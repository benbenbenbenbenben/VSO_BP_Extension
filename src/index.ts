import Utils_String = require("VSS/Utils/String")
import Controls = require("VSS/Controls")
import VCContracts = require("TFS/VersionControl/Contracts")
import GitHttpClient = require("TFS/VersionControl/GitRestClient")
import BuildContracts = require("TFS/Build/Contracts")
import WitContracts = require("TFS/WorkItemTracking/Contracts")
import WitClient = require("TFS/WorkItemTracking/RestClient")

var projectId = VSS.getWebContext().project.id
var client = GitHttpClient.getClient()

client.getRepositories(projectId).then(repos => {
    repos.forEach(console.log)
})
