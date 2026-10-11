/* track-config.js - KN site tracking ids. Each feature is OFF when its id is empty (track.js loads nothing for it).
 * clarity   = the Microsoft Clarity project id (clarity.microsoft.com). Empty = Clarity off.
 * id        = the Google tag id of Ads account 658-334-3150 (billing@getknservices.com), read 6 Oct 2026
 * purchase / brief / whatsapp = the conversion labels Google shows for each conversion action
 *   (Goals > Conversions; the label is the part after the slash in "AW-18497035998/...")
 *   purchase = 'Purchase' (category Purchase, value per plan, default 99 USD, count Every)
 *   brief    = 'Brief sent' (category Submit lead form, 1 USD, count One)
 *   whatsapp = 'WhatsApp tap' (category Contact, 1 USD, count One) */
window.KN_TRACK = {
  clarity: 'yvw50dwjqk',
  id: 'AW-18497035998',
  purchase: 'gwRfCKy3-JIdEN69ifRE',
  brief: '9-7qCKm3-JIdEN69ifRE',
  whatsapp: 'DhO4COn3-ZIdEN69ifRE'
};
