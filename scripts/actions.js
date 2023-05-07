export class Actions {
    static sendAdAppeal(socname, adId) {
    }

    static startAd(socname, adId) {
    }

    static stopAd(socname, adId) {
    }

    static sendAccAppeal(socname, accId) {
    }

    static payUnsettled(socname, accId) {
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
        try {
            const response = await fetch("your_php_script.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    socname: socname,
                    accId: accId,
                    rules: jsonString
                }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const responseData = await response.json();
            alert("Rules uploaded successfully!");
        } catch (error) {
            alert("Error while sending rules to server:" + error);
        }
    }
}