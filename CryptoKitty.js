// CryptoKitty auto buy eggs and claim tao

if (!window.__BUY_SCRIPT_RUNNING__) {
    window.__BUY_SCRIPT_RUNNING__ = true;

    (async () => {
        const buy_cat = 'hybrid';
        const total = 10;
        const token = Telegram.WebView.initParams.tgWebAppData;

        const fetchRequest = async (cat, quantity = 1) =>
            await fetch("https://zenegg-api.production.cryptokitties.dapperlabs.com/egg/api/den/buy-fancy-egg", {
                headers: {
                    accept: "*/*",
                    "content-type": "application/json",
                    "x-id-token": token
                },
                body: JSON.stringify({
                    cat_category: cat,
                    quantity
                }),
                method: "POST",
                mode: "cors",
                credentials: "omit"
            });

        const claimEgg = async () =>
            await fetch("https://zenegg-api.production.cryptokitties.dapperlabs.com/egg/api/den/claim-tao", {
                headers: {
                    accept: "*/*",
                    "content-type": "application/json",
                    "x-source-attr": "source__notif__S3Starts",
                    "x-id-token": token
                },
                method: "POST",
                mode: "cors"
            }).then(r => r.json()).then(data => data.claim?.zen_claimed);

        const delay = t => new Promise(resolve => setTimeout(resolve, t * 1000));

        for (let i = 0; i < total; i++) {
            await fetchRequest(buy_cat);
            const randomDelay = 5;
            console.log(` Buy "${buy_cat}" 🥚 success `);
            console.log(` ⏱️ wait ${randomDelay}s`);
            await delay(randomDelay);

            const zenClaimed = await claimEgg();
            const rdDelay = 5;
            console.log(`🥚 Claim ZEN success: +${zenClaimed} ZEN`);
            console.log(` ⏱️ Wait ${rdDelay}s `);
            await delay(rdDelay);

            console.log("------------------------------------------------------");
            console.log(`😉 Rubbed egg ${i + 1}/${total} 🥚`);
            console.log("------------------------------------------------------");
        }

        console.log("🎉 DONE ALL");
