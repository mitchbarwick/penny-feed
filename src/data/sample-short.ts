import { make, ref } from "./helpers";

// ------------------------------------------------------------------ Updates

export const updates = [
  make("update", {
    id: "sample-starship-catch",
    headline: "A rocket booster was caught out of the air by a launch tower",
    dek: "Starship's fifth test flight did something no orbital-class rocket had done before.",
    topics: ["Commercial spaceflight", "Rockets"],
    eventDate: "2024-10-13T00:00:00Z",
    timeliness: "current",
    significance: 0.86,
    published: 0,
    hour: 6,
    reason: "It's the sort of thing people will point back to as the moment reuse got properly strange.",
    discoveredVia: "web",
    sources: [
      ref("https://en.wikipedia.org/wiki/Starship_flight_test_5", "Reference summary: Starship flight test 5", "specialist"),
    ],
    caveats: ["Whether catching beats landing legs on total cost is an open question; no one outside SpaceX has the numbers."],
    body: `On 13 October 2024, on its fifth test flight, SpaceX flew the first stage of Starship, the Super Heavy booster, back to its launch site in Texas and caught it in mid-air. Not landed it. *Caught* it, between two huge steel arms on the launch tower, roughly seven minutes after liftoff.

The booster is about 71 metres tall, and it came down on a column of relaunched engines, slowing to a near-hover beside the tower before the arms closed around two small pins on its sides. The upper stage, meanwhile, carried on, flew most of the way round the planet on a suborbital arc and made a controlled splashdown in the Indian Ocean.

**Why it matters.** A rocket that lands on its own legs has to carry those legs all the way to space and back, which is dead weight on every flight. Catching it removes them and, in principle, lets the tower double as the pad where the booster is inspected and restacked, which could shorten the turnaround between flights a lot.

**What's still unproven.** One catch is a demonstration, not an operating model. The real test is whether boosters can be caught, inspected and reflown many times without the refurbishment bill eating the savings, and that's an engineering and cost story that will take years to tell. Honestly, though? Watching that tower close its arms was one of the better things I've seen anyone build. 🍒

*Sample item: a real past event, written to show the Update format. Not live reporting.*`,
  }),

  make("update", {
    id: "sample-voyager-fix",
    headline: "Voyager 1 was fixed from more than twenty light-hours away",
    dek: "Engineers repaired a 1970s computer by moving its software around inside a memory chip that had partly failed.",
    topics: ["Space exploration", "Engineering"],
    eventDate: "2024-04-20T00:00:00Z",
    timeliness: "current",
    significance: 0.7,
    published: 1,
    reason: "Engineering patience at its most charming.",
    discoveredVia: "web",
    sources: [ref("https://science.nasa.gov/mission/voyager/", "NASA: Voyager mission pages", "official")],
    body: `In November 2023, Voyager 1, launched in 1977 and now the most distant human-made object, stopped sending usable engineering data. It was still receiving commands and still transmitting, but what came back was an unreadable stream of repeating patterns.

The team traced the fault to the spacecraft's flight data subsystem, and then to a single chip whose memory had stopped working properly. The computer on board has only tens of kilobytes to play with, so there was no spare room to simply work around it.

Their solution, which arrived in April 2024, was to break the affected code into pieces and tuck those pieces into free corners elsewhere in the memory, adjusting references so everything still pointed to the right places. Each command takes more than twenty hours to arrive and the same again for a reply, so every step was a wait of about two days to find out whether it had worked. On 20 April the spacecraft started sending readable engineering data again.

**Why it's interesting.** It's not the rescue that's remarkable; it's the working conditions: a half-century-old design, no hardware access, a conversation conducted in day-long pauses, and a team that understood the original system well enough to rearrange it blind.

*Sample item: a real past event, written to show the Update format. Not live reporting.*`,
  }),

  make("update", {
    id: "sample-casgevy-approval",
    headline: "The first CRISPR-based medicine has been approved",
    dek: "A one-time treatment for sickle cell disease changes what 'gene editing' means for patients.",
    topics: ["Gene editing", "Medicine"],
    eventDate: "2023-11-16T00:00:00Z",
    timeliness: "current",
    significance: 0.84,
    published: 2,
    reason: "You've asked how these treatments work. The explainer below does that, and this is the news hook for it.",
    discoveredVia: "web",
    sources: [ref("https://en.wikipedia.org/wiki/Exagamglogene_autotemcel", "Reference summary: exagamglogene autotemcel (Casgevy)", "specialist")],
    caveats: ["Treatment cost, hospital stay and long-term outcomes are still being established; check current figures before relying on them."],
    body: `In November 2023 the UK medicines regulator approved Casgevy, a treatment for sickle cell disease and for transfusion-dependent beta thalassaemia. The US FDA followed in December for sickle cell. It's the first approved medicine based on CRISPR gene editing, developed by Vertex Pharmaceuticals and CRISPR Therapeutics.

It isn't a pill or an injection in the usual sense. Doctors collect a patient's own blood stem cells, edit them in a laboratory, and return them after clearing out the patient's existing bone marrow with chemotherapy. The edit switches back on a form of haemoglobin that babies make before birth, which doesn't distort red blood cells into the sickle shape.

**Why it matters.** Sickle cell disease causes severe pain and organ damage for millions of people, and the existing cures depend on finding a matched donor. A therapy built from the patient's own cells removes that barrier, at least in principle.

**The catch.** The process is long, hospital-based and expensive, with a US list price above two million dollars. Whether it can reach the many patients who most need it is a question of access, not just science.

*Sample item: a real past event, written to show the Update format. Not live reporting.*`,
  }),

  make("update", {
    id: "sample-alphafold-nobel",
    headline: "A Nobel Prize went to the people who taught computers to fold proteins",
    dek: "The 2024 Chemistry prize recognised both protein-structure prediction and protein design.",
    topics: ["AI", "Science", "AI and product design"],
    eventDate: "2024-10-09T00:00:00Z",
    timeliness: "current",
    significance: 0.78,
    published: 3,
    reason: "AI as a scientific instrument rather than a chatbot. That's a design story as much as a science one.",
    discoveredVia: "web",
    sources: [ref("https://www.nobelprize.org/prizes/chemistry/2024/press-release/", "The Nobel Prize: Chemistry 2024 press release", "primary")],
    body: `The 2024 Nobel Prize in Chemistry was split between two ideas. One half went to David Baker for computational protein design: building entirely new proteins that nature never made. The other half went jointly to Demis Hassabis and John Jumper of Google DeepMind for AlphaFold, an AI system that predicts the three-dimensional shape of a protein from its amino-acid sequence.

That second problem had stood open for about fifty years. A protein's shape determines what it does, and working a shape out in the laboratory could take months or years. AlphaFold's second version stunned the field's biennial prediction contest in 2020 by reaching accuracy close to experimental methods for many proteins, and DeepMind and EMBL-EBI later released predicted structures for a vast number of proteins, free for anyone to search.

**What's different about this one.** A lot of AI news is about products. This is about an instrument: a tool that changes what questions a scientist can ask in an afternoon. Predictions still need testing in the lab, and there are proteins and situations where AlphaFold is much less reliable, but the day-to-day practice of structural biology has moved.

*Sample item: a real past event, written to show the Update format. Not live reporting.*`,
  }),
];

