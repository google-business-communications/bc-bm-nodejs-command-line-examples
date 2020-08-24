# BUSINESS COMMUNICATIONS: Command-Line Sample

This sample demonstrates how to use the Node.js SDK for performing operations
with the [Business Communications API](https://businesscommunications.googleapis.com)

This application assumes that you're signed up with
[Business Messages](https://developers.google.com/business-communications/business-messages/guides/set-up/register).

## PREREQUISITES

You must have the following software installed on your machine:

* [Node.js](https://nodejs.org/en/) - version 10 or above

## SETUP

Register with Business Messages:

    1.  Open [Google Cloud Console](https://console.cloud.google.com) with your
        Business Messages Google account and create a new project for your agent.

        Note the **Project ID** and **Project number** values.

    2.  Open the
        [Business Communications API](https://console.developers.google.com/apis/library/businesscommunications.googleapis.com)
        in the API Library.

    3.  Click **Enable**.

    4.  [Register your project](https://developers.google.com/business-communications/business-messages/guides/set-up/register)
        with Business Messages.

    5.  Create a service account.

        1.   Navigate to [Credentials](https://console.cloud.google.com/apis/credentials).

        2.   Click **Create service account**.

        3.   For **Service account name**, enter your agent's name, then click **Create**.

        4.   For **Select a role**, choose **Project** > **Editor**, the click **Continue**.

        5.   Under **Create key**, choose **JSON**, then click **Create**.

             Your browser downloads the service account key. Store it in a secure location.

    6.  Click **Done**.

    7.  Copy the JSON credentials file into this sample's /resources
        folder and rename it to "bc-agent-service-account-credentials.json".

## RUN THE SAMPLE

    1.  In a terminal, navigate to this sample's project directory.

    2.  Install dependencies listed in package.json with `npm install`.

    2.  Run the methods:
        *   Brand API example:

            node brand_sample.js

        *   Brand API example without brand deletion:

            node brand_sample.js NO-DELETE

            If the NO-DELETE argument exists, the brand that gets created by the
            sample will not be deleted.

        *   Agent API example:

            node agent_sample.js <BRAND_NAME>

            Replace BRAND_NAME with a valid brand ID in "brands/BRAND_ID" format.
            If you haven't created a brand, run the brand sample with the NO-DELETE
            argument to create a brand to reference.

        *   Agent API example without agent deletion:

            node agent_sample.js <BRAND_NAME> NO-DELETE

            Replace BRAND_NAME with a valid brand ID in "brands/BRAND_ID" format.
            If you haven't created a brand, run the brand sample with the NO-DELETE
            argument to create a brand to reference.

        *   Location API example:

            node location_sample.js <AGENT_NAME>

            Replace AGENT_NAME with a valid agent ID in "brands/BRAND_ID/agents/AGENT_ID" format.
            If you haven't created an agent, run the agent sample with the NO-DELETE
            argument to create an agent to reference.