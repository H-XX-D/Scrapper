import{CASE_FILES}from'./campaign-story.js';
export const STRAINS=[
 {id:'brood',name:'THE VERDANT BROOD',description:'Cargo-borne burrowers turn insulation and stored organics into egg sacs. Pods, feeding mounds, and thorn arches are living hatcheries.'},
 {id:'choir',name:'THE GLASS CHOIR',description:'A second species grows through crystals and communications hardware. Its coordinated calls wake distant broods and guide armored guardians.'},
 {id:'splice',name:'THE IRON SPLICE',description:'A parasitic third strain threads through control gel, hijacking repair drones and fabrication systems. Destroying the host machine releases what has been growing inside.'}
];
// Spoken logs are concise in play; the contract journal preserves the larger campaign arc.
export const CHAPTERS=[
 {title:'A Routine Recovery',act:'I / UNCLAIMED PROPERTY',theme:0,strain:'brood',
  brief:'Rook is a licensed salvage and recovery specialist, working under the callsign Scrapper. His contract is to recover a dead station’s navigation ledger and assess cargo for auction. Dock Nine is listed as empty. It is not.',
  intro:'Scrapper, recovery log one. Dock Nine, unpaid power bill, abandoned freight. Find the ledger, tag the salvage, go home. That was the job.',
  discovery:'These aren’t fuel blisters. The insulation is moving. Something nested in the cargo before the crew ever knew it was here.',
  record:'The manifest calls it agricultural starter. Every damaged crate has the same forwarding code. I’m taking the original ledger.',
  guardian:'That thing is guarding the freight doors. I clear it, I can get the ledger out. Salvage rules just got an amendment.',
  exit:'Dock Nine is quarantined. I logged the cargo routes with the recovery union. Somebody else can handle the next one. Please.'},
 {title:'The Living Archive',act:'I / UNCLAIMED PROPERTY',theme:1,strain:'brood',
  brief:'The union follows the ledger to Verdant Array, a biological research station. A distress recording names cargo containers as the initial source. Rook returns for survivors and a sample archive before an automated purge erases both evidence and specimens.',
  intro:'They called me because I came back from Dock Nine. That is apparently a qualification now. Verdant Array: recover the archive, check the shelter beacons.',
  discovery:'The garden is feeding the walls. These arches hatch the same things as the pods. Destroy the growth, expect company.',
  record:'The research team was studying a carrier organism. Their shipping authority kept approving transfers after the first missing technician.',
  guardian:'That big one is connected to every root in this wing. Cut its hatcheries and it has fewer places to send reinforcements.',
  exit:'The shelter beacon was a maintenance loop. No voices left. I’m not signing this off as ordinary equipment loss.'},
 {title:'Cold Storage',act:'II / UNPAID OVERTIME',theme:2,strain:'choir',
  brief:'Cryogenic storage was meant to contain recovered specimens. The coolant network is repeating a signal recorded before the first outbreak. Rook descends into frozen pump galleries to trace it and finds a second species that communicates through the station.',
  intro:'Glacier Works wanted someone who knew the green ones. Fine. I know them. Whatever is singing through these pipes is new.',
  discovery:'Purple growth in the ice. Different shell, different blood. The little callers are coordinating the rest. Cut the signal first.',
  record:'The coolant telemetry is a repeating pattern. It isn’t a leak alarm. They have been talking through the station for weeks.',
  guardian:'Its throat is opening. That’s the warning. Break the call before it wakes every nest in the reservoir.',
  exit:'Two species. One shipping route. The cold did not stop either of them; it just gave them somewhere quiet to grow.'},
 {title:'Unauthorized Assembly',act:'II / UNPAID OVERTIME',theme:3,strain:'splice',
  brief:'A foundry has begun manufacturing security drones without operators. Rook discovers a third organism living in conductive gel, grafting itself into machinery. The three infestations are sharing infrastructure even though they are not the same species.',
  intro:'Recovery contract amended: moving machinery counts as hostile until it proves otherwise. The foundry is building drones with no work orders.',
  discovery:'There’s tissue in the actuator housings. Those fabrication vents are nests with serial numbers. Keep clear when they burst.',
  record:'The control gel came from the same distributor as the starter cultures. Someone packaged three disasters as a single product line.',
  guardian:'Parallax has the whole casting floor sighted. Wait for the dish to open, cross the line, then hit the capacitor.',
  exit:'Brood, Choir, Splice. Three names for the report. “Infestation recovery specialist” is what the union put next to mine.'},
 {title:'The Freight Trail',act:'III / SPECIALIST ON CALL',theme:0,strain:'brood',
  brief:'Rook now takes calls from stations along the contaminated freight chain. The next port is still transmitting clean inspection certificates. Its bonded storage contains proof that manifests were altered after the outbreaks began.',
  intro:'Port Meridian says their inspections are clean. They also asked me to arrive through the service dock and bring ammunition. I know which part to believe.',
  discovery:'The feeding mounds are in sealed containers. Somebody moved live growth through a staffed customs station.',
  record:'The time stamps were changed. These loads shipped after the warning notices. I have the unedited copy now.',
  guardian:'Another loading bay queen. There’s a route above it through the control gantry. Use the room, not its front door.',
  exit:'Every recovered manifest gets copied off-station before I invoice. Paperwork has become the most dangerous salvage in the system.'},
 {title:'Dead Air Below',act:'III / SPECIALIST ON CALL',theme:2,strain:'choir',
  brief:'An emergency relay went silent after accepting evacuation traffic. Rook explores lower drainage channels and service balconies to recover its black box. The Choir has learned to imitate the timing of distress calls.',
  intro:'The relay is repeating a rescue request word for word. Same breath, same pause. I’m going down to the recorder before anyone sends another crew.',
  discovery:'There’s no transmitter in the wall. It is the wall. The Choir learned which noises make us open doors.',
  record:'The black box has two tracks: the real evacuation, and what started calling afterward. I can give the union a way to tell them apart.',
  guardian:'That marshal is driving the signal. When it bows its heads, interrupt it. Don’t let it finish the call.',
  exit:'The new warning packet is out. Maybe the next recovery crew gets to be suspicious before they become a missing-persons report.'},
 {title:'Borrowed Roots',act:'IV / THE COST OF EVIDENCE',theme:1,strain:'brood',
  brief:'A habitat ring is still alive because its life-support gardens are alive. The Brood is using those same gardens. Rook must decide whether to preserve research and accept active hatcheries, or purge the growth and destroy irreplaceable evidence.',
  intro:'Habitat Seven still has power in the sealed shelters. The roots are in the air scrubbers. I can’t just burn every green thing I see.',
  discovery:'Some of this is ordinary garden stock. The living arches and pulsing sacs are the sources. Make the shots count.',
  record:'The archive has a growth map and an evacuation route. Purging cuts the brood pressure, but the data goes with it. My call, on the record.',
  guardian:'The guardian is planted across the shelter route. I don’t need a clean floor. I need one open passage.',
  exit:'The next contract will inherit what I saved here, and what I destroyed. The union can argue about it after the shelters get their air back.'},
 {title:'Machines That Remember',act:'IV / THE COST OF EVIDENCE',theme:3,strain:'splice',
  brief:'An automated recovery yard is sending contaminated repair parts to clean stations. Its machines replay the motions of missing workers. Rook needs the distribution keys to isolate the yard without scrapping the entire emergency repair network.',
  intro:'The repair yard is still filling orders. Every replacement actuator could carry the Splice. I need its distribution keys before the next launch window.',
  discovery:'The arms are repeating human maintenance routines. Whatever lives in the gel kept the motions and discarded the people.',
  record:'Distribution control recovered. The armory circuit gives me firepower; the maintenance circuit gives me a safer route through the machinery.',
  guardian:'The controller is using its own repair drones as armor. Draw the rail shot into a wall, then take the open capacitor.',
  exit:'The infected shipments are grounded. Clean stations will run short on parts. That is a repair problem. I know how to handle those.'},
 {title:'Return to Dock Nine',act:'V / RECOVERY LIEN',theme:0,strain:'choir',
  brief:'The original station has been reclassified for immediate demolition. Rook returns before the charges fire to recover a concealed corporate archive. All three strains are now present, and the first salvage site has become the center of the investigation.',
  intro:'Back to Dock Nine. The demolition notice calls it an unsalvageable asset. There is a difference between destroying a nest and destroying evidence.',
  discovery:'New growth in old damage. The Choir followed the Brood here, and the Splice took the cargo machinery. They share routes, not loyalty.',
  record:'Found it: the first trial shipment and its approval signatures. My routine recovery contract was cheaper than a quarantine team.',
  guardian:'The bay I escaped through is a breeding chamber now. Same station. Different fight. I know the service routes this time.',
  exit:'Archive secured. The salvage lien says recovered records stay with the licensed operator until adjudication. They should have read their own contract.'},
 {title:'The Seed Vault',act:'V / RECOVERY LIEN',theme:1,strain:'brood',
  brief:'Evidence points to a propagation vault that supplies every contaminated shipment. Rook follows its surviving biologists’ notes through observation decks and overgrown archives, searching for a way to stop propagation without erasing the record of what happened.',
  intro:'The vault is where they multiplied the carrier cultures. If I can recover the isolation protocol, the next station gets a procedure instead of a last stand.',
  discovery:'The three strains compete until the carrier gel puts them in contact. Then they start using each other’s work. That is the product they were shipping.',
  record:'Isolation protocol recovered. Separate the carrier, interrupt the signal, deny the fabrication gel. There is a way to contain this.',
  guardian:'This queen has a whole archive feeding it. Cut the growth on the flanks before you take the middle.',
  exit:'The protocol is incomplete wherever I purged the research. I send what survived. People can work with evidence; they cannot work with ash.'},
 {title:'The Quiet Network',act:'VI / NO ABANDONED STATIONS',theme:2,strain:'choir',
  brief:'The Choir is using a cold communications backbone to synchronize outbreaks across multiple stations. Rook descends into its deepest reservoir, combining optical filters to isolate the signal without severing emergency communications.',
  intro:'This backbone carries the last clean emergency channels. I have to isolate the Choir without leaving everyone else in the dark.',
  discovery:'The emergency channels have separate optical filters. Cyan, magenta, white. Match each receiver and the Choir loses another route through the backbone.',
  record:'The isolated channels are quiet. Real distress traffic is coming through again. I’m saving the route so nobody has to guess after me.',
  guardian:'The marshal knows the signal is dying. It is going to call everything it has. Keep the stairs behind you clear.',
  exit:'Stations are answering by name now. Not loops. Not imitations. Actual people. One network left: the foundry that made the carrier.'},
 {title:'Specialist on Site',act:'VI / NO ABANDONED STATIONS',theme:3,strain:'splice',
  brief:'The carrier foundry is preparing a final autonomous shipment. Rook climbs from furnace intake to the core bulkhead, choosing what can be recovered and what must be destroyed. The records, routes, and research preserved throughout the campaign decide the recovery effort that follows.',
  intro:'Final call, carrier foundry. No new title for the suit. I am still salvage and recovery. The job is to decide what comes back out.',
  discovery:'The loading machinery is counting down a shipment with nobody left to receive payment. We stop the line here.',
  record:'Dispatch keys and carrier formulas recovered. The archive is as complete as I kept it. Whatever happens next has to start with the truth.',
  guardian:'Parallax is the last thing between this factory and shutdown. Watch the aim line. Keep moving. We have done harder recoveries than this.',
  exit:'Carrier line stopped. Recovery beacon transmitting. If another station calls, the union knows where to find me.'}
];
for(let i=0;i<CHAPTERS.length;i++)Object.assign(CHAPTERS[i],CASE_FILES[i]);
const choice=(entry,id)=>entry?.choices?.find(c=>c.id===id)?.value;
export function previousRecovery(chapter,results=[]){return results.filter(r=>r.chapter<chapter).sort((a,b)=>b.chapter-a.chapter)[0]||null;}
export function storyMessage(chapter,event,{results=[],mission={}}={}){
 const c=CHAPTERS[chapter%CHAPTERS.length],prior=previousRecovery(chapter,results);let text=c[event]||c.brief;
 if(event==='intro'&&prior){const decision=choice(prior,'purge');if(decision)text+=decision==='preserve'?' EOS still has the last station’s research. We bring its lessons in with us.':' The last bank was purged. EOS has the copied ledger, but we are working around the missing research.';}
 if(event==='record')text=c.record;
 if(event==='purge'&&mission.purgeBeforeRecord)text='The live bank is purged before I copied the control ledger. The sources are rupturing. I still have to recover what the separate archive kept.';
 if(event==='power-armory')text='Armory circuit committed. Flint gets the case open; the maintenance gap stays. More firepower, the harder crossing. I chose it and I’ll work around it.';
 if(event==='power-maintenance')text='Maintenance circuit committed. The bridge gives us a return route; the armory stays sealed. First rule of recovery: know how you are getting out.';
 if(event==='aftermath'&&mission.purged)text+=' The purge is in the report, including the research it cost.';
 return{id:`story-${chapter}-${event}`,speaker:'ROOK',text,chapter:c.title};
}
export function recoveryJournal(chapter,{mission=null,results=[]}={}){
 const c=CHAPTERS[chapter],completed=results.find(r=>r.chapter===chapter),record=completed||mission,paragraphs=[c.brief,...c.background];
 if(completed||mission?.record){paragraphs.push(c.caseTitle+' / RECOVERED: '+c.evidence);const research=choice(record,'purge');if(research)paragraphs.push('ROOK / '+storyMessage(chapter,research,{mission:record}).text);const power=choice(record,'power');if(power)paragraphs.push(storyMessage(chapter,'power-'+power).text);}
 return paragraphs;
}
export function campaignEnding(results){
 const completed=[...new Map(results.map((r,i)=>[r.chapter??i,r])).values()],saved=completed.filter(r=>choice(r,'purge')==='preserve').length,purged=completed.filter(r=>choice(r,'purge')==='purge').length,bridges=completed.filter(r=>choice(r,'power')==='maintenance').length;
 const ending=saved>=6?'The carrier line is stopped. The research you preserved lets the union cross-check the isolation protocol against several outbreaks. Reopening begins with supervised trials, not another promise on a shipping label.':purged>=6?'The carrier line is stopped. Your purges destroyed active hatcheries and much of the research tied to them. More stations must remain sealed while containment teams repeat the missing trials. The copied ledgers still establish who kept shipping after the warnings.':'The carrier line is stopped. The surviving banks establish a workable isolation procedure, with gaps marked wherever the research was lost. The union clears stations in stages and leaves the uncertain sections sealed.';
 const voices=completed.some(r=>r.chapter===5)?'Echo uses the recovered black box to verify incoming rescue calls. The emergency channel carries people who answer back.':'Echo keeps new rescue calls under independent verification until the missing relay records can be recovered.';
 const repairs=bridges>=6?'Flint turns your maintenance routes into the first clean recovery plans. Repaired stations become bases for reaching the next ones.':'Flint builds the clean repair effort around your recovered equipment records. The remaining blocked service routes will need another crew.';
 const lien=completed.some(r=>r.chapter===8)?'The Dock Nine approvals enter the hearing under your salvage lien. The first crew’s names remain attached.':'Your surviving manifests enter the union inquiry. The original Dock Nine approvals still need to be recovered.';
 return[ending,voices,repairs,lien,'Rook files the last report as salvage and recovery. The union keeps “specialist” beside his name. His suit still needs an overhaul. When the next station calls, he asks for its crew list before its cargo value.'].join('\n\n');
}
