/* AsianHOST 2026 registration calendar — one editable source of truth.
 * The early-rate cutoff is exclusive: at 00:00 IST on 1 December, regular rates apply.
 * KonfHub ticket availability MUST be configured to match this time.
 * Do not place API keys, attendee records or private credentials in this public file.
 */
(function(root,factory){
  'use strict';
  const config=factory();
  if(typeof module!=='undefined' && module.exports)module.exports=config;
  if(root)root.AsianHOSTRegistrationConfig=config;
})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  const REGULAR_START_ISO='2026-12-01T00:00:00+05:30';
  return Object.freeze({
    REGULAR_START_ISO,
    REGULAR_START_MS:Date.parse(REGULAR_START_ISO),
    EARLY_DEADLINE_TEXT:'30 November 2026 at 11:59 p.m. IST',
    EARLY_CLOSE_DATE:'30 November 2026',
    REGULAR_START_DATE:'1 December 2026',
    EARLY_AMOUNTS:Object.freeze({'ieee':50000,'nonieee':60000,'ieee-student':15000,'nonieee-student':25000,'life':25000}),
    REGULAR_AMOUNTS:Object.freeze({'ieee':60000,'nonieee':70000,'ieee-student':25000,'nonieee-student':35000,'life':35000})
  });
});
