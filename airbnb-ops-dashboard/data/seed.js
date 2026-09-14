// Local demo seed for Acelence Ops Board.
// Used ONLY when the page runs outside claude.ai (self-hosted PWA / opened from disk),
// where there is no shared database. On claude.ai the shared database is the source of truth.
// Content mirrors the "today schedule" file 140926.xlsx and the 14 Sep guest brief.
window.OPS_SEED = {
  date: "2026-09-14",
  reservations: [
    { id:"HMZWMDJCS8", type:"out", unit:"N-33-06", unitConfirmed:true, listing:"High Floor Twin Tower View 1BR Suite", guest:"Ville Rautio", pax:"2 adults", stay:"3 – 14 Sep", date:"2026-09-14", note:"Map entry is \"[New!] High Floor Twin Tower View 1BR Suite\" – same listing, prefix dropped on Airbnb.", flags:[], amount:null, eta:"12:00 PM", checkedOut:null, arrived:null },
    { id:"HMERY3DH44", type:"out", unit:"UNMAPPED", unitConfirmed:false, listing:"KLCC View 2BR Apt | Shopping Mall I Mrt station", guest:"Shafaq Khan", pax:"2 adults", stay:"7 – 14 Sep", date:"2026-09-14", note:"Listing not in Listing Unit Map – flagged since 13 Aug, still open. Closest map entry: SH-12-03.", flags:["unmapped"], amount:null, eta:"12:00 PM", checkedOut:null, arrived:null },
    { id:"HM2PQBCSMJ", type:"out", unit:"S-23-09", unitConfirmed:true, listing:"Exclusive 1br Suite w/ KL Tower View near Pavilion", guest:"Santosh Shetty", pax:"1 adult", stay:"10 – 14 Sep", date:"2026-09-14", note:"STATUS \"Trip change sent\" – checkout date may still move, reconfirm before cleaning. Next arrival Ahmed Asiri 16 Sep.", flags:["tripchange"], amount:null, eta:"12:00 PM", checkedOut:null, arrived:null },
    { id:"HM28YE8HFR", type:"out", unit:"T2-30-03", unitConfirmed:true, listing:"High Floor KLCC View Dual Key 2BR I King Beds", guest:"静洁 刘", pax:"4 adults", stay:"10 – 14 Sep", date:"2026-09-14", note:"Next arrival Jo Daunt 16 Sep.", flags:[], amount:null, eta:"12:00 PM", checkedOut:null, arrived:null },
    { id:"HM9AHQ5YEP", type:"out", unit:"T2-22-2", unitConfirmed:true, listing:"Dual Key Suite w/ 2 Ensuite BA ⁂ KLCC View ⁂", guest:"Mohamed Yassine Bouchekara", pax:"2 adults", stay:"11 – 14 Sep", date:"2026-09-14", note:"Different unit from T1-20-02 despite the near-identical listing name.", flags:[], amount:null, eta:"12:00 PM", checkedOut:null, arrived:null },
    { id:"HMSF8PR2R3", type:"in", unit:"T1-20-02", unitConfirmed:true, listing:"⁂ Iconic KL View ⁂Dual Key Suite w/ 2 Ensuite BA", guest:"Vincent Hoekstra", pax:"2 adults, 1 infant", stay:"14 – 17 Sep", date:"2026-09-14", note:"Taxi from airport, flight KL809 (KLM). Baby cot + high chair confirmed. Door code 4515. Awaiting taxi plate & ETA for entry QR.", flags:["infant"], amount:null, eta:"4:00 PM", etaNote:"Standard check-in. ETA not confirmed by guest.", checkedOut:null, arrived:null },
    { id:"HM939Q3D83", type:"in", unit:"T1-15-03", unitConfirmed:false, listing:"1BR Apt w/balcony and KL Tower View", guest:"Zaki Ansari", pax:"1 adult", stay:"14 – 18 Sep", date:"2026-09-14", note:"Not in map; closest match \"1BR Apt w/balcony and Twin Tower View\" = T1-15-03 – UNCONFIRMED. Lands 11:30 PM, self check-in approx 1:30 AM 15 Sep. Door code 7230. Flight number pending.", flags:["late","unmapped"], amount:null, eta:"1:30 AM (15 Sep)", etaNote:"Late self check-in approved. Flight number still pending.", checkedOut:null, arrived:null },
    { id:"HMH98BY4B9", type:"in", unit:"T2-11-09", unitConfirmed:true, listing:"Executive King Suite with balcony & city panaroma", guest:"Ihab Abughabush", pax:"2 adults, 1 child", stay:"14 – 19 Sep", date:"2026-09-14", note:"Already in KL, arriving by car around 3:00 PM. Parking confirmed; car plate pending. Door code 1370.", flags:["early"], amount:null, eta:"1:00 PM", etaNote:"Early check-in approved. Unit must be ready by 1:00 PM.", checkedOut:null, arrived:null }
  ],
  requests: [
    { id:"rq-vincent-cot", guest:"Vincent Hoekstra", unit:"T1-20-02", resId:"HMSF8PR2R3", text:"Baby cot and high chair required (2 adults + 1 infant, 1 year old). Guest count amended from 1 to 3.", source:"Airbnb message", receivedAt:"2026-09-13T09:00:00+08:00", priority:"high", status:"new", assignedTo:null },
    { id:"rq-vincent-qr", guest:"Vincent Hoekstra", unit:"T1-20-02", resId:"HMSF8PR2R3", text:"Chase taxi plate number and ETA so the entry QR code can be generated this morning.", source:"Airbnb message", receivedAt:"2026-09-13T09:05:00+08:00", priority:"normal", status:"new", assignedTo:null },
    { id:"rq-ihab-early", guest:"Ihab Abughabush", unit:"T2-11-09", resId:"HMH98BY4B9", text:"Early check-in 1:00 PM approved. Unit must be cleaned and ready by 1:00 PM. Confirm car plate for visitor parking QR.", source:"Airbnb message", receivedAt:"2026-09-13T09:10:00+08:00", priority:"high", status:"new", assignedTo:null },
    { id:"rq-zaki-late", guest:"Zaki Ansari", unit:"T1-15-03", resId:"HM939Q3D83", text:"Very late self check-in approx 1:30 AM on 15 Sep. Arrange after-hours entry. Flight number, car plate and ETA still outstanding.", source:"Airbnb message", receivedAt:"2026-09-13T09:15:00+08:00", priority:"normal", status:"new", assignedTo:null },
    { id:"rq-santosh-trip", guest:"Santosh Shetty", unit:"S-23-09", resId:"HM2PQBCSMJ", text:"Reservation has a pending trip change. Reconfirm checkout date before sending cleaning.", source:"Airbnb reservation", receivedAt:"2026-09-13T22:00:00+08:00", priority:"normal", status:"new", assignedTo:null }
  ],
  units: {
    "SH-19-09": { status:"occupied", note:"Mohamed Adly, out 15 Sep" },
    "T2-23-09": { status:"occupied", note:"Collier King, out 15 Sep" },
    "T2-13a-02": { status:"occupied", note:"Natasha Paramita, out 15 Sep" },
    "Eaton 18-03": { status:"occupied", note:"Sharon Read, out 15 Sep" },
    "T2-22-3a": { status:"occupied", note:"Muchtar Tsabit, out 15 Sep" },
    "T1-23a-3a": { status:"occupied", note:"Carla Horten, out 15 Sep" },
    "SH-19-06": { status:"occupied", note:"Kenza Chabraoui, out 15 Sep" }
  },
  feed: []
};
