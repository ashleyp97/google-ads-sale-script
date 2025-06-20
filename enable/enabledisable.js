const scriptSheetURL = 'https://docs.google.com/spreadsheets/d/1lsmDvfbU9L4n6yuMZcWnH3OzVSDlq3uK3GZsN0pEmw0/edit?gid=1681209226#gid=1681209226'; //make copy, replace account name and sale name
const scriptSheet =  SpreadsheetApp.openByUrl(scriptSheetURL);

//DO NOT EDIT ANY CODE BELOW THIS LINE (or I'll cry)

const settings = scriptSheet.getSheetByName("Settings");
const saleLabel = scriptSheet.getRange("D11").getValue();
const saleStart = scriptSheet.getRange("D14").getValue();
const saleEnd = scriptSheet.getRange("D17").getValue();
const email = scriptSheet.getRange("D20").getValue();


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

function CampaignEnablePause(campaign){
    if (isSaleActive() && campaign.isPaused()){
        campaign.enable();
    } else if (!isSaleActive() && campaign.isEnabled()) {
        campaign.pause();
    }
}

function AdEnablePause(ad){
    if (isSaleActive() && ad.isPaused()){
        ad.enable();
    } else if (!isSaleActive() && ad.isEnabled()) {
        ad.pause();
    }
}

function main (){

    if (!saleLabel) {
        return "error: sales label empty, review sheet."
    }

    isSaleActive();


}

