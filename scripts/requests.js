export class Requests {
    async fetchData(accName, datetime) {
        let url = `/ajax/getAccountStatistics.php?acc_name=${accName}&datetime=${datetime}`;
        try {
            let response = await fetch(url);
            let json = await response.json();
            if (response.status === 200 & !json.error) return json;
            if (typeof json.error === 'object')
                json.error = JSON.stringify(json.error);
            alert(`Error getting statistics for account:${accName}\n${json.error}`);
        } catch (error) {
            alert(`Error fetching data for account:${accName}\n${error}`);
        }
    }
}