// ------------------------------------------------------------------ Explainers

export const explainers = [
  make("explainer", {
    id: "sample-how-watches-tick",
    headline: "How a mechanical watch counts time without electricity",
    dek: "A spring, a handful of gears, and a tiny wheel that swings back and forth four times a second.",
    topics: ["Mechanical watches", "Engineering"],
    timeliness: "evergreen",
    significance: 0.6,
    published: 1,
    hour: 18,
    reason: "Mechanical watches are on your list, and this is the one idea everything else hangs off.",
    discoveredVia: "web",
    sources: [ref("https://en.wikipedia.org/wiki/Escapement", "Reference summary: Escapement", "specialist")],
    body: `A mechanical watch is a machine for doing one thing very evenly: letting a small amount of energy out at a steady rate. Everything inside it serves that job.

## The store of energy

Winding the crown coils a flat spring, the *mainspring*, inside a drum called the barrel. A tightly wound mainspring wants to unwind, and it does so through a chain of gears (the *going train*) that ends at the hands. On its own, the spring would simply uncoil in a second or two. Something has to hold it back.

## The part that holds it back

That something is the *escapement*, and it's the cleverest bit. At the end of the gear train sits the escape wheel, a toothed wheel which a small lever, the pallet fork, alternately locks and releases. Each time a tooth slips past, the wheel advances by one step, and as it does it gives the lever a tiny push.

That push goes into the *balance wheel*, a small weighted ring attached to a hairspring. The balance swings one way, the hairspring pulls it back, and so on, rather like a pendulum that works in any orientation. A common modern rate is 28,800 swings an hour, which is four per second, and each swing lets one tooth pass. That's the tick you hear: the lever hitting its stops.

## Why the balance matters most

The watch is only as steady as the balance wheel's swing is regular. A hairspring behaves almost identically whether it is swinging widely or narrowly, which is a handy property because the push it receives weakens as the mainspring unwinds. Watchmakers spend enormous effort on the things that disturb it: temperature, which changes the springs' stiffness; position, as gravity tugs on the wheel differently when the watch is lying flat or on edge; and shock. Modern alloys and clever hairspring shapes have taken much of the sting out of these problems.

## How accurate is accurate?

A good mechanical movement can run within a few seconds a day. The Swiss COSC chronometer standard allows roughly minus four to plus six seconds a day. A cheap quartz watch will beat that without trying, which is the interesting part: the reason anyone still cares about mechanical watches is not accuracy.

It's that you can open the back and see every single thing that makes it work. 🍎

*Sample item: written to show the Explainer format.*`,
  }),

  make("explainer", {
    id: "sample-reusable-rockets",
    headline: "Why landing a rocket changed what launching one costs",
    dek: "Fuel is cheap. The rocket is not. That's the whole story, and it's a bit more subtle than it sounds.",
    topics: ["Commercial spaceflight", "Economics of launch"],
    timeliness: "evergreen",
    significance: 0.68,
    published: 2,
    hour: 17,
    reason: "You follow launch vehicles; this is the economics underneath the spectacle.",
    discoveredVia: "web",
    sources: [ref("https://en.wikipedia.org/wiki/Falcon_9", "Reference summary: Falcon 9", "specialist")],
    caveats: ["Operators' real internal costs and refurbishment figures are not public. Treat any single per-launch cost figure with caution."],
    body: `For most of spaceflight's history, a rocket was a single-use machine. You built a vehicle costing tens or hundreds of millions of dollars, burned it for a few minutes, and let most of it fall into the sea. The propellant is a tiny fraction of the bill; the *hardware* is the expense. It's roughly as if every airline flight ended with the plane being thrown away.

## The obvious idea, and why it was hard

Reuse is the obvious fix, but a rocket stage returning from space is a very awkward thing to land. It's tall, thin, nearly empty, and has to slow from supersonic speeds, steer through the atmosphere and then touch down on a precise spot using engines that were never designed to run at very low throttle.

SpaceX's Falcon 9 first stage did it for the first time in December 2015, and an already-flown booster was launched again in March 2017. Since then, reflights have become routine, and individual boosters have flown many times.

## What reuse actually costs you

It isn't free. A booster that is going to return must keep some propellant back for the landing burn and carry extras such as grid fins and landing legs, so the rocket can lift less to orbit than an identical expendable one. Then there's the refurbishment between flights, which in practice has gotten lighter as the design has matured.

The trade is that this lost performance is paid for again and again by the savings: the most expensive part of the vehicle gets to be used many times.

## Why it also changes behaviour

Cost per launch is only half the story. When the operator is also its own biggest customer (SpaceX launches thousands of its own satellites), a cheap launch becomes an internal advantage that competitors selling single-use rockets can't easily match. It lets the company fly often, learn quickly from each flight, and attempt things others couldn't justify.

That's why catching and relaunching boosters is such a big deal and why the next step, fully reusable upper stages, is being chased so hard. The prize is not a cheaper ticket so much as a different kind of industry.

*Sample item: written to show the Explainer format.*`,
  }),

  make("explainer", {
    id: "sample-how-gene-editing-works",
    headline: "How a gene-editing treatment is actually made",
    dek: "Casgevy isn't an injection of 'edited genes'. It's a patient's own cells, edited in a lab and given back.",
    topics: ["Gene editing", "Medicine", "Science"],
    timeliness: "evergreen",
    significance: 0.74,
    published: 4,
    hour: 8,
    reason: "Follows on from the Casgevy approval, because 'it edits genes' doesn't explain much.",
    discoveredVia: "web",
    sources: [
      ref("https://en.wikipedia.org/wiki/Exagamglogene_autotemcel", "Reference summary: exagamglogene autotemcel", "specialist"),
      ref("https://en.wikipedia.org/wiki/CRISPR_gene_editing", "Reference summary: CRISPR gene editing", "specialist"),
    ],
    body: `Sickle cell disease is caused by a single-letter error in the gene that makes the beta chain of haemoglobin, the protein in red blood cells that carries oxygen. The faulty haemoglobin makes the cells stiff and crescent-shaped, and they get stuck in small blood vessels.

The clever part of Casgevy is that it doesn't try to repair that gene. It works around it.

## A gene everyone already has

Before birth, we make a different haemoglobin, fetal haemoglobin, which works fine and doesn't sickle. Shortly after birth, a protein called BCL11A turns that gene off and adult haemoglobin takes over. If you could stop BCL11A from doing that, patients might keep making the healthy fetal kind.

## The edit

CRISPR-Cas9 is a pair of molecular scissors guided by a short strand of RNA to one exact spot in the genome. Casgevy points them at a switch that controls BCL11A *specifically in red blood cell precursors* and makes a cut there. When the cell patches the break, the switch usually ends up broken, so BCL11A stays quiet in those cells, and fetal haemoglobin comes back.

## The process

1. **Collect.** The patient's blood stem cells are gathered from the blood after medication pushes them out of the bone marrow.
2. **Edit.** In a manufacturing laboratory the stem cells are edited with CRISPR and checked.
3. **Clear space.** The patient receives chemotherapy to remove the existing bone marrow cells, which is difficult and carries risks, including infertility.
4. **Return.** The edited cells are infused back and settle in the marrow, where they make new, edited red blood cells.

The patient's eggs or sperm aren't touched. The change stays in that person's blood cells and isn't passed to their children.

## The open questions

It's early. Long-term safety (including whether edits happen where they shouldn't) is still being watched, the process takes months and a hospital stay, and the price is out of reach for most of the world. The science has arrived, then; now the hard part is everything around it.

*Sample item: written to show the Explainer format.*`,
  }),

  make("explainer", {
    id: "sample-rams-principles",
    headline: "Why Dieter Rams' ten principles outlived the products they described",
    dek: "They read less like a style guide and more like a way of keeping a designer honest.",
    topics: ["Design history", "Product design", "AI and product design"],
    timeliness: "evergreen",
    significance: 0.62,
    published: 5,
    hour: 9,
    reason: "Design history is a favourite of yours, and these principles keep showing up in current product conversations.",
    discoveredVia: "web",
    sources: [ref("https://en.wikipedia.org/wiki/Dieter_Rams", "Reference summary: Dieter Rams", "specialist")],
    body: `Dieter Rams spent decades as Braun's chief of design, shaping radios, record players, razors, calculators and kitchen appliances that still look contemporary. He also designed the 606 Universal Shelving System for Vitsœ in 1960, which remains in production.

Late in his career he wrote down ten principles for good design. In short, good design is innovative, makes a product useful, is aesthetic, makes a product understandable, is unobtrusive, is honest, is long-lasting, is thorough down to the last detail, is environmentally friendly, and is *as little design as possible*.

## Why these ones lasted

It isn't because they describe a look. A Braun shaver and a modern phone share almost no surface features. They've lasted because they're mostly about what a designer shouldn't do.

*Honest* means not pretending a product is more innovative, powerful or valuable than it is. *Unobtrusive* means a tool should step back and let its owner get on with the work. *Long-lasting* is a direct rebuke to fashion. Several are brakes on ego: the principles keep pulling the designer's attention away from the designer and back to the person using the thing.

## The idea behind the last principle

"Less, but better" was Rams' own summary. It isn't a recommendation to strip things out. It's a statement about concentration: if you remove everything that isn't essential, what remains has to carry the weight, so it had better be good.

## Why people keep reaching for them

Technology periodically gives designers enormous new freedom (touchscreens, animation, and now interfaces that generate themselves), and every time, the temptation is to use all of it. The principles are a standing reminder that capability is not a design decision. Choosing what *not* to do is.

That's probably why they get quoted most when something new arrives. 🍎

*Sample item: written to show the Explainer format.*`,
  }),
];
