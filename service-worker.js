function reddenPage() {
    console.log('EAN FINDER 2');    
    //document.body.style.backgroundColor = 'red';

    var eans = [];

    // if domain is idealo.fr
    if (window.location.hostname === 'www.fnac.com') {
        console.log('fnac');
        // from the html, extract the ean with a global regex that match "product_EAN":"(\d*))"
        const regex = /"product_EAN":"(\d*)"/g;
        const html = document.body.innerHTML;
        let match;
        while ((match = regex.exec(html)) !== null) {
            eans.push(match[1]);
            console.log("matched "  + match[1]);
        }
    }else if (window.location.hostname === 'www.darty.com') {
        // <meta itemprop="gtin13" content="8806092878624" >
        const metas = document.querySelectorAll('meta[itemprop="gtin13"]');
        for (const meta of metas) {
            eans.push(meta.content);
            console.log("matched "  + meta.content);
        }
    }else if (window.location.hostname === 'www.rueducommerce.fr') {
        //  <div id="productphoto" data-ean="8806092878624" data-language="fr">
        const divs = document.querySelectorAll('div[id="productphoto"]');
        for (const div of divs) {
            eans.push(div.getAttribute('data-ean'));
            console.log("matched "  + div.getAttribute('data-ean'));
        }

    }else if (window.location.hostname === 'www.amazon.fr' || window.location.hostname === 'www.amazon.com') {
        // asin: "B08FJ1WBK6"
        // find in outerHTML the asin and extract it
        const asin = document.body.outerHTML.match(/"asin":"([^"]+)"/);
        if (asin) {
            eans.push("asin : "+asin[1]);
            console.log("matched "  + asin[1]);
        }
    }else {
                
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        let found = false;
        for (const script of scripts) {
            try {
                const content = script.textContent;
                const json = JSON.parse(content);
                if (json.gtin13) {
                    eans.push("gtin13 : "+json.gtin13);
                    found = true;
                    break;
                }
                if (json.sku) {
                    eans.push("sku : "+json.sku);
                    found = true;
                    break;
                }
                
            } catch (error) {
                console.log('Error parsing JSON:', error);
            }
        }
        if (!found) {
            console.log('No valid JSON+LD with SKU found');
        }
    }

    if (eans.length > 0) {
        // make a fixed position div, with the eans as a list
        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.top = '10px';
        div.style.left = '10px';
        div.style.backgroundColor = 'red';
        div.style.padding = '10px';
        div.style.border = '1px solid black';
        div.style.zIndex = '1000000';
        div.style.fontSize = '18px';
        div.innerHTML = `<ul>${eans.map(ean => `<li>${ean}</li>`).join('')}</ul>`;
        document.body.appendChild(div);
    }
}
  
chrome.action.onClicked.addListener((tab) => {
    if (!tab.url.includes('chrome://')) {
        chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: reddenPage
        });
    }
});