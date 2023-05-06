async function addAccount() {
    const name = document.add.name.value;
    const token = document.add.token.value;
    const cookies = document.add.cookies.value;
    const proxy = document.add.proxy.value;
    if (!await validate_form(name,token,cookies,proxy)) return;
    let resp = await fetch("ajax/addAccount.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `name=${encodeURIComponent(name)}&token=${encodeURIComponent(token)}&cookies=${encodeURIComponent(cookies)}&proxy=${encodeURIComponent(proxy)}`,
    });
    window.location.reload();
}

async function delAccount(name) {
    let resp = await fetch(`ajax/delAccount.php?name=${name}`);
    window.location.reload();
}

async function validate_form(name,token,cookies,proxy) {
    if (name === "" || token === "" || cookies === "") {
        alert("You need to fill ALL fields!");
        return false;
    }

    let cookiesParsed;
    try {
        cookiesParsed = JSON.parse(cookies);
    } catch (e) {
        alert("Cookies must be a valid JSON array!");
        return false;
    }
    if (!(Array.isArray(cookiesParsed))) {
        alert("Cookies must be a JSON array!");
        return false;
    }

    let hasCUserCookie = false;
    for (const cookie of cookiesParsed) {
        if (!cookie.hasOwnProperty("name") || !cookie.hasOwnProperty("value")) {
            alert("Each cookie in the JSON array must have a 'name' and a 'value' field!");
            return false;
        }
        if (cookie.name === "c_user") {
            hasCUserCookie = true;
        }
    }

    if (!hasCUserCookie) {
        alert("The JSON array must contain a cookie with the 'name' field set to 'c_user'!");
        return false;
    }

    if (!token.startsWith("EAAB")) {
        alert("Token must start with 'EAAB'!");
        return false;
    }

    const proxyElements = proxy.split(':');
    if (proxyElements.length !== 4) {
        alert("Proxy must be in the format 'ip:port:login:pass'!");
        return false;
    }

    let resp = await fetch("ajax/checkAccount.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `name=${encodeURIComponent(name)}&token=${encodeURIComponent(token)}&cookies=${encodeURIComponent(cookies)}&proxy=${encodeURIComponent(proxy)}`,
    });
    if (resp.status === 200) {
        let t = await resp.text();
        let json;
        try{
           json = JSON.parse(t);
        }
        catch{
           alert(`Error parsing response JSON: ${t}`);
           return false;
        }
        if (json.error){
            if (typeof json.error === 'object')
                json.error = JSON.stringify(json.error);
            alert(`Got error: ${json.error}!`);
            return false;
        }
        return true;
    } else {
        alert(`Got error ${resp.status} from the server!`);
        return false;
    }
    return true;
}