export type PhotoCredit = {
  subject: string;
  author: string;
  licence: string;
  licenceUrl?: string;
  source: string;
};

const CC_BY_SA_4 = { licence: "CC BY-SA 4.0", licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/" };
const CC_BY_4 = { licence: "CC BY 4.0", licenceUrl: "https://creativecommons.org/licenses/by/4.0/" };
const CC0 = { licence: "CC0 (public domain)", licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/" };
const PEXELS = { licence: "Pexels License", licenceUrl: "https://www.pexels.com/license/" };

export const PRODUCT_PHOTO_CREDITS: PhotoCredit[] = [
  { subject: "Samsung Galaxy A55 (front)", author: "Captainmorlypogi1959", ...CC_BY_SA_4, source: "https://commons.wikimedia.org/wiki/File:Samsung_Galaxy_A55_5G_2024.jpg" },
  { subject: "Samsung Galaxy A15 (front)", author: "Captainmorlypogi1959", ...CC_BY_SA_4, source: "https://commons.wikimedia.org/wiki/File:Samsung_Galaxy_A15_5G_2024_(1).jpg" },
  { subject: "Samsung Galaxy A15 (back)", author: "PantheraLeo1359531", ...CC_BY_4, source: "https://commons.wikimedia.org/wiki/File:Samsung_Galaxy_A15_20240529_HOF7502_RAW-Export_cens.png" },
  { subject: "Apple iPhone 15 (back)", author: "ThePhotoGraphIc", ...CC_BY_SA_4, source: "https://commons.wikimedia.org/wiki/File:Back_of_iPhone_15.jpg" },
  { subject: "Apple iPhone 13 (front)", author: "メイド理世", ...CC_BY_SA_4, source: "https://commons.wikimedia.org/wiki/File:IPhone_13,_January_28,_2024.jpg" },
  { subject: "Apple iPhone 13 (back)", author: "Kskhh", ...CC_BY_SA_4, source: "https://commons.wikimedia.org/wiki/File:IPhone_13.jpg" },
  { subject: "Apple MacBook Air M2 (open)", author: "KKPCW (Kyu3)", ...CC_BY_SA_4, source: "https://commons.wikimedia.org/wiki/File:M2_Macbook_Air_Starlight_model.jpg" },
  { subject: "Apple MacBook Air M2 (lid)", author: "メイド理世", ...CC_BY_SA_4, source: "https://commons.wikimedia.org/wiki/File:MacBook_Air_(A2681)_front.jpg" },
  { subject: "Apple AirPods 4", author: "AppleFans 1", ...CC0, source: "https://commons.wikimedia.org/wiki/File:Airpods_4.jpg" },
  { subject: "Apple Watch SE 2nd gen (front)", author: "AzureSaturn", ...CC0, source: "https://commons.wikimedia.org/wiki/File:Apple_Watch_SE_2_(GPS_%2B_Cellular,_40mm,_Midnight)_with_Anchor_Blue_Sport_Loop.jpg" },
  { subject: "Apple Watch SE 2nd gen (back)", author: "AzureSaturn", ...CC0, source: "https://commons.wikimedia.org/wiki/File:Apple_Watch_SE_2_(GPS_%2B_Cellular,_40mm,_Midnight)_-_Backside.jpg" },
  { subject: "Samsung Galaxy Watch6", author: "Ganesh Mohan T", ...CC_BY_SA_4, source: "https://commons.wikimedia.org/wiki/File:Samsung_Galaxy_Watch_6.jpg" },
  { subject: "Samsung 25W USB-C charger", author: "Dinkun Chen", ...CC_BY_SA_4, source: "https://commons.wikimedia.org/wiki/File:SAMSUNG_EP-TA800_25W_POWER_ADAPER_WHITE.jpg" },
  { subject: "Dell XPS 13 (9350)", author: "Green-Curtain", ...CC_BY_SA_4, source: "https://commons.wikimedia.org/wiki/File:Dell_XPS_13_9350.jpg" },
  { subject: "Lenovo ThinkPad X1 Carbon", author: "Elroygoh", ...CC_BY_SA_4, source: "https://commons.wikimedia.org/wiki/File:Lenovo_ThinkPad_X1_Carbon_Ultrabook.jpg" },
  { subject: "Xiaomi Redmi Note 14 Pro+", author: "Maksdroider", ...CC_BY_SA_4, source: "https://commons.wikimedia.org/wiki/File:Redmi_Note_14_ProPlus.jpg" },
  { subject: "Samsung Galaxy Buds (2019)", author: "Kskhh", ...CC_BY_SA_4, source: "https://commons.wikimedia.org/wiki/File:Samsung_Galaxy_Buds.jpg" },
  { subject: "JBL Flip 4", author: "Freekhou5", ...CC_BY_SA_4, source: "https://commons.wikimedia.org/wiki/File:JBL_Flip_4.jpg" },
  { subject: "JBL GO 2", author: "Pittigrilli", ...CC_BY_SA_4, source: "https://commons.wikimedia.org/wiki/File:JBL_GO2_Bluetooth_speaker_00_10_27_681000_(turned_upright).jpeg" },
  { subject: "Xiaomi Smart Band 8", author: "DeadJacb", ...CC_BY_SA_4, source: "https://commons.wikimedia.org/wiki/File:Xiaomi_Mi_Band_8.jpg" },
  { subject: "Anker PowerCore 10000", author: "Saucy", ...CC_BY_4, source: "https://commons.wikimedia.org/wiki/File:Anker_power_bank_and_cable.jpg" },
  { subject: "Xiaomi 50W Power Bank 20000mAh", author: "OnionBulb", ...CC_BY_SA_4, source: "https://commons.wikimedia.org/wiki/File:Mi50WPowerBank20000mAhXiaomi20240823000.jpg" },
  { subject: "Apple 96W USB-C Power Adapter", author: "Tony Webster", licence: "CC BY 2.0", licenceUrl: "https://creativecommons.org/licenses/by/2.0/", source: "https://commons.wikimedia.org/wiki/File:Apple_96W_USB_Type-C_Power_Adapter_for_new_16_inch_MacBook_Pro_(49165128252).jpg" },
];

export const ILLUSTRATIVE_PHOTO_CREDITS: PhotoCredit[] = [
  { subject: "HP 250 G9 (illustrative: generic laptop)", author: "Pexels photographer", licence: "Pexels License", licenceUrl: "https://www.pexels.com/license/", source: "https://www.pexels.com/photo/a-laptop-with-a-white-screen-4884122/" },
  { subject: "Sony WH-CH720N (illustrative: generic white headphones)", author: "Sound On", licence: "Pexels License", licenceUrl: "https://www.pexels.com/license/", source: "https://www.pexels.com/photo/white-wireless-headphones-3394650/" },
];

export const SITE_PHOTO_CREDITS: PhotoCredit[] = [
  { subject: "Home page: gadgets flat lay", author: "Pexels photographer", ...PEXELS, source: "https://www.pexels.com/photo/arranged-mobile-phone-with-gadgets-2933606/" },
  { subject: "Category: Phones", author: "Pexels photographer", ...PEXELS, source: "https://www.pexels.com/photo/minimalist-smartphone-mockup-on-white-background-30930310/" },
  { subject: "Category: Laptops", author: "Anna Nekrashevich", ...PEXELS, source: "https://www.pexels.com/photo/a-laptop-with-blank-screen-on-a-white-surface-8534047/" },
  { subject: "Category: Audio", author: "Sound On", ...PEXELS, source: "https://www.pexels.com/photo/white-wireless-headphones-3394650/" },
  { subject: "Category: Wearables", author: "Pexels photographer", ...PEXELS, source: "https://www.pexels.com/photo/silver-apple-watch-9142237/" },
  { subject: "Category: Accessories", author: "Markus Winkler", ...PEXELS, source: "https://www.pexels.com/photo/white-power-bank-and-blue-coated-wires-4072683/" },
];
