import type { Series } from "@/lib/types";
import { make, ref } from "./helpers";

const MAC_ID = "sample-making-of-the-macintosh";

const macSources = [
  ref("https://www.folklore.org/", "Folklore.org: Macintosh stories by Andy Hertzfeld and others", "archive", "First-hand recollections. Memory is fallible; treat as testimony."),
  ref("https://en.wikipedia.org/wiki/Macintosh", "Reference summary: Macintosh", "specialist"),
  ref("https://en.wikipedia.org/wiki/Jef_Raskin", "Reference summary: Jef Raskin", "specialist"),
  ref("https://en.wikipedia.org/wiki/1984_(advertisement)", "Reference summary: 1984 (advertisement)", "specialist"),
];

export const macSeries: Series = {
  id: MAC_ID,
  title: "The Making of the Macintosh",
  description:
    "How a small, stubborn team inside Apple built a computer for people who didn't want a computer, and nearly broke the company doing it. Five chapters, about five minutes each.",
  subject: "Apple, 1979 to 1985",
  topics: ["Computing history", "Design history", "Macintosh"],
  motif: "window",
  status: "suggested",
  researchStatus: "ready",
  totalChapters: 5,
  outline: [
    "An appliance on paper: Jef Raskin's idea",
    "The visitor from Lisa: Jobs takes over",
    "Texaco Towers: pixels, pirates and a very small amount of memory",
    "Twenty-four January: the launch",
    "The long hangover: what the Mac became",
  ],
  sources: macSources,
  reason: "You've been reading about early interfaces and Susan Kare. This is the story around them.",
  sample: true,
  version: 1,
};

const ch = (n: number, headline: string, dek: string, body: string, recap?: string) =>
  make("series_chapter", {
    id: `${MAC_ID}-ch${n}`,
    headline,
    dek,
    body,
    recap,
    topics: ["Computing history", "Design history", "Macintosh"],
    timeliness: "evergreen",
    significance: 0.8,
    published: 0,
    hour: 6,
    seriesId: MAC_ID,
    chapter: n,
    reason: "",
    discoveredVia: "web",
    sources: macSources,
    caveats: ["Where this chapter relies on recollection rather than documents, it says so."],
  });

