const readline = require("readline");
const request = require("request-promise");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const userName = "";
const password = "";
const projectName = "CATO";

function unwatchTicket(key, completed)
{
    const unwatchTicketUrl = "https://jira.tools.tax.service.gov.uk/rest/api/2/issue/" + key + "/watchers?username=" + userName;
    const unwatchTicketOptions =
    {
        "auth":
        {
            "user": userName,
            "pass": password
        },
        "method": "DELETE"
    };

    request(unwatchTicketUrl, unwatchTicketOptions).then(completed).catch(completed);
}

function unwatchTickets(tickets)
{
    let currentTicketIndex = 0;

    if (currentTicketIndex >= tickets.length)
        return;

    function onTicketUnwatched()
    {
        currentTicketIndex++;

        console.log("Unwatched ticket #" + currentTicketIndex);

        if (currentTicketIndex >= tickets.length)
            return;

        unwatchTicket(tickets[currentTicketIndex], onTicketUnwatched);
    }

    unwatchTicket(tickets[currentTicketIndex], onTicketUnwatched);
}

console.log("Finding tickets to un-watch...");

const searchQuery = "project = \"" + projectName + "\" AND id in watchedIssues()";
const searchUrl = "https://jira.tools.tax.service.gov.uk/rest/api/2/search?maxResults=99999&expand=name&jql=" + encodeURIComponent(searchQuery);
const searchOptions =
{
    "auth":
    {
        "user": userName,
        "pass": password
    }
};
request(searchUrl, searchOptions)
    .then(response =>
    {
        let responseObject = JSON.parse(response);
        let ticketsIds = responseObject.issues.map(issue => issue.key);

        rl.question("Found " + ticketsIds.length + " tickets. Are you sure you want to un-watch all of them? [Yes/No] ", answer =>
        {
            rl.close();

            if (answer.toLowerCase() != "yes")
            {
                console.log("Operation cancelled. Answered ", answer);
                return;
            }

            console.log("Starting the process of un-watching tickets...");

            unwatchTickets(ticketsIds);
        });
    });