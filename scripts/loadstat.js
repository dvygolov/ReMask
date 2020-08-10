var datetime,token,show,parent;
var allTResult = 0;
var allTSpent = 0;
var allTCPL = [];
var allTCPM = [];
var allTCTR = [];
var allTCPC = [];

function loadAllStatistics() {
    datetime = document.getElementById('selectbox1').value;
    token = document.getElementById('selectbox2').value;
    show = document.getElementById('selectbox3').value; //active or all
    parent = document.getElementById('statBody');

    //add thread
    var tr = document.createElement('tr');
    tr.innerHTML = '<tr><th>Креатив</th><th>Название/ссылка/пиксель</th><th>Статус/причина отклона</th><th>Показы</th><th>Клики</th><th>Результаты</th><th>Потрачено</th><th>CPL</th><th>CPM</th><th>CTR</th><th>CPC</th></tr>';
    parent.appendChild(tr);

    var selectData = [];
    $('#selectbox2 option').each(function () {
        selectData.push([$(this).text(), $(this).val()]);
    });

    allTResult = 0;
    allTSpent = 0;
    allTCPL = [];
    allTCPM = [];
    allTCTR = [];
    allTCPC = [];

    if (token == 'all') {
        for (idx = 1; idx < selectData.length; idx++) {
            load(selectData[idx]);
        }
    } else if (token != 'all') {
        var oneData = [$('#selectbox2').find(":selected").text(), $('#selectbox2').find(":selected").val()];
        load(oneData);
    }
}