export const macChapters = [
  ch(
    1,
    "An appliance on paper",
    "Chapter 1 of 5. Before the mouse, before Jobs, there was an argument about who computers were for.",
    `In 1977 Apple had a hit. The Apple II was a friendly, colourful computer that you could plug into a television, and it was selling to schools, small businesses and a great many hobbyists. By the end of the decade it was paying for everything else the young company wanted to try.

Jef Raskin thought the Apple II was still too much of a computer.

Raskin was a restless, well-read man who had taught computer science, played in orchestras, and joined Apple in 1978 to run its publications department. He had a thesis, and he wrote it up in 1979: the future of personal computing was not another machine for people who liked machines. It was an appliance. Something you could take out of the box, plug in, and use, with no manual to wade through and no configuration. Cheap, portable, and complete in a single case, with the screen built in.

## What's in a name

Raskin gave the project a name that came from his favourite apple, the McIntosh. He spelled it *Macintosh*, which didn't help much, because there was already a well-known hi-fi company called McIntosh Laboratory. The spelling was close enough to cause trouble later, but that is a different story.

The team was tiny. Raskin was joined by a few engineers, and they worked in a small space under the blunt constraints of his plan: the machine should sell for around a thousand dollars, which meant it couldn't have very much inside it.

## A different idea of simple

Raskin's idea of "simple" was not the one that the world eventually associated with the Mac. He cared about consistency and about not making people think. He wanted a text-based screen, a single way of doing each task, and a keyboard with special keys that let you leap quickly to any piece of text. He was wary of the mouse, which was then a laboratory curiosity, and did not expect pictures to be a central part of the interface.

His engineers had their own ideas about what was possible. One of them, Burrell Smith, had been an Apple service technician with no formal engineering degree, and he had a gift for squeezing a computer's logic into fewer parts than anyone thought was possible. Smith's designs would turn out to matter a great deal. In those first months, though, nobody knew that. The Macintosh was a modest project among several at Apple, and it was nearly cancelled more than once.

## The thing Raskin kept saying

Raskin had visited Xerox's research centre in Palo Alto, where researchers had built computers with windows, icons and a mouse, and he kept telling anyone who would listen that Apple ought to look. He had no way of knowing that the person who would eventually listen the hardest was not on his team at all.

Over at Apple's other big project, an expensive, ambitious computer called Lisa, the man who ran the company's vision for the future was getting increasingly frustrated. Steve Jobs had co-founded Apple, and he had a very strong sense of what a computer should feel like. In 1980 that feeling was about to collide with a corporate reorganisation.

That is where we pick up in the next chapter.

*Sample series chapter, with details drawn from widely published accounts; it has not been verified against primary documents.*`,
  ),
  ch(
    2,
    "The visitor from Lisa",
    "Chapter 2 of 5. Steve Jobs sees the future at Xerox, loses his job on Lisa, and finds a small project he can take over.",
    `The visit that changed Apple happened in December 1979. Steve Jobs, with several engineers from the Lisa team, went to Xerox's Palo Alto Research Center for a demonstration of the lab's work. The visit was part of a deal: Xerox's venture arm had been allowed to invest in Apple before it went public, and in return Apple's people were allowed to see what the researchers had been up to.

They were shown the Alto, an experimental computer. It had a screen made of individual dots, so it could display pictures and different typefaces rather than just rows of letters. It had windows, a pointer moved by a mouse, and a programming environment called Smalltalk. It was connected to other computers by a network. Jobs has been quoted many times about how strongly the demonstration affected him, but the details differ from one retelling to the next, so it is safer to say simply that he left convinced the future of computing would look like this, and that Xerox wasn't going to do much about it.

## A changing of the guard

Back at Apple, the Lisa project began changing direction. It had started out as a conventional business computer. Now it was designed around the ideas seen at Xerox, with a graphical display and a mouse, and with a cost that climbed steadily as the engineers added more.

Jobs, meanwhile, was running into resistance within the company. In 1980 Apple's management reorganised the Lisa division under a more experienced manager, and Jobs was moved away from day-to-day control. It was a humiliating change for a man who had thought of Lisa as his own.

## Finding a new project

In early 1981, he turned his attention to a small project in another building. The Macintosh team was, by Apple's standards, almost an afterthought, and its leader Jef Raskin was not eager to hand it over. But Jobs was not someone who took a hint.

What Jobs wanted was the best of Lisa at a fraction of the price: a computer with a graphical interface and a mouse, small enough to sit on a desk, cheap enough that people might actually buy it. It would need a more capable processor than the one Raskin had planned, and the team was re-engineered around a chip from Motorola, the 68000, which was the same family of processor that Lisa used. Burrell Smith produced a new circuit board design that made it work, and the demonstration of that board persuaded others that a small, affordable graphical computer could be built.

## Two visions, one project

The next year was an uneasy one. Raskin's idea of a text-based appliance and Jobs's ambition for a graphical machine were not compatible, and Jobs was both senior to him and the more forceful. Raskin argued that the project was being steered away from its purpose. Jobs argued the opposite: that Raskin's version would have been forgotten.

In 1982 Raskin left Apple. He later built other products around his own ideas about interfaces, but the Macintosh continued without him, and it went on to carry out something close to Jobs's plan.

What it needed now was a team who could actually make the thing work, with a tiny amount of memory and a very short amount of time. In the next chapter we meet them.

*Sample series chapter, with details drawn from widely published accounts; it has not been verified against primary documents.*`,
    "Jef Raskin dreamed up the Macintosh as a cheap, text-based appliance. Steve Jobs, sidelined from the Lisa project after seeing Xerox's research, took over the small team and began steering it toward a graphical computer.",
  ),
  ch(
    3,
    "Texaco Towers",
    "Chapter 3 of 5. A pirate flag, a very small amount of memory, and an artist who had never drawn a computer icon.",
    `By 1982 the Macintosh team had moved into its own building, a small office block beside a petrol station in Cupertino. They called it Texaco Towers, partly for the view and partly as a joke. A pirate flag flew over it, an insider's reference to the idea that it was better to be a rebel than to join the navy. Jobs encouraged the spirit, and there was a sense on the team that they were building something against the grain of the company.

It was a young crowd, small enough to know each other well. The engineer Andy Hertzfeld wrote much of the system software. Bill Atkinson, who had worked on Lisa, wrote the graphics code that drew everything on the screen. Burrell Smith designed the hardware. Bud Tribble, the software manager, is credited by Hertzfeld with coining a phrase for Jobs's ability to make people believe the impossible: the reality distortion field.

## Squeezing it into memory

The constraint that governed every decision was memory. The Lisa had a megabyte of it. The Macintosh was planned with one-eighth as much: 128 kilobytes, for the operating system, the programs and the screen itself. The team could not afford to waste a byte.

Atkinson's graphics routines, called QuickDraw, were a triumph of this kind of thinking. They could draw shapes, text and overlapping windows far faster than anyone expected from a slow processor, by being careful about what really needed redrawing. In a story told on Hertzfeld's website, Atkinson was explaining to Jobs why drawing circles and ovals was possible but rounded rectangles were difficult, and Jobs objected that rounded rectangles were everywhere in the world around us, from street signs to desktops. Atkinson went away and found a way to do it. Rounded corners became part of the look of the machine.

## An artist joins

In 1982 Hertzfeld suggested a friend from school to help with the look of the screen. Susan Kare was a sculptor and graphic artist, and had never designed anything for a computer. She arrived with a notebook of graph paper, and began drawing icons one square at a time: a pointing hand, a paintbrush, a trash can, a wristwatch for the moments when the machine was busy. She also designed typefaces for the screen, and named them after cities.

Kare's work did something important. It made a computer look like a place a person might want to be. The machine could be a little playful, and at start-up it would greet you with a smiling face.

## The demands

Jobs pushed constantly. He wanted the case to be beautiful, and had the team's names engraved inside the moulding where nobody would see them but themselves. He wanted the machine to start up faster. In another story from Hertzfeld, Jobs argued that making the start-up shorter by ten seconds would, across millions of users, save lifetimes of waiting. As an argument it was irrefutable and slightly absurd; the engineer made the improvement.

Some of this is the stuff of legend and has been polished by retelling. The people who were there remember it with great affection and sometimes with some exhaustion. What is not in doubt is the output: by late 1983 there was a working machine, a rather lovely one, and a date for the world to see it.

*Sample series chapter, with details drawn from widely published accounts; it has not been verified against primary documents. Where an anecdote comes from one person's memory, the text says so.*`,
    "Jobs took over the Macintosh project in 1981 and pushed it towards a graphical interface. By 1982 the team was working in its own building, squeezing a mouse-driven computer into a tiny amount of memory.",
  ),
  ch(
    4,
    "Twenty-four January",
    "Chapter 4 of 5. A Super Bowl advertisement nobody at Apple could agree on, and a machine that spoke for itself.",
    `Apple had launched the Lisa in January 1983, at a price near ten thousand dollars. It was a magnificent computer that very few people could afford, and it sold poorly. The Macintosh was supposed to be the answer.

By the autumn of 1983 it was nearly ready. It had a Motorola 68000 processor running at about 8 megahertz, 128 kilobytes of memory, and a single built-in drive for 3.5-inch floppy disks. The screen was nine inches across, black and white, 512 dots wide by 342 high. With it came two programs: MacWrite, for text, and MacPaint, which let ordinary people draw on a computer for the first time.

Apple planned to launch it at its shareholders' meeting on 24 January 1984. It also planned to tell the entire country about it two days earlier.

## The advertisement

Apple's advertising agency, Chiat/Day, had made a commercial for the occasion, directed by Ridley Scott, then just known for the film *Blade Runner*. It borrowed its mood from George Orwell's novel *1984*: grey rows of workers staring at a giant face on a screen, and a woman in bright running clothes who runs in, throws a hammer at the screen and shatters it. A voice promises that "you'll see why 1984 won't be like *1984*." There was never a shot of the computer itself.

Apple's board did not like it. By most accounts, the board saw the finished commercial and wanted to sell the advertising time they had already bought. Accounts differ about exactly how it was saved, with versions involving Jobs and Steve Wozniak offering to pay for the slot themselves. What is certain is that the commercial ran once, nationally, during the broadcast of Super Bowl XVIII on 22 January 1984, and that it was talked about for weeks, and then for decades.

## The demonstration

On 24 January, at an auditorium in Cupertino, Jobs held up the new computer in a carrying bag, took it out, and plugged it in. The screen flashed through a sequence of pictures and software. Then the machine itself spoke, in a flat synthesised voice, a short greeting. The audience cheered for a long time.

The price was $2,495. It was not cheap; it was about a quarter of the cost of a Lisa, but still well above the thousand dollars of Raskin's original dream. For that you got a computer that a person who had never used one could understand within minutes.

## First reactions

Reviewers were impressed. The machine was easy and a pleasure to use. It was also, by the standards of its price, rather limited. It had very little memory, no hard disk, and a single floppy drive that meant constant disk swapping. There was not much software.

The team that had spent years on it finished the year in triumph, and at the same time in a little trepidation. The public had seen the future. Now they had to be persuaded to buy it.

*Sample series chapter, with details drawn from widely published accounts; it has not been verified against primary documents.*`,
    "The Macintosh team has a working machine by late 1983: 128 kilobytes of memory, a nine-inch screen and a mouse. Apple plans a launch in January 1984, and a very unusual television commercial two days before it.",
  ),
  ch(
    5,
    "The long hangover",
    "Chapter 5 of 5. Sales slump, the founder leaves, and the Mac is rescued by something nobody planned.",
    `The early sales of the Macintosh were good. Apple sold around seventy thousand in the first hundred days or so, and people who bought one tended to love it. Then, over the spring and summer, the numbers faded.

The reasons were the ones reviewers had predicted. The first Mac had so little memory that many programs could not run properly. It had no hard drive, and not enough software. It cost a lot. Businesses, which were the large and lucrative market, bought IBM PCs, which ran spreadsheets and had a vast library of programs. The Mac, they said, was a toy.

## Fixing it

Apple responded quickly with a version with four times as much memory, nicknamed the "Fat Mac", in autumn 1984, and then improved the system software and the disk arrangements. Those helped, but it was a rescue of a different kind that turned things around.

In January 1985 Apple introduced the LaserWriter, a laser printer that could print the typefaces and graphics the Mac created at near-typeset quality. It cost around seven thousand dollars, which was extraordinary for a printer, and was shared by a whole office. In July, a small company called Aldus released PageMaker, software for laying out pages. Together with the Macintosh, they made it possible for a small team to produce professional-looking publications from a desk.

This was desktop publishing, and no one on the original team had planned it. It gave the Macintosh a job that nothing else on the market could do as well, and it sustained the product through its worst years.

## The founder departs

Inside Apple, things were less happy. Jobs had been joined in 1983 by John Sculley, an executive from Pepsi, as chief executive. For a while they were close. As the Macintosh slowed, they quarrelled, over strategy, over who was responsible and over Jobs's behaviour. In spring 1985, by most accounts, Jobs tried to remove Sculley and failed when the board sided with Sculley. He was stripped of his operating role. That September, he resigned.

It is a sad passage in the story, and the accounts differ, as they do when people who were present remember events differently. The company's founder had been driven out of the product he had championed.

## What remained

Raskin left behind a conviction that computers should serve ordinary people rather than the other way round. Kare left a visual language, Atkinson a way of drawing, and Hertzfeld, Smith and the rest left a machine which in a few years would be remembered as the beginning of something. Microsoft's Windows, introduced in 1985, borrowed heavily from the same ideas, and the graphical interface eventually became the way nearly everyone would use a computer.

Jobs would be back, but that is another story.

Looking at the history now, the Macintosh looks like a success. For a time it looked as though it might be a beautiful failure. It was neither of those things so much as a bet: that a computer could be something people loved, and that this would matter. It did.

*Sample series chapter, with details drawn from widely published accounts; it has not been verified against primary documents.*`,
    "The Macintosh launched in January 1984 to acclaim, at $2,495, with little memory and a thin software library. Sales slowed through the year.",
  ),
];

// A pitch the editor has not researched yet. Saying yes only records intent.
export const parcPitch: Series = {
  id: "sample-xerox-parc",
  title: "The Lab That Gave Away the Future",
  description:
    "Xerox's Palo Alto Research Center invented the graphical computer, the laser printer and Ethernet, and watched others turn them into industries. A planned six-chapter series.",
  subject: "Xerox PARC, 1970 to 1983",
  topics: ["Computing history", "Xerox PARC", "Graphical interfaces"],
  motif: "grid",
  status: "suggested",
  researchStatus: "pitched",
  totalChapters: 6,
  outline: [
    "A copier company buys a laboratory",
    "The Alto",
    "Smalltalk and the Dynabook",
    "Ethernet and the laser printer",
    "December 1979",
    "What Xerox kept",
  ],
  sources: [],
  reason: "A natural next stop after the Macintosh. Say yes and I'll research the whole thing before publishing chapter one.",
  sample: true,
  version: 1,
};

export const seriesAll: Series[] = [macSeries, parcPitch];
