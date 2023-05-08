import {Requests} from './requests.js';

window.addEventListener('DOMContentLoaded', () => {
    const delAccButton = document.querySelectorAll('.delaccount');
    delAccButton.forEach(button => {
        button.addEventListener('click', async (event) => {
            const socname = event.target.dataset.name;
            await delAccount(socname);
        });
    });

    const editAccButton = document.querySelectorAll('.editaccount');
    editAccButton.forEach(button => {
        button.addEventListener('click', async (event) => {
            const socname = event.target.dataset.name;
            await editAccount(socname);
        });
    });


    const loadingIcon = document.getElementById('loadingIcon');
    const addAccountButton = document.getElementById("addaccountbutton");
    addAccountButton.addEventListener('click', async (event) => {
        // Show the loading icon
        loadingIcon.style.display = 'inline-block';

        await addAccount();
        // Hide the loading icon
        loadingIcon.style.display = 'none';
    });
});

async function addAccount() {
    const name = document.add.name.value;
    const token = document.add.token.value;
    const cookies = document.add.cookies.value;
    const proxy = document.add.proxy.value;
    if (!await validate_form(name, token, cookies, proxy)) return;
    let resp = await Requests.post("ajax/addAccount.php",
        `name=${encodeURIComponent(name)}&token=${encodeURIComponent(token)}&cookies=${encodeURIComponent(cookies)}&proxy=${encodeURIComponent(proxy)}`
    );
    let checkResp = await Requests.checkResponse(resp, false);
    if (checkResp.success)
        window.location.reload();
    else alert(`Error adding account: ${checkResp.error}`);
}

async function editAccount(name) {
    let resp = await fetch(`ajax/editAccount.php?name=${name}`);
    let checkResp = await Requests.checkResponse(resp);
    if (checkResp.success) {
        document.add.name.value = checkResp.data.name;
        document.add.name.readonly = true;
        document.add.token.value = checkResp.data.token;
        document.add.cookies.value = JSON.stringify(checkResp.data.cookies);
        // Convert the proxy JSON object to a colon-separated string
        const proxyObj = checkResp.data.proxy;
        const proxyStr = `${proxyObj.type}:${proxyObj.ip}:${proxyObj.port}:${proxyObj.login}:${proxyObj.password}`;
        document.add.proxy.value = proxyStr;
    } else alert(`Error editing account: ${checkResp.error}`);
}

async function delAccount(name) {
    let resp = await fetch(`ajax/delAccount.php?name=${name}`);
    let checkResp = await Requests.checkResponse(resp, false);
    if (checkResp.success)
        window.location.reload();
    else alert(`Error deleting account: ${checkResp.error}`);
}

async function validate_form(name, token, cookies, proxy) {
    if (name === "" || token === "" || cookies === "" || proxy === "") {
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
    if (proxyElements.length !== 5) {
        alert("Proxy must be in the format 'type:ip:port:login:pass'!");
        return false;
    }

    const proxyType = proxyElements[0].toLowerCase();
    if (proxyType !== 'http' && proxyType !== 'socks') {
        alert("Proxy type must be either 'http' or 'socks'!");
        return false;
    }

    let resp = await Requests.post(
        "ajax/checkAccount.php",
        `name=${encodeURIComponent(name)}&token=${encodeURIComponent(token)}&cookies=${encodeURIComponent(cookies)}&proxy=${encodeURIComponent(proxy)}`
    );
    let checkResp = await Requests.checkResponse(resp);
    if (!checkResp.success) {
        alert(`Error checking account: ${checkResp.error}`);
        return false;
    }

    return true;
}