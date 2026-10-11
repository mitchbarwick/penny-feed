import { make, ref } from "./helpers";

// ------------------------------------------------------------------ Rabbit Holes

export const rabbitHoles = [
  make("rabbit_hole", {
    id: "sample-antikythera",
    headline: "The shipwreck clock that nobody could have built",
    dek: "In 1901 sponge divers pulled a corroded lump of bronze from the sea. It took a century to understand what it was.",
    topics: ["History of science", "Engineering", "Forgotten inventions"],
    timeliness: "evergreen",
    significance: 0.82,
    published: 0,
    hour: 19,
    reason: "Gears, precision, and a mystery. It sits right where watches and history meet.",
    discoveredVia: "web",
    sources: [
      ref("https://en.wikipedia.org/wiki/Antikythera_mechanism", "Reference summary: Antikythera mechanism", "specialist"),
    ],
    caveats: ["Dating and some details of the front-dial reconstruction remain debated among researchers."],
    body: `In 1900 a group of Greek sponge divers, sheltering from a storm, dived near the tiny island of Antikythera and found the wreck of an ancient ship loaded with statues, glassware and coins. Archaeologists recovered the treasures. They also, almost as an afterthought, collected several shapeless, crusted lumps of corroded bronze.

In May 1902 one of those lumps split open. An archaeologist, Valerios Stais, noticed something that looked impossible: a gear wheel, with teeth.

## A machine in the wrong century

The ship probably sank in the first century BC. Nothing else we know of from the ancient Mediterranean looked like this. Geared devices of comparable sophistication don't reappear in the record until medieval astronomical clocks, well over a thousand years later.

For decades the fragments were treated as a curiosity, maybe an astrolabe. In the 1950s and 60s the historian Derek de Solla Price studied them with X-rays and argued that this was a gear-driven calculating machine for astronomy. Later three-dimensional X-ray scanning, in the 2000s, revealed far more: tiny inscriptions that worked as a user manual, and the full count of the gear teeth.

## What it did

Turn a handle, and the front dial showed the position of the Sun and Moon against the zodiac, the lunar phase, and a calendar. A back dial tracked the repeating cycles that ancient astronomers used to predict eclipses. A small pin-and-slot arrangement made one gear speed up and slow down, matching the Moon's real, uneven motion across the sky. More than thirty surviving gears, many with teeth cut by hand to a few millimetres' scale, fit in a case roughly the size of a shoebox.

Its makers clearly understood Babylonian-style astronomical cycles and Greek geometry, and they could turn that understanding into metal.

## What we still don't know

We don't know who built it, where, or whether it was one of many (there are hints that such devices may have been more common, and that the craft had a tradition behind it). Nobody knows what the ship was carrying it for. Parts of the planetary display are only partially reconstructed from missing pieces, and researchers still argue about how the front of it worked.

What makes it hard to stop thinking about is the *absence*. A device this accomplished implies a long line of earlier, simpler ones, and a workshop culture to match. They've all vanished. We have the one that happened to be on a boat. 🍒

*Sample item: written to show the Rabbit Hole format.*`,
  }),

  make("rabbit_hole", {
    id: "sample-harrison-h4",
    headline: "The watch that solved the sea, and the man who nearly wasn't paid for it",
    dek: "Finding your latitude is easy. Finding your longitude needed a clock that could keep time on a ship.",
    topics: ["Mechanical watches", "History of science", "Navigation"],
    timeliness: "evergreen",
    significance: 0.78,
    published: 2,
    hour: 20,
    reason: "Watchmaking and history, together. You'll like how stubborn everyone is in this one.",
    discoveredVia: "web",
    sources: [
      ref("https://en.wikipedia.org/wiki/John_Harrison", "Reference summary: John Harrison", "specialist"),
      ref("https://en.wikipedia.org/wiki/Marine_chronometer", "Reference summary: Marine chronometer", "specialist"),
    ],
    caveats: ["The sea-trial error is quoted in several slightly different forms; the order of magnitude (seconds over months) is not in doubt."],
    body: `A sailor can work out their latitude from the height of the Sun or the Pole Star. Longitude is harder. Because the Earth turns fifteen degrees every hour, your longitude is simply the difference between local time (easy, from the Sun) and the time at some fixed reference port (hard, because you need a clock that has kept perfect time across weeks of pitching and rolling, humidity and temperature swings).

In the eighteenth century, not knowing longitude killed sailors in large numbers. In 1714 the British Parliament offered a prize, up to £20,000 for a method accurate to within half a degree, a fortune at the time. It was administered by a Board of Longitude.

## The carpenter

John Harrison was a self-taught clockmaker from Yorkshire, whose pendulum clocks were among the most accurate in the world. He spent decades building a series of sea clocks, H1 to H3, which were large, ingenious brass contraptions. Then, in the late 1750s, he finished H4, which looked like an oversized pocket watch, about thirteen centimetres across.

## The test

In 1761 H4 sailed to Jamaica. After around eighty days at sea, it was found to be only about five seconds slow. In practical terms that's an error of just over a mile in position at the equator. This was a spectacular result, well within the prize's strictest terms, with room to spare.

## Then, bureaucracy

The Board didn't pay. It asked for a second trial, demanded that Harrison hand over his designs and have copies made by other watchmakers, and argued about whether the result had been a fluke. Harrison, by now in his sixties and fiercely proud, built a smaller, simpler version and was repeatedly told to wait. It was only after he petitioned King George III, who reportedly tested a Harrison watch himself and was impressed, that Parliament awarded him a substantial payment in 1773, when he was around eighty.

## Why it matters

Within a few decades marine chronometers descended from his ideas were being used on voyages like those of James Cook, who carried a copy of H4. In the long run the chronometer ended the guesswork that had kept ships on known routes and sometimes on rocks.

What stays with me is that the answer didn't come from the learned astronomers who had expected to win, but from someone who understood friction, springs and how metal behaves when it's warm. That's a recurring pattern, if you go looking. 🍎

*Sample item: written to show the Rabbit Hole format.*`,
  }),

  make("rabbit_hole", {
    id: "sample-lunokhod-mirror",
    headline: "The Soviet moon rover that was lost for forty years, then found by a laser",
    dek: "Lunokhod 1 vanished in 1971. In 2010 a satellite photograph and a telescope in New Mexico brought it back.",
    topics: ["Space exploration", "History", "Commercial spaceflight"],
    timeliness: "evergreen",
    significance: 0.74,
    published: 3,
    hour: 21,
    reason: "Space history with a proper twist at the end.",
    discoveredVia: "web",
    sources: [
      ref("https://en.wikipedia.org/wiki/Lunokhod_1", "Reference summary: Lunokhod 1", "specialist"),
      ref("https://en.wikipedia.org/wiki/Lunar_Laser_Ranging_experiment", "Reference summary: Lunar Laser Ranging experiment", "specialist"),
    ],
    body: `In November 1970 the Soviet probe Luna 17 landed on the Moon and rolled out a remarkable machine: Lunokhod 1, the first remotely driven vehicle to operate on another world. It looked a bit like a bathtub on eight wheels with a lid that opened to charge its batteries from the Sun. It was steered by a small team of drivers on Earth who had to cope with a few seconds' delay and a very poor view.

It lasted far longer than anyone planned, roughly eleven months, and travelled more than ten kilometres. Then, in September 1971, contact was lost, and over the years its exact position was forgotten.

## The mirror

Lunokhod carried an unusual passenger: a French-built reflector, an array of corner-cube prisms of the kind that return light directly to where it came from. Its job was to be a target for lasers fired from Earth, so scientists could measure the distance to the Moon with extraordinary precision. It's the same trick used by the retroreflectors left by Apollo astronauts.

Early on, the mirror was used. As the years passed, its exact position on the surface became uncertain, and nobody could reliably aim at it.

## Rediscovery

In 2009 NASA's Lunar Reconnaissance Orbiter began photographing the Moon's surface in detail, and the orbiter imaged the rover. Its tracks, and the descent stage that had delivered it, were visible. With a precise location in hand, a team at the Apache Point Observatory in New Mexico, led by the physicist Tom Murphy, pointed their laser at that spot in April 2010. They got a signal back. The mirror, half a century old and untouched, was still working.

The recovery was a small surprise in itself: researchers had assumed a reflector left on the surface for decades could simply have been lost to dust and temperature swings.

## A small, lovely idea

I find it hard not to love this. A machine abandoned in a place nobody can visit, and a patient scientist firing a beam at where it ought to be, and getting the light back. 🍒

*Sample item: written to show the Rabbit Hole format.*`,
  }),

  make("rabbit_hole", {
    id: "sample-susan-kare",
    headline: "The artist who drew the smile on the first Macintosh",
    dek: "Susan Kare trained as a sculptor, joined Apple in 1982, and designed the way a generation learned to click.",
    topics: ["Design history", "Computing history", "Iconography"],
    timeliness: "evergreen",
    significance: 0.76,
    published: 6,
    hour: 10,
    reason: "Design history and computing history in one person. She also turns up in the Macintosh series.",
    discoveredVia: "web",
    sources: [ref("https://en.wikipedia.org/wiki/Susan_Kare", "Reference summary: Susan Kare", "specialist")],
    caveats: ["Details of the Command-key symbol's origin are widely told; check against primary interviews if quoting."],
    body: `When the first Macintosh appeared in 1984, a lot of the personality was in tiny details: a smiling computer at start-up, a trash can for deleted files, a wristwatch while you waited, a pointing hand, a bomb when things went wrong. Almost all of them came from one person, Susan Kare.

Kare was a sculptor and graphic artist with no background in computing when her old school friend, the Mac software engineer Andy Hertzfeld, suggested her to the team. She started at Apple in 1982.

## Pixels as a craft

The Macintosh screen was a grid of 512 by 342 black-or-white dots. An icon was typically 32 by 32 of them, so every shape had to be drawn on graph paper and then translated into a pattern of ones and zeros. Kare has described borrowing from the traditions of mosaic, needlepoint and cross-stitch, crafts that make an image from a few coarse squares. Her gift was knowing what could be *left out*.

She also designed typefaces for the screen, including Chicago and Geneva, naming a family after cities (Chicago, Geneva, New York, Toronto, Monaco...).

## The small things that stuck

- **The Happy Mac**, the little face that greeted you at start-up and meant everything was fine.
- **The Command key symbol**, which she took from a looped square used on Scandinavian signs to mark places of interest. The Mac needed a symbol for a new key, and she found one that was already being used to say "worth a look".
- **The dogcow**, Clarus, an accidental mascot that grew out of a character in a symbol font she designed.

## What came after

Kare went on to design icons for the NeXT computer, then for Microsoft Windows 3.0, where her playing cards for the Solitaire game became familiar to millions. She has since worked with companies like Facebook and Pinterest, and designed for Sun and IBM along the way.

Lots of interface design has since chased complexity. Kare's work is a reminder that a simple picture, drawn with very few dots, by somebody who cares, can be what makes a machine feel friendly. 🍓

*Sample item: written to show the Rabbit Hole format.*`,
  }),

  make("rabbit_hole", {
    id: "sample-emu-war",
    headline: "The time the Australian army lost a war to some birds",
    dek: "In 1932, machine guns went up against about twenty thousand emus. It did not go the way the military had planned.",
    topics: ["Australian history", "Nature", "Unexpected history"],
    timeliness: "evergreen",
    significance: 0.55,
    published: 5,
    hour: 20,
    reason: "Properly outside your usual lanes, on purpose. A palate cleanser, and a true one.",
    discoveredVia: "web",
    sources: [
      ref("https://en.wikipedia.org/wiki/Emu_War", "Reference summary: Emu War", "specialist"),
    ],
    caveats: ["Kill counts come largely from the commander's own reports and are contested; the broad shape of the story is not."],
    body: `After the First World War, the Australian government resettled thousands of returned soldiers on farmland in Western Australia, much of it marginal country in the wheatbelt. Then the Great Depression arrived, wheat prices fell, and the farmers were encouraged to grow even more of it.

In 1932 they also had visitors. Something like twenty thousand emus, migrating inland to the coast after breeding season, found that the new wheat fields and their fences made an excellent place to eat and to rest. The farmers, many of them veterans, asked the government for help. They asked for machine guns.

## The campaign

The Defence Minister agreed. Soldiers from the Royal Australian Artillery were sent out in November 1932 under Major G.P.W. Meredith, with two Lewis guns and several thousand rounds of ammunition. Newspaper reports of the time were cheerful about the prospects. The plan was to herd the emus into ambush and fire.

The emus had not read the plan. They split into small groups that scattered in different directions, and a bird that is built for sprinting turns out to be hard to hit with a vehicle-mounted gun on rough ground. The soldiers tried driving a truck after them; it couldn't keep up. In one account a gun jammed just as a large flock came into range.

## The tally

By Meredith's own reports, the soldiers killed hundreds of emus over a few weeks, in return for thousands of rounds. The figures he gave were never very consistent, and historians treat them with caution. What isn't disputed is that the operation drew embarrassed attention in parliament and the press, was suspended after about a week, restarted briefly, and then ended in December, with the birds still very much there.

The farmers kept asking, and in later years the state turned to bounties instead, which proved considerably more effective than soldiers.

## What I like about it

It's rare that a story like this is quite so well documented, and rarer still that it's quite so *Australian*. A very serious government response to a very silly problem, and an opponent that simply declined to cooperate.

It's also a reminder that when a plan fails because the other side adapts, calling it a "war" doesn't help. 🍒

*Sample item: written to show the Rabbit Hole format.*`,
  }),
];