function load(arr) {
    var acc_name = arr[0];
    var access_token = arr[1];

    var disable_reasons = ['', 'ADS_INTEGRITY_POLICY', 'ADS_IP_REVIEW', 'RISK_PAYMENT', 'GRAY_ACCOUNT_SHUT_DOWN', 'ADS_AFC_REVIEW', 'BUSINESS_INTEGRITY_RAR', 'PERMANENT_CLOSE', 'UNUSED_RESELLER_ACCOUNTR'];
    var account_statuses = {
        1: 'ACTIVE',
        2: 'DISABLED',
        3: 'UNSETTLED',
        7: 'PENDING_RISK_REVIEW',
        8: 'PENDING_SETTLEMENT',
        9: 'IN_GRACE_PERIOD',
        100: 'PENDING_CLOSURE',
        101: 'CLOSED',
        201: 'ANY_ACTIVE',
        202: 'ANY_CLOSED'
    };

    var xhr = new XMLHttpRequest();
    xhr.open("GET", 'https://graph.facebook.com/v5.0/me/adaccounts?fields=adspixels,promote_pages{access_token,id},insights.date_preset(' + datetime + '),ads.date_preset(' + datetime + ').time_increment(' + datetime + ').limit(500){insights.limit(500).date_preset(' + datetime + '){results,relevance_score,inline_link_click_ctr,inline_link_clicks,ctr,cpc,cpm},creative{effective_object_story_id,effective_instagram_story_id,actor_id},adlabels,created_time,recommendations,updated_time,ad_review_feedback,bid_info,configured_status,delivery_info,status,effective_status,adcreatives.limit(500){place_page_set_id,object_story_spec{instagram_actor_id,link_data{link},page_id},image_crops,image_url,status,thumbnail_url},result,cost_per_lead_fb,name,clicks,spent,cost_per,reach,link_ctr,impressions},date{' + datetime + '},funding_source_details,business{name,link},adrules_library{name},current_unbilled_spend,adspaymentcycle,spend_cap,amount_spent,age,disable_reason,account_status,balance,all_payment_methods{pm_credit_card{account_id,credential_id,display_string,exp_month,exp_year}},currency,timezone_name,created_time,name,status,adtrust_dsl&locale=ru_RU&access_token=' + access_token, true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status == 400) {
                var json = JSON.parse(xhr.responseText);

                if (token != 'all') {
                    alert(json.error.message);
                } else console.log("%c%s%c: %c%s", "color: blue", acc_name, "background: inherit;", "font-weight: bold; color: red; font-style: italic;", json.error.message)
            }
        }

        if (xhr.readyState == 4) {
            var accounts = JSON.parse(xhr.responseText);
            for (var account in accounts['data']) {

                var username = accounts.data[account]['name'];
                var account_status = accounts.data[account]['account_status'];
                var disable_reason = accounts.data[account]['disable_reason'];
                var adtrust_dsl = accounts.data[account]['adtrust_dsl'];
                var currency = accounts.data[account]['currency'];
                var id = accounts.data[account]['id'];
                var bill, currunbilled = "";
                var billing = "";
                var card = "";
                if (accounts.data[account]['ads']) {
                    if (accounts.data[account]['adspaymentcycle']['data'][0]['threshold_amount']) {
                        bill = parseFloat(accounts.data[account]['adspaymentcycle']['data'][0]['threshold_amount']);
                        billing = '/' + mathMoney(bill).toString();
                    }

                    if (accounts.data[account]['current_unbilled_spend']['amount'])
                        currunbilled = '/' + accounts.data[account]['current_unbilled_spend']['amount'];

                    if ('funding_source_details' in accounts.data[account])
                        if ('display_string' in accounts.data[account]['funding_source_details'])
                            card = ' (' + accounts.data[account]['funding_source_details']['display_string'] + ' ' + currency + ')';
                }
                //colors
                var ascolor = 'red';
                if (account_status === 1 | account_status == 'ACTIVE') ascolor = 'Lime';

                var dscolor = 'red';
                if (disable_reason === 0) dscolor = 'Lime';

                //add thead of ad account
                var sep = '';
                if (disable_reason !== 0) sep = ' - ';

                var aname = "";
                if (acc_name !== "") aname = acc_name + ": ";

                var pixelid = '';
                if ('adspixels' in accounts.data[account])
                    pixelid = accounts.data[account]['adspixels']['data'][0]['id'];

                //"date_start": "2020-04-24",
                //  "date_stop": "2020-04-29",
                ///  "impressions": "189",
                // "spend": "59.93"

                //insights
                var rkid = '';
                var rkstart = '';
                var rkstop = '';
                var rkspent = '';
                if ('insights' in accounts.data[account]) {
                    rkid = accounts.data[account]['insights']['data'][0]['account_id'];
                    rkstart = accounts.data[account]['insights']['data'][0]['date_start'];
                    rkstop = accounts.data[account]['insights']['data'][0]['date_stop'];
                    rkspent = accounts.data[account]['insights']['data'][0]['spend'];
                }

                var tr = document.createElement('tr');
                tr.id = id;
                tr.className = 'poster';
                if (show === 'active') {
                    if (account_status === 1 && disable_reason === 0) {
                        tr.style = 'box-shadow: rgba(15, 17, 19, 0.63) 0px 0px 20px 2px;';
                        tr.innerHTML = '<td colspan="3"><div class="descr">Старт: ' + rkstart + ' | Стоп: ' + rkstop + '<br>Всего откручено: ' + rkspent + '<br>Айди рк: ' + rkid + '<br>Пиксель: ' + pixelid + '<br></div>' + aname + username + ' (<span style="color:' + ascolor + '">' + account_statuses[account_status] + '</span>' + sep + '<span style="color:' + dscolor + '">' + disable_reasons[disable_reason] + "</span>) - " + adtrust_dsl + billing + currunbilled + card + '</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
                    }
                } else {
                    tr.style = 'box-shadow: rgba(15, 17, 19, 0.63) 0px 0px 20px 2px;';
                    tr.innerHTML = '<td colspan="3"><div class="descr">Старт: ' + rkstart + ' | Стоп: ' + rkstop + '<br>Всего откручено: ' + rkspent + '<br>Айди рк: ' + rkid + '<br>Пиксель: ' + pixelid + '<br></div>' + aname + username + ' (<span style="color:' + ascolor + '">' + account_statuses[account_status] + '</span>' + sep + '<span style="color:' + dscolor + '">' + disable_reasons[disable_reason] + "</span>) - " + adtrust_dsl + billing + currunbilled + card + '</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
                }
                parent.appendChild(tr);

                var tImpressions = 0;
                var tClicks = 0;
                var tResult = 0;
                var tSpent = 0;
                var tCPL = [];
                var tCPM = [];
                var tCTR = [];
                var tCPC = [];

                if (accounts.data[account]['ads']) {
                    for (var ads in accounts.data[account]['ads']) {
                        var adsObj = accounts.data[account]['ads'][ads];
                        for (var adss in adsObj) {
                            if (accounts.data[account]['ads'][ads][adss]['status']) {
                                var acc_status = account_statuses[account_status];
                                var dis_reason = disable_reasons[disable_reason];
                                var effective_status = accounts.data[account]['ads'][ads][adss]['effective_status'];

                                var fullimage_url = '';
                                if (accounts.data[account]['ads'][ads][adss]['adcreatives']['data'][0]['image_url'])
                                    fullimage_url = accounts.data[account]['ads'][ads][adss]['adcreatives']['data'][0]['image_url'];

                                var totable = '';
                                var thumbnail_url = accounts.data[account]['ads'][ads][adss]['adcreatives']['data'][0]['thumbnail_url'];
                                if (!!fullimage_url)
                                    totable = "<td><a href='" + fullimage_url + "' target='_blank'><img src=" + thumbnail_url + " width='50' height='50'></a></td>";
                                else if (!!thumbnail_url)
                                    totable = "<td><img src='" + thumbnail_url + "' width='50' height='50'></td>";
                                else totable = "<td><h6 style='color: red;'>Недоступна миниатюра<p>креатива, объявление удалено</h6></td>";


                                var link = "";
                                if ('object_story_spec' in accounts.data[account]['ads'][ads][adss]['adcreatives']['data'][0])
                                    if ('link_data' in accounts.data[account]['ads'][ads][adss]['adcreatives']['data'][0]['object_story_spec'])
                                        link = accounts.data[account]['ads'][ads][adss]['adcreatives']['data'][0]['object_story_spec']['link_data']['link'];

                                var name = accounts.data[account]['ads'][ads][adss]['name'];
                                if (link != "") {
                                    name = "<a href='" + link + "' target='_blank'>" + name + '</a>';
                                }

                                //статистика
                                var clicks, impressions, results, adspent, cpl, cpm, ctr, cpc;
                                if ('impressions' in accounts.data[account]['ads'][ads][adss]) {
                                    impressions = accounts.data[account]['ads'][ads][adss]['impressions'];
                                    tImpressions += parseInt(impressions);
                                } else impressions = 0;

                                if (accounts.data[account]['ads'][ads][adss]['insights']['data'][0]['inline_link_clicks']) {
                                    clicks = parseInt(accounts.data[account]['ads'][ads][adss]['insights']['data'][0]['inline_link_clicks']);
                                    tClicks += clicks;
                                } else clicks = 0;

                                if ('result' in accounts.data[account]['ads'][ads][adss]) {
                                    results = accounts.data[account]['ads'][ads][adss]['result'];
                                    tResult += parseInt(results);
                                } else results = 0;

                                if (accounts.data[account]['ads'][ads][adss]['spent']) {
                                    adspent = mathMoney(accounts.data[account]['ads'][ads][adss]['spent']);
                                    tSpent += parseFloat(adspent);
                                } else adspent = 0;

                                if ('cost_per_lead_fb' in accounts.data[account]['ads'][ads][adss]) {
                                    cpl = mathMoney(accounts.data[account]['ads'][ads][adss]['cost_per_lead_fb']);
                                    if (cpl !== 0)
                                        tCPL.push(cpl)
                                } else cpl = 0;

                                if (accounts.data[account]['ads'][ads][adss]['insights']['data'][0]['inline_link_click_ctr']) {
                                    ctr = mathStat(accounts.data[account]['ads'][ads][adss]['insights']['data'][0]['inline_link_click_ctr']);
                                    if (ctr !== 0)
                                        tCTR.push(ctr)
                                } else ctr = 0;

                                if (accounts.data[account]['ads'][ads][adss]['insights']['data'][0]['cpm']) {
                                    cpm = mathStat(accounts.data[account]['ads'][ads][adss]['insights']['data'][0]['cpm']);
                                    if (cpm !== 0)
                                        tCPM.push(cpm)
                                } else cpm = 0;

                                if (accounts.data[account]['ads'][ads][adss]['insights']['data'][0]['cpc']) {
                                    cpc = mathStat(accounts.data[account]['ads'][ads][adss]['insights']['data'][0]['cpc']);
                                    if (cpc !== 0)
                                        tCPC.push(cpc)
                                } else cpc = 0;

                                if (adss == Object.keys(adsObj)[Object.keys(adsObj).length - 1]) {
                                    var tds = document.getElementById(id).getElementsByTagName("td");
                                    var totals = [
                                        tImpressions,
                                        tClicks,
                                        tResult,
                                        tSpent.toFixed(2),
                                        average(tCPL),
                                        average(tCPM),
                                        average(tCTR),
                                        average(tCPC)
                                    ];
                                    for (var idx = 1; idx < tds.length; idx++) {
                                        if (idx - 1 != 1 || idx - 1 != 2)
                                            tds[idx].innerHTML = totals[idx - 1];
                                        else tds[idx].innerHTML = totals[idx - 1].toFixed(2);
                                    }
                                }

                                var escolor = 'red';
                                if (effective_status == 'ACTIVE')
                                    escolor = 'Lime';
                                else if (effective_status == 'ADSET_PAUSED' | effective_status == 'CAMPAIGN_PAUSED' | effective_status == 'PENDING_REVIEW')
                                    escolor = 'Gold';

                                var rewiew_feedback = '';
                                if ('ad_review_feedback' in accounts.data[account]['ads'][ads][adss]) {
                                    if ('global' in accounts.data[account]['ads'][ads][adss]['ad_review_feedback']) {
                                        for (var glo in accounts.data[account]['ads'][ads][adss]['ad_review_feedback']['global']) {
                                            rewiew_feedback = '<br>' + glo;
                                        }
                                    }
                                }

                                var tr = document.createElement('tr');
                                var tabble_text = '';
                                if (show == 'active') {
                                    if (acc_status == 'ACTIVE' && dis_reason == '' && effective_status == 'ACTIVE' | effective_status == 'CAMPAIGN_PAUSED' | effective_status == 'PENDING_REVIEW') {
                                        tabble_text = totable + '<td><nobr>' + name + '</nobr></td><td><h6 style="color:' + escolor + ';">' + effective_status + rewiew_feedback + '</h6></td><td><nobr>' + impressions + '</nobr></td><td><nobr>' + clicks + '</nobr></td><td><nobr>' + results + '</nobr></td><td><nobr>' + adspent + '</nobr></td><td><nobr>' + cpl + '</nobr></td><td><nobr>' + cpm + '</nobr></td><td style="vertical-align:middle"><nobr>' + ctr + '</nobr></td></td><td><nobr>' + cpc + '</nobr></td>';
                                    }
                                } else
                                    tabble_text = totable + '<td><nobr>' + name + '</nobr></td><td><h6 style="color:' + escolor + ';">' + effective_status + rewiew_feedback + '</h6></td><td><nobr>' + impressions + '</nobr></td><td><nobr>' + clicks + '</nobr></td><td><nobr>' + results + '</nobr></td><td><nobr>' + adspent + '</nobr></td><td><nobr>' + cpl + '</nobr></td><td><nobr>' + cpm + '</nobr></td><td style="vertical-align:middle"><nobr>' + ctr + '</nobr></td></td><td><nobr>' + cpc + '</nobr></td>';
                                tr.innerHTML = tabble_text;
                                parent.appendChild(tr);
                            }
                        }
                    }
                }
            }
        }
    }
    xhr.send();
}

function average(arr) {
    var x, correctFactor = 0,
        sum = 0;
    for (x = 0; x < arr.length; x++) {
        arr[x] = +arr[x];
        if (!isNaN(arr[x])) {
            sum += arr[x];
        } else {
            correctFactor++;
        }
    }
    sum = (sum / (arr.length - correctFactor)).toFixed(2);
    if (isNaN(sum)) sum = 0;
    return sum;
}

function mathMoney(num) {
    if (typeof num !== undefined && num !== null && num !== 0) {
        num = parseFloat(num).toFixed(2) / 100;
    } else num = 0;
    return num;
}

function mathStat(num) {
    if (typeof num !== undefined && num !== null && num !== 0) {
        num = parseFloat(num).toFixed(2);
    } else num = 0;
    return num;
}