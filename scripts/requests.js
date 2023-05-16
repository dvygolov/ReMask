export class Requests {
    static async getStats(accName, datetime) {
        let url = `/ajax/getAccountStatistics.php?acc_name=${accName}&datetime=${datetime}`;
        let resp = await fetch(url);
        let checkRes = await this.checkResponse(resp);
        if (checkRes.success) return checkRes.data;
        alert(`${accName}: ${checkRes.error}`);
        return null;
    }

    static async post(url, body) {
        return await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body
        });
    }

    static async checkResponse(resp, getBody = true) {
        if (resp.status === 200) {
            if (!getBody) return {success: true};
            let t = await resp.text();
            let json;
            try {
                json = JSON.parse(t);
            } catch {
                return {success: false, error: `Error parsing response JSON: ${t}`};
            }
            if (json.error) {
                if (typeof json.error === 'object')
                    json.error = JSON.stringify(json.error);
                else if (Number.isInteger(json.error) && json.errorDescription && json.errorSummary)
                    json.error = `${json.errorSummary}: ${json.errorDescription}`;
                return {success: false, error: json.error};
            }
            return {success: true, data: json};
        } else {
            return {success: false, error: `Got error ${resp.status} from the server!`};
        }
    }
}
