const scriptSheetURL = 'https://docs.google.com/spreadsheets/d/1lsmDvfbU9L4n6yuMZcWnH3OzVSDlq3uK3GZsN0pEmw0/edit?gid=1681209226#gid=1681209226'; //make copy, replace account name and sale name
const scriptSheet =  SpreadsheetApp.openByUrl(scriptSheetURL);


//DO NOT EDIT ANY CODE BELOW THIS LINE (or I'll cry)

const settings = scriptSheet.getSheetByName("Settings");

const saleLabel = settings.getRange("D11").getValue();
const saleStart = settings.getRange("D14").getValue();
const saleEnd = settings.getRange("D17").getValue();
const email = settings.getRange("D20").getValue();


const campaignQuery = `
SELECT 
    campaign.id, 
    campaign.name, 
    campaign.status, 
    campaign.labels 
FROM campaign 
WHERE 
    campaign.status != 'REMOVED'
`;

const adQuery = `
SELECT 
    ad_group.id, 
    ad_group.name, 
    ad_group_ad.status,
    ad_group_ad.ad.type 
FROM ad_group_ad 
WHERE 
    ad_group.status != 'REMOVED' 
    AND ad_group_ad.status != 'REMOVED' 
`;

const adGroupQuery = `
SELECT 
    ad_group.id, 
    ad_group.name, 
    ad_group.status
FROM ad_group 
WHERE 
    ad_group.status != 'REMOVED'
`;

function getCurrentDate () {
    const timeZone = AdsApp.currentAccount().getTimeZone();
    const now = new Date ();
    const today= Utilities.formatDate(now, timeZone, "yyyy-MM-dd");
    return{
        today, timeZone
    };
}

function isSaleActive (){
    const { today } = getCurrentDate();
    if (today >= saleStart && today <= saleEnd){
        return true;
    } else {
        return false;
    } 
}

function toggleEnablePause(entity){
    if (isSaleActive() && entity.isPaused()){
        entity.enable();
        Logger.log(`${entity.getEntityType()} with ID: ${entity.getId()} has been ENABLED.`);
    } else if (!isSaleActive() && entity.isEnabled()){
        entity.pause();
        Logger.log(`${entity.getEntityType()} with ID: ${entity.getId()} has been PAUSED.`);
    }
}

function main (){

    const saleLabel = settings.getRange("D11").getValue();

    if (!saleLabel) {
        Logger.log("error: sales label empty, review sheet.");
        return;
    }

    const campaignIterator = AdsApp.campaigns()
    .withCondition(`LabelNames CONTAINS_ANY ['${saleLabel}']`)
    .get();

    while (campaignIterator.hasNext ()) {
        const campaign = campaignIterator.next();
        toggleEnablePause(campaign);
    }

    const adIterator = AdsApp.ads()
    .withCondition(`LabelNames CONTAINS_ANY ['${saleLabel}']`)
    .get();

    while (adIterator.hasNext()){
        const ad = adIterator.next();
        toggleEnablePause(ad)
    }

    const adGroupIterator = AdsApp.adGroups()
    .withCondition(`LabelNames CONTAINS_ANY ['${saleLabel}']`)
    .get();

    while (adGroupIterator.hasNext()){
        const adGroup = adGroupIterator.next(); 
        toggleEnablePause(adGroup)
    }

    
}