// ------------------------------------------------------------------ Deep Dives

export const deepDives = [
  make("deep_dive", {
    id: "sample-generated-interfaces",
    headline: "When the interface is generated: what happens to the craft of product design?",
    dek: "If software can assemble a screen on demand, what are designers actually designing?",
    topics: ["AI and product design", "Interaction design", "Generative UI"],
    timeliness: "evergreen",
    significance: 0.9,
    published: 1,
    hour: 7,
    reason: "Top of your list. I've kept fact and speculation visibly apart, because this is a subject that attracts a lot of hand-waving.",
    discoveredVia: "web",
    sources: [
      ref("https://alistapart.com/article/responsive-web-design/", "A List Apart: Responsive Web Design", "essay", "Origin of the term 'responsive design' (2010)."),
    ],
    caveats: ["The 'what may happen' sections are analysis and opinion, not reporting."],
    body: `Most software interfaces are drawn once, by a person, and then shown to everyone. A button is where the designer put it. A new idea is gathering strength: that the model behind a product could assemble the interface *at the moment you need it*, shaped to your task, your history and your device.

This piece tries to separate what's real about that from what's speculation.

## What's established

**The plumbing exists.** Language models can already produce structured output instead of prose, such as a description of a form, a chart, a list of options, and an application can render that description using its own components. Several toolkits have made this routine for developers.

**It isn't wholly new.** Interfaces have been adapting for a long time. Responsive design, coined as a term by Ethan Marcotte in 2010, taught pages to rearrange themselves for different screen sizes using rules a designer wrote in advance. Personalised feeds reorder content for each person. What's different now is that the *structure* of the screen, not just its order or size, could be decided on the fly.

**There's a boundary.** In practice, generated interfaces work best when the model is not drawing pixels but choosing and filling in pieces from a design system: approved components, spacing, tone and accessibility rules. The model is a very flexible assembler working inside a box someone else built.

## What changes for designers

~ My reading is that this moves the centre of the job. Less of the work is composing individual screens, and more is designing the *rules and vocabulary* the screens will be built from: the components, their states, the constraints on what can appear next to what, and the tone of voice they speak in.

~ A design system stops being documentation and becomes something closer to a specification a machine must obey. That makes it more important, not less.

~ The designer also has to design for *behaviour*, such as what the system does when it is unsure, how it shows its reasoning, how someone corrects it, and what it must never do. Those are interaction-design questions, but they're asked about a process, not a page.

## What could go wrong

~ **Learnability.** People build mental maps of software: where a thing is, how it works. An interface that rearranges itself on every visit asks them to start again. Consistency has always been a form of kindness, and generated screens will need to be deliberately consistent where it counts.

~ **Accessibility and testing.** A designer can check a fixed set of screens against accessibility standards. A system that can produce a million variants needs those checks built into the components, because nobody can review them all by eye.

~ **Brand and trust.** If every person sees something a bit different, the product's character has to live somewhere other than in a particular layout. It would need to live in language, behaviour and constraint.

## Where you can already see it

Search engines have long assembled little answer panels (a weather forecast, a sports score, a currency converter) from a fixed set of templates, picked per query. That's a generated interface in a modest sense: nobody drew that exact screen for your exact question, but nobody drew it from scratch either. The pieces were designed once, and the choice among them was automatic.

What's new is the breadth of that choice. When the selection is made by a language model rather than a lookup table, the range of things it can assemble gets very wide, and so do the ways it can get things subtly wrong.

## What a designer still decides

~ I'd put it as five decisions that don't go away. *Vocabulary*: which components exist, and what each one means. *Grammar*: which combinations are allowed and which are never allowed. *Voice*: how the thing talks when it's confident, and how it talks when it isn't. *Escape hatches*: how a person overrules it, undoes it, or asks for the plain version. *Evidence*: what the system must show before it's trusted with something consequential.

~ Teams that skip the last two tend to build something impressive that people quietly stop using. A convincing demo only needs the first three.

## Questions I'd ask any team shipping this

~ Can I get back to a screen I used yesterday? If not, the product has no memory of its own shape, and I won't either.

~ What happens at the edges? A generated form that quietly drops a required field, or a chart that picks a misleading axis, is a design failure even though no designer drew it.

~ Who is accountable for a bad screen? With a hand-drawn interface the answer is obvious. With a generated one it should still be obvious, and I suspect that's where many organisations will be caught out.

## What I'd watch for

~ The most useful early signal won't be the dazzling demos. It will be mundane products where generated interfaces quietly reduce effort, such as a settings screen that only shows what's relevant, or a dashboard that builds the right chart for a question, while still feeling like one coherent product.

~ If that works, the craft shifts from drawing the product to *defining* it. I think that's a better job, if a stranger one. I could be wrong. 🍎

*Sample item: written to show the Deep Dive format, including its separation of fact and analysis.*`,
  }),

  make("deep_dive", {
    id: "sample-quartz-crisis",
    headline: "Why mechanical watches survived the thing that should have killed them",
    dek: "In 1969 a battery-powered watch was cheaper, more accurate and more robust. The old kind came back anyway.",
    topics: ["Mechanical watches", "Design history", "Industry history"],
    timeliness: "evergreen",
    significance: 0.8,
    published: 4,
    hour: 19,
    reason: "Mechanical watches again, from a different angle: what happens to craft when its purpose is made obsolete.",
    discoveredVia: "web",
    sources: [
      ref("https://en.wikipedia.org/wiki/Quartz_crisis", "Reference summary: Quartz crisis", "specialist"),
      ref("https://en.wikipedia.org/wiki/Seiko_Astron", "Reference summary: Seiko Astron", "specialist"),
    ],
    caveats: ["Employment and production figures for the Swiss industry vary by source; the scale of the decline is not disputed."],
    body: `On Christmas Day 1969, the Japanese company Seiko put on sale the Astron, the world's first quartz wristwatch. It cost about as much as a small car in Japan, but its technology rapidly fell in price and a new reality set in: a battery-powered watch was more accurate than the finest mechanical movement, needed no winding, and could be made by the million.

What followed was one of the most dramatic collapses in the history of manufacturing.

## What happened

The Swiss watch industry, which had dominated the world for generations, was slow to respond. Through the 1970s and into the early 1980s, hundreds of firms closed or merged, and the number of people employed in Swiss watchmaking fell by roughly two-thirds. Japanese and later Hong Kong manufacturers took the mass market. In many places the knowledge of how to make a mechanical movement was in danger of being lost.

The Swiss response was partly commercial. In 1983 the Swatch, a plastic quartz watch with a distinctive, colourful and cheap design, helped to save the volume end of the business. The two Swiss firms that merged into what became the Swatch Group were rescued by that approach.

But the more interesting story is what happened to the *mechanical* watch.

## The revival

By the 1980s a handful of people began to argue that the mechanical watch had a future precisely because it had lost its job. A few small makers kept going. Blancpain, a name that had been dormant, was bought and revived in 1982, and its new owners made a deliberate pitch that they would make only mechanical watches. Others followed. By the 1990s mechanical watches were being sold as luxury objects, and the high end of the industry was growing again.

## Why it worked

~ My reading is that the revival rested on a change in *what the product was for*. A quartz watch is the better instrument for telling the time, so the only reason to choose a mechanical watch was something that quartz could not provide: skill you could see, a movement you could admire through a glass back, a machine that didn't need a battery, and a link to a tradition.

~ Once a thing no longer has to be useful, it can afford to be meaningful. The industry stopped selling accuracy and started selling craft, rarity and heritage. That's a different business, and a much smaller one, but a richer one.

~ It's also worth noticing what was *kept*. The watches that thrived were ones where the mechanism was honest and visible, and where the maker could point at real skill.

## What the survivors looked like

The firms that came through were not the ones that tried to out-quartz the quartz makers. Some did the opposite and leaned into the tradition. Others did both: the Swiss industry's two big groups merged in the early 1980s and, led by Nicolas Hayek, aimed Swatch at the cheap end while keeping older, grander names alive at the top.

Meanwhile a handful of independent makers kept the knowledge going through the lean years. Some survived by repairing and restoring other people's watches, which turned out to be a way of keeping the skills alive until the market caught up again.

The recovery was uneven. By value, Swiss exports are now carried by the expensive end of the market, where a mechanical movement is part of the point. By volume, the cheap end belongs to someone else entirely.

## And then it happened again

Smartwatches have since done to the quartz watch roughly what quartz did to the mechanical one. By some estimates, a single smartwatch maker has at times shipped more units in a year than the whole Swiss industry. The classic watch makers' reaction has, so far, been much the same as before: sell what the new thing can't.

## What it might say about the present

~ It is tempting to apply this to other crafts that technology has made unnecessary, such as handwriting, film photography, vinyl or hand-built furniture. The pattern does appear in many of them: the work loses its function, and then finds a second life as something valued for its own sake.

~ It doesn't always happen, and it doesn't save the workers who lost the first job. The Swiss industry survived, but at a fraction of its former size, and a lot of skilled people simply left. I think that's the part worth remembering when we talk about craft "coming back". 🍒

*Sample item: written to show the Deep Dive format, including its separation of fact and analysis.*`,
  }),
];

// ------------------------------------------------------------------ From My Circle

export const circle = [
  make("circle", {
    id: "sample-circle-jordan",
    headline: "Jordan Example has started a new role",
    topics: ["Circle"],
    person: "Jordan Example",
    timeliness: "current",
    significance: 0.6,
    published: 0,
    hour: 8,
    reason: "Jordan is one of the people you asked me to keep an eye on.",
    discoveredVia: "social",
    sources: [ref("https://example.com/jordan-example/new-role", "Jordan's public announcement (sample link)", "personal")],
    body: `Jordan Example has announced a move to a new role as head of design at a small studio. They posted about it publicly, with a line of thanks to their previous team. It looks like a good one. 🍓

*Sample item. Jordan is a made-up person, shown here only to demonstrate the format. Real items would link to the original post and nothing else.*`,
  }),
];
