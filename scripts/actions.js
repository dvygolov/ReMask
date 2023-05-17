import {Requests} from "./requests.js";

export class Actions {
    static async sendAdAppeal(socname, accId, adId) {
        const resp = await Requests.post(
            "ajax/disapproveAppeal.php",
            `acc_name=${encodeURIComponent(socname)}&accid=${encodeURIComponent(accId)}&adid=${encodeURIComponent(adId)}`
        );
        let checkRes = await Requests.checkResponse(resp);
        if (checkRes.success)
            alert("Disapprove appeal sent!");
        else
            alert(`Error sending appeal: ${checkRes.error}`);
    }

    static async startAd(socname, adId) {
        const resp = await Requests.post(
            "ajax/startAd.php",
            `acc_name=${encodeURIComponent(socname)}&adid=${encodeURIComponent(adId)}`
        );
        let checkRes = await Requests.checkResponse(resp);
        if (checkRes.success)
            alert("Ad started!");
        else
            alert(`Error starting ad: ${checkRes.error}`);
    }

    static async stopAd(socname, adId) {
        const resp = await Requests.post(
            "ajax/stopAd.php",
            `acc_name=${encodeURIComponent(socname)}&adid=${encodeURIComponent(adId)}`
        );
        let checkRes = await Requests.checkResponse(resp);
        if (checkRes.success)
            alert("Ad stopped!");
        else
            alert(`Error stopping ad: ${checkRes.error}`);
    }

    static async sendAccAppeal(socname, accId) {
        const resp = await Requests.post(
            "ajax/policyAppeal.php",
            `acc_name=${encodeURIComponent(socname)}&accid=${encodeURIComponent(accId)}`
        );
        let checkRes = await Requests.checkResponse(resp);
        if (checkRes.success)
            alert("Appeal successfully sent!");
        else
            alert(`Error sending appeal: ${checkRes.error}`);
    }

    static async payUnsettled(socname, accId, paymentId, currency) {
        let sum = prompt("Enter money amount to pay:");
        if (!sum) return;
        const resp = await Requests.post(
            "ajax/payUnsettled.php",
            `acc_name=${encodeURIComponent(socname)}&accid=${encodeURIComponent(accId)}&paymentid=${paymentId}&sum=${sum}&currency=${currency}`
        );
        let checkRes = await Requests.checkResponse(resp);
        if (checkRes.success)
            alert("Payment processed successfully!");
        else
            alert(`Error processing payment: ${checkRes.error}`);
    }

    static downloadRules(accId) {
        let accWithRules = window.adAcounts.filter(acc => acc.id === accId);
        if (accWithRules.length != 1) {
            alert(`Can't find Ad Account with id ${accId}!`);
            return;
        }
        const fileName = prompt("Please enter the name for the the Rules JSON file:");

        if (!fileName) {
            return; // Exit if the user cancels or enters an empty file name
        }

        // Convert the JSON object to a string and create a Blob from it
        const jsonString = JSON.stringify(accWithRules[0].rules);
        const blob = new Blob([jsonString], {type: "application/json"});

        // Create a temporary download link and trigger the download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.json`;
        link.click();

        // Release the object URL after the download is triggered
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
    }

    static async deleteRules(socname, accId) {
        let rules = window.adAcounts.filter(acc => acc.id == accId)[0].rules.map(r => r.id).join(',');
        const resp = await Requests.post(
            "ajax/delRules.php",
            `acc_name=${encodeURIComponent(socname)}&rules=${encodeURIComponent(rules)}`
        );
        let checkRes = await Requests.checkResponse(resp);
        if (checkRes.success)
            alert("All rules deleted!");
        else
            alert(`Error deleting rules: ${checkRes.error}`);
    }

    static async uploadRules(socname, accId) {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".json";

        fileInput.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            if (file) {
                try {
                    const fileContent = await Actions.readFileAsText(file);
                    await Actions.sendRulesToServer(socname, accId, fileContent);
                } catch (error) {
                    console.error("Error while uploading rules:", error);
                }
            }
            // Remove the file input element after it's been used
            fileInput.remove();
        });

        // Trigger the file selection dialog
        fileInput.click();
    }

    static readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }

    static async sendRulesToServer(socname, accId, jsonString) {
        const resp = await Requests.post(
            "ajax/uploadRules.php",
            `acc_name=${encodeURIComponent(socname)}&accid=${encodeURIComponent(accId)}&rules=${encodeURIComponent(jsonString)}`
        );
        let checkRes = await Requests.checkResponse(resp);
        if (checkRes.success)
            alert("Rules uploaded successfully!");
        else
            alert(`Error uploading rules: ${checkRes.error}`);
    }
}