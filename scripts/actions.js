export class Actions {
    static sendAdAppeal(adId) {
    }

    static startAd(adId) {
    }

    static stopAd(adId) {
    }

    static sendAccAppeal(accId) {
    }

    static payUnsettled(accId) {
    }

    static downloadRules(accId) {
        let accWithRules = window.adAcounts.filter(acc=>acc.id===accId);
        if (accWithRules.length!=1){
            alert(`Can't find Ad Account with id ${accId}!`);
            return;
        }
        const fileName = prompt("Please enter the name for the the Rules JSON file:");

        if (!fileName) {
            return; // Exit if the user cancels or enters an empty file name
        }

        // Convert the JSON object to a string and create a Blob from it
        const jsonString = JSON.stringify(accWithRules[0].rules);
        const blob = new Blob([jsonString], { type: "application/json" });

        // Create a temporary download link and trigger the download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.json`;
        link.click();

        // Release the object URL after the download is triggered
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
    }


    static uploadRules(accId) {
    }
}