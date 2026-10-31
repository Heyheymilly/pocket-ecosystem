# Pocket Ecosystem Lab

## Research, Product Vision, and Engineering Guide

**Status:** Living reference document  
**Research pass:** 31 October 2026  
**Project stage:** Pre-implementation  
**Working title:** Pocket Ecosystem Lab

---

## Quick navigation

- **Project decision:** Sections 2 and 7
- **Comparable projects:** Sections 3–6
- **Simulation rules:** Section 8
- **UI and explainability:** Section 9
- **Architecture:** Section 10
- **Algorithms:** Section 11
- **Performance:** Section 12
- **Testing:** Section 13
- **Milestones:** Section 14
- **Risks and principles:** Sections 15–16
- **Sources:** Section 20
- **Next document:** Section 21

---

## 1. Why this document exists

This document is the shared reference for designing and building an open-ended ecosystem sandbox as a learning project. It records:

- What comparable games, educational models, and artificial-life projects do.
- What they do well.
- What problems their developers and users encountered.
- Which ideas we should borrow, adapt, postpone, or reject.
- The current product vision for our project.
- The proposed simulation and software architecture.
- A staged learning and development roadmap.
- Risks, open questions, and future research topics.

It is intentionally broader than a normal feature specification. The project is meant to teach programming, algorithms, debugging, modeling, and software design. We therefore care about both the application and the reasoning used to create it.

This is a living document. Decisions should change when experiments or user testing give us better evidence. When a major decision changes, update the decision log rather than silently rewriting history.

### How to interpret the research

The research prioritizes official project sites, developer posts, source repositories, documentation, and original papers. Store pages and individual reviews are used cautiously to identify possible user-experience issues, not as proof that every user had the same experience.

Statements in the case studies are divided conceptually into:

- **Observed:** Documented by the project or visible in its public source.
- **Inference:** Our interpretation of why a design works or fails.
- **Decision:** What our project should do as a result.

We have not performed a source-code audit of every project and should not pretend that public feature descriptions reveal private implementation details.

---

## 2. Executive conclusion

The recommended project is:

> A browser-based, open-ended 2D artificial ecosystem where users seed a small world with food and creatures, observe populations change, inspect individual lives and lineages, alter environmental pressures, and eventually watch heritable traits evolve.

The application should feel like a living terrarium and an understandable experiment. It is not initially a management game, a scientifically accurate ecology package, a creature-body editor, or a neural-network research platform.

The central interaction loop is:

```text
Seed a world
    -> let it run
    -> notice something surprising
    -> inspect why it happened
    -> change one condition
    -> run or replay the world
    -> compare the outcome
```

The strongest lessons from existing work are:

1. **Simple local rules can create compelling global behavior.** Boids, cellular automata, and predator-prey models demonstrate this repeatedly.
2. **Observation tools are part of the experience, not optional debug UI.** Population graphs, creature inspectors, ancestry, time controls, and replay turn motion into an understandable story.
3. **Evolution needs tradeoffs and environmental pressure.** Mutation alone only creates random variation. If one trait has benefits without costs, it tends to dominate trivially.
4. **Reproducibility is essential.** A displayed random seed and deterministic simulation make bugs, experiments, and interesting worlds replayable.
5. **Simulation and rendering must be separate.** A headless simulation should run without the canvas. This improves testing, speed, and future batch experiments.
6. **Performance problems arrive through multiplication.** `agents x neighbors x ticks x rendered detail` grows quickly. Start naively, measure, and add spatial indexing only when justified.
7. **A sandbox still needs direction.** It may not need winning, but it needs meaningful controls, readable cause and effect, suggested experiments, presets, and discoveries worth following.
8. **Do not begin with neural networks, realistic genetics, procedural bodies, fluid physics, or multiple trophic levels.** Each is potentially a project by itself.

### Current high-level decisions

| Decision | Current choice | Reason |
|---|---|---|
| Product form | Open-ended sandbox | Most enjoyable simulation work; goals can be added later |
| Platform | Browser | Fast feedback, easy sharing, no installation |
| Language | TypeScript | Strong learning value and safer refactoring than untyped JavaScript |
| Rendering | HTML Canvas 2D | Appropriate for hundreds or thousands of simple agents |
| World representation | Continuous 2D coordinates | Natural movement and useful vector/distance algorithms |
| Modeling style | Individual agent-based model | Individual lives, local sensing, inheritance, and lineage are central |
| Simulation timing | Fixed simulation ticks, rendering decoupled | Consistency across frame rates and simulation speeds |
| Randomness | Seeded pseudo-random generator | Exact replay, debugging, and fair comparisons |
| Initial organisms | Food plus one consumer species | Smallest meaningful energy loop |
| Initial intelligence | Handwritten steering rules | Explainable and learnable; neural networks deferred |
| Initial evolution | None | Establish survival dynamics before heredity |
| First evolutionary model | Numeric inherited traits with mutation | Transparent and sufficient for emergent selection |

---

## 3. What kinds of ecosystem projects exist?

“Ecosystem simulation” covers several fundamentally different products. Confusing them is a major source of scope problems.

### 3.1 Aggregate population models

These track totals such as the number of prey and predators. Equations determine how the totals change. Individuals do not exist.

Strengths:

- Fast to run.
- Mathematically analyzable.
- Useful for population curves and parameter exploration.

Limitations:

- No individual behavior, movement, ancestry, or spatial niches.
- Less visually personal.
- Abstract assumptions can hide small-population extinction effects.

The classic Lotka-Volterra family is the recognizable example. NetLogo's documentation contrasts aggregate system dynamics with agent-based wolf-sheep models and notes that the aggregate form models changes in stocks rather than individual animals. [NetLogo System Dynamics Guide](https://ccl.northwestern.edu/netlogo/6.1.1/docs/systemdynamics.html)

**Our choice:** Do not use aggregate populations as the main simulation. We may later use their expected population curves as a comparison or teaching tool.

### 3.2 Cellular automata

The world is a grid. Every cell updates from local cell states according to a transition rule. Conway's Game of Life and Lenia belong broadly to this family.

Strengths:

- Small rule sets can generate astonishing patterns.
- Naturally local and often parallelizable.
- Excellent for learning grids, neighborhoods, double buffering, and emergence.

Limitations:

- Individual animals with persistent identities can feel artificial.
- Continuous movement and lineage require extra modeling.
- It can be difficult to explain high-level behavior in familiar ecological terms.

Lenia generalizes cellular automata toward continuous space, time, and state and has produced hundreds of categorized lifelike patterns. It is inspiring evidence for emergence, but it represents a different project from a creature-centered ecosystem. [Lenia paper](https://arxiv.org/abs/1812.05433)

**Our choice:** Borrow neighborhood thinking and double-buffered updates, but use explicit agents rather than cells as organisms.

### 3.3 Agent-based models

Each organism is an individual with position, energy, age, and behavior. Global population dynamics emerge from local decisions.

Strengths:

- Individual stories, ancestry, and inspection.
- Natural fit for movement, sensing, eating, reproduction, and death.
- Strong programming and algorithm practice.

Limitations:

- Computationally expensive as populations grow.
- Update order and randomness can unintentionally change outcomes.
- Many plausible-looking rules are not biologically accurate.

NetLogo and Mesa both expose concepts such as agents, space, scheduling, data collection, visualization, and repeated experiments. [Mesa documentation](https://mesa.readthedocs.io/stable/index.html)

**Our choice:** This is the project's main modeling style.

### 3.4 Artificial evolution systems

These add heritable variation and selection. Some use simple numeric genes; others evolve body plans, programs, or neural networks.

Strengths:

- Long-term change creates stories and surprise.
- Excellent for learning mutation, inheritance, selection, distributions, and statistical reasoning.

Limitations:

- “Evolution” is easy to claim and hard to model well.
- A poorly designed environment rewards trivial strategies.
- Neural networks and physical bodies multiply complexity and computational cost.

**Our choice:** Add simple inherited numeric traits only after the non-evolutionary survival model is understandable and stable.

### 3.5 Sandbox games

The simulation is wrapped in tools for placing life, shaping conditions, inspecting results, saving worlds, and changing time.

Strengths:

- Accessible and playful.
- Users form their own goals.
- A single simulation supports many experiments.

Limitations:

- “Press play and watch” may become passive.
- Too many sliders create confusion rather than agency.
- Without inspection, users cannot tell why outcomes occurred.

**Our choice:** Build a sandbox, but ground every control in a question the user might ask.

---

## 4. Comparative project landscape

| Project | Primary experience | User agency | Main technical idea | Particularly useful lesson |
|---|---|---|---|---|
| NetLogo Wolf Sheep Predation | Educational experiment | Change parameters, run, compare | Grid agents, energy, regrowing grass | Minimal rules plus charts can teach complex dynamics |
| Equilinox | Relaxing ecosystem builder | Place, nurture, evolve, unlock | Species needs and life cycles | Clear habitat requirements make causality legible |
| The Sapling | Creature design and evolution sandbox | Design organisms, mutate, change environment | Procedural organisms and large evolving populations | Rendering fidelity and simulation scale must be traded carefully |
| Ecosystem | Physically embodied ocean evolution | Shape environment and edit DNA | Synthetic DNA, brains, water physics | Embodiment is powerful but extraordinarily expensive in scope |
| Species: ALRE | Natural-selection sandbox | Intervene, inspect, trigger pressures | Emergent mutation and speciation | Lineage and inspection help users tell evolutionary stories |
| Evolution by Keiwan | Machine-learning sandbox | Build a body and choose a task | Neural networks plus genetic algorithm | A sandbox can be satisfying without rewards when progress is visible |
| Avida-ED | Educational digital evolution lab | Configure experiments and collect evidence | Self-replicating digital organisms | Baselines, repeatability, and comparison are first-class features |
| Boids | Emergent movement demonstration | Usually tune parameters or perturb flock | Local steering rules | Simple local behaviors can look coordinated without a leader |
| Lenia | Artificial-life exploration | Search parameter space and initial states | Continuous cellular automata | Rich emergence can come from compact mathematical rules |
| Origin / Petri Labs | Modern browser artificial-life lab | Sandbox, puzzles, and experiments | Evolved neural controllers in WebAssembly | One engine can support free play and rigorous experiments |

---

## 5. Detailed case studies

## 5.1 NetLogo Wolf Sheep Predation

### What it does

The canonical model contains wolves, sheep, and optionally grass. Agents wander; movement costs energy; eating restores energy; agents reproduce; and starvation causes death. Grass regrows after a delay. Users change parameters and observe population counters and time-series plots. The model explicitly invites experiments about stability and population oscillation. [Official model](https://ccl.northwestern.edu/netlogo/models/WolfSheepPredation)

The model also documents a crucial result: a wolves-and-sheep version with effectively infinite grass is often unstable, while explicitly modeling grass and its regrowth can create more stable dynamics. This is a useful reminder that omitted resources can determine the entire behavior of a simulation.

### How it is implemented conceptually

- A discrete spatial world of patches.
- Separate breeds/types for wolves and sheep.
- Local movement and encounters.
- Per-agent energy.
- Regrowth state on grass patches.
- Parameters exposed as controls.
- Population counts sampled over time.
- Repeated experiments supported through BehaviorSpace.

### What it does well

- Uses very few rules.
- Makes every important parameter visible.
- Shows immediate and long-term results together.
- Includes prompts that turn observation into investigation.
- Supports reproducible runs and parameter sweeps.
- Clearly admits that it is a simplified model.

### Where it is limited

- Random wandering is not convincing animal behavior.
- Reproduction may be a fixed probability instead of a richer life process.
- Grid-cell encounters simplify perception and pursuit.
- It is primarily an educational model, not a visually expressive sandbox.
- Stable curves are informative but do not automatically create personal stories.

### What we should borrow

- Energy as the initial common currency.
- Explicit resource regeneration.
- Population graphs from early in development.
- Parameters with understandable meanings.
- Repeatable experiments and batch runs.
- A short “things to try” panel for sandbox users.

### What we should improve

- Continuous positions and steering instead of purely random cell movement.
- Creature inspection and a causal event history.
- Seed display and one-click replay.
- Clear costs and benefits for future traits.
- Separate simulation rules from presentation.

---

## 5.2 Equilinox

### What it does

Equilinox is a nature sandbox in which users transform barren land by placing plants and animals. Species have habitat, nutrition, behavior, and life-cycle requirements. Healthy ecosystems earn Diversity Points; users spend them on new organisms and genetic modification. Tasks and evolution trees provide progression. Its official material describes more than 120 species and multiple biomes. [Equilinox overview](https://www.equilinox.com/about/) and [press kit](https://equilinox.com/presskit/sheet.php?p=equilinox)

### What it does well

- Gives the user an immediately understandable role: create and nurture habitats.
- Makes species requirements a readable source of cause and effect.
- Uses recognizable plants and animals.
- Makes gradual colonization visually satisfying.
- Provides tasks for users who do not invent their own goals.
- Uses a gentle visual style that keeps crowded scenes readable.

### Challenges and tradeoffs

- A large species catalog creates a large content-production burden.
- Unlock currencies and repeatable tasks can turn observation into grinding.
- Simplified needs help readability but can make the ecology feel game-like rather than emergent.
- When the reward loop depends on adding content, the product needs continuous art, data, balancing, and UI work.

Some public user feedback praises its calm observation loop while describing repetitive tasks and slow progression. That feedback is anecdotal, but it supports a reasonable design caution: progression systems can distract from the simulation if they become the main reason to interact. [Steam community reviews](https://steamcommunity.com/app/853550/reviews/)

### What we should borrow

- Species needs should be inspectable.
- A barren-to-living visual transformation is intrinsically rewarding.
- Preset organisms can make a sandbox approachable.
- The UI should explain whether an organism is hungry, safe, reproducing, or poorly adapted.

### What we should not copy initially

- Currency.
- Unlock trees.
- Dozens of species.
- Tasks requiring repeated resource farming.
- Complex disease and happiness systems.

### Implementation note

The official descriptions do not expose the full internal architecture. A sensible inference is that a catalog of more than 120 species benefits from data-driven definitions, but we should treat this as an architectural lesson, not a verified claim about Equilinox's private code.

---

## 5.3 The Sapling

### What it does

The Sapling lets users design plants and animals, place them together, and optionally allow random mutations to drive evolution. It has scenarios and a large sandbox. Later updates added pollination, temperature, instincts, fight-or-flight behavior, and much larger maps. [Official site](https://thesaplinggame.com/) and [Flower update](https://thesaplinggame.com/devlogs/flower.html)

### What it does well

- Creature and plant design creates emotional ownership.
- Evolution changes things the user personally created.
- Environmental controls create selection pressure.
- Scenarios teach the simulation before the user enters the sandbox.
- Time acceleration and long-running worlds support evolutionary timescales.
- Developer write-ups expose tradeoffs honestly.

### The most important implementation lesson

The developer documented a three-month optimization effort that reportedly made some use cases hundreds of times faster. The simulation had two separate costs: updating many organisms and visualizing their procedural 3D forms. Techniques included:

- Object pooling instead of constantly creating and destroying models.
- Reusing prebuilt organism models.
- Temporarily displaying an ancestor's appearance for a newly mutated organism.
- Building missing visual models gradually when spare time was available.
- Destroying unused cached models to avoid unbounded memory growth.
- Capping organisms as a practical performance control.

This is a valuable principle: **the simulation state and its visual representation do not always need identical update frequency or fidelity.** [Optimization postmortem](https://thesaplinggame.com/devlogs/optimization.html)

### The most important modeling lesson

The same postmortem explains that small maps created the wrong selection pressure. Plants often evolved to maximize offspring because available space, not interesting ecological adaptation, was the dominant constraint. A trait can only evolve meaningfully if the world makes that trait relevant.

This gives us a rule:

> Before adding a mutable trait, identify the environmental pressure, benefit, cost, and metric that make multiple values viable.

### Long-running simulation problems

The developer's week-long run exposed problems that short playtests missed, including memory leaks and the need for regular save backups. The FAQ also describes performance degradation with large maps, high time speeds, random mutations, and extended sessions. [Seven-day run](https://thesaplinggame.com/devlogs/stream) and [FAQ](https://thesaplinggame.com/faq)

### What we should borrow

- Separate simulation from visualization.
- Make long-duration tests part of development.
- Add population caps and performance instrumentation.
- Add environmental traits only alongside genuine pressures.
- Provide scenarios or suggested experiments later, even if the main product remains open-ended.
- Consider lower-detail rendering at distant zoom levels.

### What we should avoid initially

- Procedural 3D bodies.
- Every mutation producing a new visual asset.
- Huge maps before profiling.
- Simulating thousands of organisms before hundreds behave well.
- Making long-lived saves without versioning and backup strategy.

---

## 5.4 Ecosystem by Tom Johnson

### What it does

Ecosystem models an ocean inhabited by virtual lifeforms grown from synthetic DNA. The DNA controls body structure, skin, joints, and neural processing. Creatures move by applying forces in a physically simulated environment rather than playing predefined swimming animations. Populations graze, prey, reproduce, mutate, and occupy niches influenced by abiotic factors such as light, currents, minerals, water clarity, and temperature. [Official project description](https://www.ecosystem-game.com/home/)

### What it does well

- Body shape and behavior are coupled to the environment.
- Movement is an evolved outcome rather than a scripted animation.
- Energy and nutrient flow connect living and nonliving systems.
- Environmental construction gives users indirect control.
- The possibility of unintended consequences is central to the experience.

### Why it is not our initial model

Ecosystem combines several difficult projects:

- Procedural body generation.
- Jointed physics.
- Fluid or water simulation.
- Evolved neural control.
- Genetic encoding and mutation.
- Food webs.
- Abiotic environmental simulation.
- Editors and sharing.

Its official material mentions Lattice Boltzmann methods for fluid simulation and neural systems for swimming. That depth is impressive, but copying it would prevent a beginner project from reaching a coherent first version. [Developer announcement](https://steamcommunity.com/games/1133120/announcements/detail/2919980084782137088)

### What we should borrow

- Treat energy as a flow through the system, not a number that appears without explanation.
- Eventually connect abiotic factors to living populations.
- Let users influence conditions while organisms act autonomously.
- Make emergent adaptation more important than scripted species upgrades.

### What we should postpone

- Physical bodies.
- Fluid dynamics.
- Evolved neural locomotion.
- Multiplayer ecosystems.
- Procedural meshes.

---

## 5.5 Species: Artificial Life, Real Evolution

### What it does

Species describes itself as a first-principles evolution sandbox based on mutation, variation, and natural selection. The simulation takes priority over conventional game structure. Users can intervene through tools and environmental events, but evolution is intended to emerge rather than follow a fixed upgrade tree. [Developer FAQ](https://speciesdevblog.wordpress.com/faq-mk2-0/)

Its public store description emphasizes a nursery for manipulating a gene pool, environmental catastrophes, creature inspection, a satellite map, and a clade diagram that records evolutionary relationships. [Steam page](https://store.steampowered.com/app/774541/Species_Artificial_Life_Real/)

### What it does well

- Commits clearly to simulation-first design.
- Provides tools for active intervention and passive observation.
- Makes ancestry visible through a clade diagram.
- Supports stories about speciation and extinction.
- Exposes individual and population-level detail.

### Challenges

- Natural-looking evolution requires a large, sustained population and meaningful variation.
- Creature AI and performance are continuing concerns in the project's public material.
- Detailed evolutionary views can overwhelm users if the causal chain is unclear.
- Long-running early-access simulation projects can accumulate ambitious systems faster than they gain polish.

Public reviews are mostly positive but contain recurring reports of performance and interface friction. We should treat the pattern as a warning, not a verdict on the project. [Steam review summary](https://store.steampowered.com/app/774541/Species_Artificial_Life_Real?l=english)

### What we should borrow

- An ancestry or family view once heredity exists.
- Ability to inspect one organism and then jump to parent or offspring.
- Environmental shocks as optional experiments.
- Tools that let the user tell the story of a world.

### What we should improve

- Start with fewer traits and clearer causal explanations.
- Show behavior decisions, not merely final statistics.
- Make performance budgets visible during development.
- Do not call clusters “species” until we define an explicit clustering rule.

---

## 5.6 Evolution by Keiwan

### What it does

Users construct creatures from bones, joints, and muscles. A neural network controls movement, and a genetic algorithm selects and mutates controllers for tasks such as running, jumping, climbing, and flying. The creator explicitly calls it a sandbox and machine-learning demonstration rather than a traditional game; there are no achievements or rewards. [Official page](https://keiwan.itch.io/evolution)

The source is publicly viewable for personal and educational use and is built with Unity. [Repository](https://github.com/keiwando/evolution)

### What it does well

- The objective is visually obvious: move farther or perform the task better.
- Generational improvement is visible.
- User-created bodies make results personally meaningful.
- It demonstrates neural networks and genetic algorithms without pretending to be a full ecosystem.
- Saving and sharing interesting creatures extends the sandbox.

### Limitation for our purpose

Task-based genetic algorithms use an explicit fitness target. In an ecosystem, we want survival and reproduction to arise from resource competition rather than a global score saying which organism is best.

### What we should borrow

- Visible before/after comparison across generations.
- Save and share a world or organism later.
- Be honest about whether the project is a sandbox, game, or demonstration.

### What we should not borrow initially

- Neural networks.
- Rigid-body creature construction.
- Global fitness scores.
- Generation replacement where an entire population is evaluated and replaced at once.

Our eventual evolution should be continuous: organisms are born and die at different times, and reproductive success is the effective fitness measure.

---

## 5.7 Avida-ED

### What it does

Avida-ED is an educational environment for digital evolution. Users configure a population, mutation rates, resources, and repeatability. They inspect individual digital organisms, population averages, fitness, traits, and experiment history. Its curriculum asks students to run a baseline, change one condition, repeat for the same duration, and compare evidence. [Avida-ED interface](https://avida-ed.github.io/Avida-ED3/AvidaED.html) and [mutation exercise](https://avida-ed.github.io/curriculum/lab-manual/exercise-1/)

### What it does well

- Distinguishes natural variation from exact replay.
- Makes baseline-versus-treatment comparison explicit.
- Exposes both individual and population data.
- Teaches users to form claims from evidence instead of merely watching animation.
- Saves configurations separately from full populations and experiment history.

### What we should borrow

- A displayed seed and replay mode.
- Experiment notes or named snapshots later.
- Compare two runs with the same starting seed and one changed parameter.
- Trait histograms rather than only averages.
- Separate “configuration” from “world state” in the save format.

### What we should adapt carefully

Avida's organisms are programs, not animals in continuous space. We should borrow its experimental discipline, not its organism representation.

---

## 5.8 Boids and steering behaviors

### What they demonstrate

Craig Reynolds' Boids model produces flocking from three local rules:

- Separation: avoid crowding nearby flockmates.
- Alignment: steer toward nearby flockmates' average heading.
- Cohesion: steer toward nearby flockmates' average position.

No leader plans the flock. Global motion emerges from local perception. [Craig Reynolds' Boids page](https://www.red3d.com/cwr/boids/)

Reynolds' broader steering work describes useful behaviors such as seek, flee, pursuit, evasion, arrival, obstacle avoidance, wandering, and weighted combinations. [Steering Behaviors for Autonomous Characters](https://www.red3d.com/cwr/steer/gdc99/)

### Implementation lesson

A naive flock checks every other agent, producing approximately `O(n^2)` work. Reynolds notes that a suitable spatial structure can reduce neighbor search toward near-linear behavior in favorable cases. This connects directly to our future food search, mating search, predation, and flocking.

### What we should borrow

- Start with wander.
- Add seek-food as the first purposeful behavior.
- Add flee and separation only when predators or crowding exist.
- Combine understandable behavior vectors with explicit weights.
- Show the chosen target and steering forces in a debug overlay.

### What we should avoid

- Adding a long list of steering behaviors before the energy loop works.
- Checking all agents against all other agents indefinitely.
- Presenting smooth movement as evidence of intelligence.

---

## 5.9 Nature of Code

Daniel Shiffman's *The Nature of Code* is particularly relevant to the learning path. Its current JavaScript/p5.js edition progresses through randomness, vectors, forces, particle systems, autonomous agents, cellular automata, evolutionary computing, neural networks, and neuroevolution. It includes an evolving ecosystem and continuous evolutionary system. [Open book](https://nature-of-code-2nd-edition.netlify.app/) and [continuous evolution lesson](https://thecodingtrain.com/tracks/the-nature-of-code-2/noc/9-genetic-algorithms/10-continuous-evolutionary-systems)

### What we should borrow

- The learning order: vectors and steering before evolutionary controllers.
- Small visual examples for each concept.
- Continuous birth and death as an alternative to synchronized generations.
- Survival and reproduction as selection, rather than a manually assigned fitness function.

### How we should use it

Use it as a conceptual reference and exercise source. Do not copy its final ecosystem wholesale; the learning value comes from designing and implementing our own rules.

---

## 5.10 Origin / Petri Labs

Origin is a modern browser artificial-life project with three presentations of one system: free sandbox, goal-based challenges, and a lab for controlled experiments. Its site describes creatures controlled by small inherited neural networks, with senses, memory, actions, seasons, droughts, pheromones, disease, and other systems. It reports a Rust simulation compiled to WebAssembly and Canvas 2D rendering with level-of-detail scaling. [Origin](https://origin.petri-labs.org/)

We have not audited its implementation, so its technical claims should be treated as project-reported.

### What it does well conceptually

- Recognizes that free play, puzzles, and experiments serve different motivations.
- Makes the browser a viable home for a serious simulation.
- Treats experiment design and replication as a user-facing feature.

### What we should borrow later

- One simulation engine supporting both sandbox and lab views.
- Controlled comparisons and replicates.
- Level-of-detail rendering.

### What we should not copy initially

- Neural brains with hundreds of weights.
- Pheromones, disease, communication, seasons, and speciation at once.
- Rust/WebAssembly before TypeScript performance is measured.

---

## 6. Cross-project findings

## 6.1 What consistently works well

### A visible causal chain

Users understand systems when they can follow:

```text
food became scarce
    -> a creature spent longer searching
    -> its energy fell
    -> it did not reproduce
    -> its lineage declined
```

An unexplained population curve is less engaging than a curve connected to inspectable lives.

### Meaningful time controls

Play, pause, single-step, and speed control appear repeatedly because different events happen on different timescales. Single-step is especially valuable for debugging and learning.

### Local rules with global consequences

Boids, wolf-sheep models, and cellular automata all demonstrate that a small rule set can generate rich behavior. More rules do not automatically create more interesting emergence.

### Inspectors and history

Species' clade tools, Avida's organism view, and population plots turn a moving simulation into an explorable history.

### Environmental controls that alter pressure

Temperature, food availability, water, terrain, and catastrophes matter because they change which strategies survive. Cosmetic controls do not create interesting evolution.

### User ownership

Designed organisms, named worlds, saved seeds, and selected ancestors give users a reason to care about outcomes.

## 6.2 What commonly goes wrong

### The simulation is visually alive but conceptually dead

Dots move, but users cannot form an explanation or question. The fix is not necessarily more AI; it is better inspection, clearer needs, and meaningful variation.

### One strategy dominates

If speed has no metabolic cost, maximum speed wins. If vision is free, maximum vision wins. If reproduction has no cost, maximum reproduction wins. Traits need tradeoffs.

### Extinction happens too easily or never happens

Small random populations can disappear by chance. Generous resources can create endless exponential growth. Parameters need to produce several regimes: collapse, boom-bust, and sustained fluctuation.

### Fast-forward breaks the world

If simulation rules are tied to rendered frames, a faster or slower computer changes biology. Large catch-up steps can also skip collisions. Fixed simulation ticks prevent much of this.

### Update order creates hidden winners

If creature A always updates before creature B, it may always eat contested food first. NetLogo and Mesa explicitly expose different activation schedules because scheduling changes model behavior. [NetLogo programming guide](https://docs.netlogo.org/programming) and [Mesa getting started](https://github.com/mesa/mesa/blob/main/docs/getting_started.md)

### Long sessions reveal different bugs

Memory growth, numeric drift, enormous lineages, and save corruption may not appear during short tests. The Sapling's seven-day run is a concrete example.

### Feature requests destroy the center

Civilization, tools, intelligence, procedural bodies, weather, disease, and plate tectonics are attractive because they sound connected. Together they erase the original learning project. The Sapling's FAQ illustrates how quickly users imagine civilization-scale extensions.

### Content hides weak systems

Adding ten species can make a screenshot richer without making the underlying interactions better. One compelling species with understandable behavior is more valuable early than a catalog of shallow variants.

### Scientific language creates false confidence

Plausible animation is not validation. Our project should say “toy ecosystem” and document its rules. We should not claim that a result predicts nature.

---

## 7. Recommended product vision

## 7.1 Product statement

> Pocket Ecosystem Lab is an open-ended browser sandbox for creating and understanding small artificial worlds. Users place resources and creatures, let time run, inspect individual decisions and family lines, change environmental pressures, and discover how simple rules produce population change and evolution.

## 7.2 User fantasy

The user is not a mayor, hero, or omnipotent god. They are a curious keeper of a digital terrarium.

They can intervene, but the world does not obey them directly. Creatures make local decisions. The pleasure comes from creating conditions, seeing consequences, and understanding surprises.

## 7.3 Intended audience

- Curious players who enjoy simulation and emergence.
- Learners interested in evolution or programming.
- People who like leaving a small world running and returning to see what changed.
- The developer, who uses the project to practice data structures, algorithms, modeling, testing, and frontend work.

## 7.4 Core user actions

The first useful actions are:

- Add a creature.
- Add or paint food.
- Play, pause, and single-step.
- Change simulation speed.
- Click a creature to inspect its state.
- Follow the selected creature.
- Reset with a new seed.
- Replay with the same seed.
- View population and energy over time.

Later actions may include:

- Paint resource fertility or terrain.
- Introduce predators.
- Trigger drought or abundance.
- Save and compare worlds.
- Inspect ancestry and trait distributions.
- Export experiment data.

## 7.5 The engagement loop

The sandbox should encourage questions rather than provide points:

- Why did this population collapse?
- Why is this creature thriving?
- Did higher speed help during scarcity?
- Did the population actually evolve or merely fluctuate?
- What changes if food occurs in patches instead of evenly?
- Can predators and prey coexist?
- Can the same starting world produce different outcomes?

The application should surface suggested experiments without converting them into mandatory quests.

## 7.6 Our potential differentiator

Many projects emphasize either visual creature creation or deep simulation. Our achievable differentiator is **explainable emergence**.

When a creature is selected, the user should eventually be able to see:

- Current energy, age, speed, vision, and other traits.
- What it currently senses.
- Which behavior is active: wander, seek, flee, rest, mate.
- Its chosen target.
- Recent important events: ate, reproduced, fled, was injured.
- Parent, children, and inherited mutations.
- How its traits compare with the current population.

This is not only user-facing design. It forces us to write behavior that can explain itself and creates excellent debugging tools.

## 7.7 Non-goals for the first major version

- Scientific prediction.
- Real-world species simulation.
- Neural-network brains.
- User-built body parts.
- Rigid-body physics.
- Fluid simulation.
- Civilization or tool use.
- Online multiplayer.
- Mobile-first controls.
- Accounts or cloud storage.
- Photorealistic graphics.
- More than one consumer species before the base loop is stable.

---

## 8. Proposed simulation model

## 8.1 World

Use a bounded continuous 2D rectangle. Positions and velocities are floating-point vectors. Rendering may round to pixels, but simulation coordinates remain continuous.

Initial world contents:

- Food particles or simple plant patches.
- One consumer species.
- No terrain obstacles.
- No predators.
- No mutation.

Why continuous space instead of a grid:

- Movement looks natural.
- Distance and direction matter.
- It teaches vector arithmetic.
- The same model extends naturally to vision, pursuit, avoidance, and spatial hashing.

Why not physics:

- We need position, velocity, and steering, not collision-rich rigid bodies.
- Simple kinematics are easier to understand and test.

## 8.2 Initial creature state

Conceptual fields:

```text
identity:
  id
  parentId (later)
  generation (later)

position and motion:
  position { x, y }
  velocity { x, y }
  heading

life:
  energy
  age
  alive

behavior:
  currentMode
  targetId
  wanderAngle

traits (later inherited):
  speed
  visionRadius
  bodySize
  metabolism
  reproductionThreshold
```

Do not add a field until a rule or interface actually uses it.

## 8.3 Initial food state

```text
id
position { x, y }
energyValue
```

Food can initially spawn randomly. Later it should become a resource cycle: plants grow using fertility/light, are eaten, and regrow or reproduce.

## 8.4 Fixed simulation tick

The simulation should advance in fixed-size ticks, independent of the monitor's rendering frame rate. Rendering can use `requestAnimationFrame`, while the simulation advances zero, one, or several fixed steps depending on accumulated real time and the selected speed.

Fixed steps make behavior more consistent and are standard for simulations whose results depend on time increments. [Fix Your Timestep](https://github.com/mas-bandwidth/gafferongames/blob/main/content/post/fix_your_timestep.md) and [Unity fixed-update explanation](https://docs.unity.com/engine/6000.7/manual/scripting/managing-time-and-frame-rate/fixed-updates)

Suggested starting values:

- Simulation: 20 ticks per simulated second.
- Rendering: browser-controlled, usually up to display refresh rate.
- Fast-forward: multiple simulation ticks per rendered frame, with a safety cap.

These are hypotheses, not permanent constants.

## 8.5 Update phases

Use explicit phases rather than letting each creature modify the world unpredictably during its turn:

```text
1. Environment phase
   Spawn or grow resources.

2. Sense phase
   Each creature queries the current world.

3. Decide phase
   Each creature produces an intent.

4. Move phase
   Apply velocities and boundaries.

5. Interaction phase
   Resolve eating and later predation/mating.

6. Metabolism phase
   Spend energy and increase age.

7. Life-cycle phase
   Queue births and deaths.

8. Commit phase
   Add newborns and remove dead entities.

9. Metrics phase
   Sample counts and trait statistics.
```

Benefits:

- We avoid changing arrays while iterating over them.
- Contested interactions can use a documented rule.
- The order is testable.
- Decisions can be explained.

We should test both deterministic tie-breaking and seeded random tie-breaking for contested food. Whichever we choose must not secretly favor low IDs or array position.

## 8.6 Initial behavior model

Version 0.1:

- Wander with slowly changing direction.
- Stay within world boundaries.
- Eat food on contact.

Version 0.2:

- Sense food inside a vision radius.
- Seek the nearest or most attractive visible food.
- Return to wandering when none is visible.

Version 0.3:

- Separate from overcrowded neighbors.
- Choose between behaviors using explicit priorities or weighted steering.

No neural network is needed. Handwritten behaviors are easier to explain and allow us to learn vector math, search, sorting, and decision systems.

## 8.7 Energy model

Energy is the first system-wide currency.

Initial rules:

- Movement and baseline metabolism spend energy each tick.
- Eating transfers food energy to the creature.
- Reproduction transfers energy from parent to offspring.
- Death removes the organism; nutrient recycling comes later.
- External food spawning is energy entering the toy system.

Track sources and sinks in debug metrics. The total does not have to be physically conserved, but unexplained energy creation should be visible.

## 8.8 Reproduction model

Start with asexual reproduction because it needs only one parent and keeps the focus on energy and inheritance.

Possible initial rule:

- A mature creature above an energy threshold may reproduce.
- Reproduction has a fixed energy cost.
- Remaining transferable energy is divided between parent and child.
- The child spawns nearby, not at exactly the same position.
- A cooldown prevents reproduction on every tick.

Important: exact numbers must be tuned through repeated simulation, not intuition alone.

## 8.9 Evolution model for a later milestone

The first genome should be a short set of numeric values, not DNA strings:

```text
speed
visionRadius
bodySize
metabolismFactor
reproductionThreshold
```

Inheritance:

```text
childTrait = clamp(parentTrait + mutation, allowedMin, allowedMax)
```

Mutation can initially be Gaussian-like small noise or a bounded uniform change.

Every trait needs a tradeoff:

| Trait | Possible benefit | Necessary cost or constraint |
|---|---|---|
| Speed | Reach food or flee faster | Higher movement energy cost |
| Vision | Find food from farther away | Higher sensory/metabolic cost |
| Body size | Larger energy reserve or combat advantage | More food required |
| Low reproduction threshold | Reproduce sooner | Smaller or weaker offspring |
| Efficiency | Lower maintenance cost | Slower speed or growth |

Do not add all traits together. Add one trait, one environmental pressure, and one graph at a time.

## 8.10 When can we say evolution occurred?

Not when one child has a random difference.

For this toy model, useful evidence would be:

- The trait is heritable.
- Variation exists in the population.
- Different trait values affect survival or reproduction.
- The trait distribution changes across generations.
- The pattern appears across multiple seeds more often than expected from drift alone.

The UI should show trait distributions and generation history rather than declaring a species “evolved” after one mutation.

---

## 9. Observability and user interface

## 9.1 Main view

- Canvas containing the world.
- Zoom and pan are optional later; begin with the whole world visible.
- Creatures are simple circles or small directional shapes.
- Food is visually distinct.
- Selected creature has a clear outline and target line.

## 9.2 Essential controls

- Play/pause.
- Single step.
- Speed: 0.5x, 1x, 2x, 5x, possibly maximum headless-like speed later.
- Add creature.
- Add food by click or brush.
- Reset with same seed.
- Reset with new seed.
- Seed display and copy button.

## 9.3 Creature inspector

Initial:

- ID.
- Age.
- Energy.
- Current behavior.
- Current target.
- Distance to target.

Later:

- Traits.
- Parent and children.
- Lifetime food eaten.
- Offspring count.
- Cause of death.
- Recent event log.
- Comparison with population average.

## 9.4 Population dashboard

Initial:

- Living creatures.
- Food count.
- Births and deaths during the latest interval.
- Mean energy.

Later:

- Population chart.
- Food chart.
- Trait mean and distribution.
- Causes of death.
- Generation depth.
- Performance: tick time and render time.

Do not render expensive labels for every creature. MDN recommends `requestAnimationFrame`, batching canvas operations, reducing unnecessary state changes, and using offscreen canvases for repeated graphics when optimization is needed. [MDN Canvas optimization](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)

## 9.5 Debug overlays

Debug visualization is a learning tool:

- Vision radius.
- Food target.
- Velocity vector.
- Steering vector.
- Spatial partition cells.
- Energy cost per tick.
- Current behavior priority.

These should be toggleable and usually shown only for the selected creature.

---

## 10. Proposed software architecture

## 10.1 Guiding rule

> The simulation must be able to run without the browser UI or canvas.

This makes automated tests, replay, batch experiments, and future workers possible.

## 10.2 Suggested structure

```text
src/
  simulation/
    model/
      World.ts
      Creature.ts
      Food.ts
      SimulationConfig.ts
    systems/
      sense.ts
      decide.ts
      move.ts
      interactions.ts
      metabolism.ts
      lifecycle.ts
      metrics.ts
    math/
      Vector2.ts
      geometry.ts
    random/
      Random.ts
    spatial/
      SpatialHash.ts          # later
    Simulation.ts

  rendering/
    CanvasRenderer.ts
    Camera.ts                 # later
    colors.ts

  ui/
    controls.ts
    inspector.ts
    dashboard.ts

  persistence/
    saveWorld.ts              # later
    loadWorld.ts              # later

  main.ts

tests/
  simulation/
  fixtures/
```

This is a direction, not a requirement to create every file immediately. Early code can be smaller and extracted as responsibilities become clear.

## 10.3 State versus configuration

Keep them separate.

**Configuration** describes rules and starting conditions:

- World size.
- Initial counts.
- Energy costs.
- Food spawn rate.
- Reproduction threshold.
- Mutation settings.

**State** describes one running world:

- Current tick.
- RNG state.
- Existing creatures and food.
- Metrics.
- Selected entity is UI state, not simulation state.

This separation allows the same configuration to run under multiple seeds.

## 10.4 Seeded randomness

Do not call `Math.random()` throughout the simulation.

Create one random-number interface owned by the simulation. All spawning, wandering, tie-breaking, mutation, and reproduction randomness goes through it. Save its seed and current state when saving the world.

Benefits:

- Same configuration and seed can replay exactly.
- A bug can be reproduced.
- Two behavior algorithms can be compared under identical conditions.
- Interesting worlds can be shared using a seed.

NetLogo and Mesa both emphasize seeded runs for reproducibility, and NetLogo's BehaviorSpace can vary seeds and repeat parameter combinations. [BehaviorSpace](https://docs.netlogo.org/behaviorspace.html)

## 10.5 Simulation-render separation

The renderer receives a read-only view of current simulation state. It must not change creature energy, positions, or random state.

The simulation should not know:

- Canvas dimensions in CSS pixels.
- Button elements.
- Selected DOM theme.
- Chart library.
- Mouse coordinates before the UI translates them into world coordinates.

## 10.6 Event and explanation model

Important actions can emit small events:

```text
FoodEaten
CreatureBorn
CreatureDied
BehaviorChanged
TargetChanged
MutationOccurred
```

These events can feed:

- Metrics.
- Creature history.
- Debug logs.
- UI notifications.
- Tests.
- Future replay tools.

Avoid recording every movement step forever. Keep important events and bounded recent history.

## 10.7 Saving

Save data should include:

- Save format version.
- App version.
- Configuration.
- Simulation tick.
- Seed and RNG state.
- Entity state.
- Optional metrics history.

Never assume old saves will remain compatible accidentally. Add explicit migrations if saving becomes a supported feature.

---

## 11. Algorithms and data structures roadmap

## 11.1 Early algorithms

### Vector arithmetic

- Addition and subtraction.
- Magnitude and normalization.
- Limit maximum velocity or steering force.
- Direction from one point to another.

### Distance checks

For repeated comparisons, compare squared distance to squared radius and avoid unnecessary square roots.

### Boundary handling

Possible models:

- Clamp and turn away.
- Bounce.
- Wrap to opposite side.

Choose one explicitly because boundaries create selection pressure. Start with gentle steering away from walls or bouncing; wraparound may be useful for experiments later.

### Nearest visible food

Initial algorithm:

```text
For each creature:
  scan every food item
  keep the nearest item inside vision radius
```

If `C` is creature count and `F` is food count, this is `O(C * F)` per sense step. It is correct and simple enough for early populations.

## 11.2 Spatial partitioning

When profiling shows neighbor search is expensive, divide the world into fixed cells and store entities by location. A creature searches its cell and nearby cells rather than the entire world.

This is the simplest spatial-partition pattern and can reduce local-query cost dramatically when entities are distributed. It adds bookkeeping and should not be implemented before needed. [Game Programming Patterns: Spatial Partition](https://gameprogrammingpatterns.com/spatial-partition.html)

Learning opportunities:

- Hash maps.
- Integer coordinate keys.
- Sets or arrays per cell.
- Updating membership after movement.
- Querying overlapping cells.
- Complexity measurement.

## 11.3 Scheduling

Possible activation models:

- Sequential fixed order.
- Sequential shuffled order.
- Simultaneous intent then resolution.
- Staged by entity type.

Our preferred model is staged intent and resolution. Within contested events, use either seeded shuffle or an explicit rule. This reduces hidden array-order bias while remaining understandable.

## 11.4 Graphs and lineage

Parent-child links form a directed acyclic graph if each creature stores parent IDs. Initially, asexual reproduction creates a tree or forest. Sexual reproduction later turns it into a more general ancestry graph.

Possible later algorithms:

- Find ancestors with DFS/BFS.
- Calculate generation depth.
- Count living descendants.
- Prune extinct detailed history while keeping summaries.
- Cluster similar genomes cautiously.

## 11.5 Evolution statistics

- Mean and median trait values.
- Histograms.
- Variance.
- Reproductive success by trait range.
- Survival time by trait range.
- Correlations, clearly labeled as correlations.
- Results across multiple seeds.

Avoid using a single average when the population may contain two different strategies.

---

## 12. Performance strategy

## 12.1 Start simple

Do not optimize before a working measurement exists. Arrays of plain TypeScript objects and linear scans are acceptable for the first milestone.

## 12.2 Measure separate budgets

Track:

- Simulation milliseconds per tick.
- Rendering milliseconds per frame.
- Number of creatures.
- Number of food items.
- Number of neighbor comparisons.
- Events produced per tick.
- Metrics/history memory.

This tells us whether the bottleneck is biology, drawing, logging, or UI.

## 12.3 Likely optimization order

1. Remove accidental repeated work.
2. Reduce sampling frequency for graphs and nonessential senses.
3. Use squared-distance checks.
4. Add spatial hashing for local queries.
5. Batch canvas drawing and reduce per-agent text.
6. Reuse short-lived objects or buffers if allocation is measured as a problem.
7. Lower visual detail at high populations or distant zoom.
8. Move headless/batch simulation to a Web Worker if the UI blocks.
9. Consider typed arrays or data-oriented storage only if profiling justifies it.
10. Consider WebAssembly only after the algorithm and data layout are stable.

The Sapling's experience warns that caching and pooling solve some costs while creating memory-management problems of their own. Every optimization needs a budget and cleanup strategy.

## 12.4 Population limits

Use a configurable organism cap early. This is not a substitute for optimization; it prevents accidental browser freezes while algorithms are still naive.

If a cap is reached, the simulation should expose it visibly. Silent refusal to reproduce changes biology and confuses users.

## 12.5 Fast-forward

Fast-forward should advance more simulation ticks per rendered frame. At very high speed:

- Render less frequently.
- Sample charts less frequently.
- Keep input responsive.
- Cap work per frame to prevent a “spiral of death.”

Eventually, a maximum-speed mode may run simulation batches without rendering every step.

---

## 13. Testing and experimental practice

## 13.1 Unit tests

Good early tests:

- Normalizing a vector produces the expected direction.
- Movement cost lowers energy by the configured amount.
- Eating removes one food item and transfers its energy once.
- A dead creature cannot eat or reproduce.
- Reproduction conserves the configured parent/child energy transfer.
- Entities stay inside the world under the chosen boundary rule.
- Same seed and inputs produce identical state after N ticks.

## 13.2 Invariants

Invariants are truths that should hold across many random worlds:

- Energy is never `NaN`.
- Positions remain finite.
- IDs are unique.
- Dead entities are absent after the commit phase.
- Food cannot be consumed twice.
- Population never exceeds the configured cap.
- Trait values remain inside allowed bounds.

Property-based testing is well suited to agent simulations because it expresses model invariants and exercises many generated cases. [Research on property-based testing of agent models](https://link.springer.com/article/10.1007/s10458-020-09473-8)

## 13.3 Deterministic replay tests

Store a small configuration and seed. Run 1,000 ticks and hash or snapshot a carefully selected summary. A result change should be intentional and reviewed.

Avoid enormous snapshots of every floating-point value if harmless rendering or precision changes would make them brittle.

## 13.4 Statistical tests

Random simulations should not be judged from one attractive run.

For tuning:

- Run the same configuration under many seeds.
- Record extinction time, final population, births, deaths, and trait distributions.
- Compare mean, median, spread, and failure rate.
- Change one parameter at a time early.
- Later use small parameter sweeps.

NetLogo's BehaviorSpace exists specifically to repeat models, vary settings, and record metrics; it supports means and standard deviations over repetitions. [BehaviorSpace guide](https://docs.netlogo.org/behaviorspace.html)

## 13.5 Long-run tests

Run unattended simulations for increasing durations:

- 10 minutes.
- 1 hour.
- Overnight.

Monitor:

- Memory.
- Entity counts.
- History growth.
- Numeric sanity.
- Save size.
- UI responsiveness.

## 13.6 Model validation versus software correctness

These are different questions:

- **Software correctness:** Did the code implement our stated rules?
- **Model validity:** Do those rules produce a useful representation of what we claim?

We can test the first rigorously. The second requires modest claims, sensitivity analysis, comparison with known qualitative patterns, and possibly expert sources. The initial product should call itself an artificial or toy ecosystem.

---

## 14. Development and learning roadmap

Each milestone should leave the application runnable and teach a small set of concepts.

## Milestone 0: Written model

Deliverables:

- One-page version 0.1 rules.
- Explicit constants and units.
- Update phase order.
- Definition of done.

Learning:

- Turning an idea into testable rules.
- Separating assumptions from implementation.

## Milestone 1: World and rendering

Deliverables:

- TypeScript browser project.
- Canvas with correct sizing.
- One stationary creature.
- Render loop.

Learning:

- Project structure.
- DOM and Canvas basics.
- Coordinates.
- Data versus drawing.

## Milestone 2: Movement

Deliverables:

- Position and velocity vectors.
- Fixed simulation tick.
- Wander behavior.
- Boundary handling.
- Multiple creatures.

Learning:

- Vectors.
- Loops and arrays.
- Fixed versus variable time.
- Randomness.

## Milestone 3: Food and interaction

Deliverables:

- Food entities.
- Add-food interaction.
- Contact detection.
- Eating event.

Learning:

- Distance algorithms.
- Searching collections.
- Entity interaction.
- Removing items safely.

## Milestone 4: Life cycle

Deliverables:

- Energy loss.
- Death.
- Reproduction.
- Birth/death counters.
- Stable commit phase.

Learning:

- State machines.
- Queued mutations to collections.
- Balancing and debugging feedback loops.

## Milestone 5: Sandbox controls and observability

Deliverables:

- Play, pause, step, reset, and speed.
- Creature selection.
- Inspector.
- Population chart.
- Debug overlay.

Learning:

- UI state.
- Events.
- Time-series data.
- Debug tooling.

This is the first public-worthy version.

## Milestone 6: Purposeful behavior

Deliverables:

- Vision radius.
- Nearest-food search.
- Seek behavior.
- Wander/seek transition.
- Explainable target choice.

Learning:

- Search.
- Finite-state behavior.
- Steering vectors.
- Complexity measurement.

## Milestone 7: Reproducible worlds

Deliverables:

- Seeded RNG.
- Same-seed replay.
- Deterministic test.
- Save starting configuration.

Learning:

- Pseudorandom generators.
- Determinism.
- Serialization.

## Milestone 8: First evolution

Deliverables:

- One inherited trait, probably speed.
- A real cost for that trait.
- Small mutation.
- Trait histogram.
- Parent/child links.
- Comparison across multiple seeds.

Learning:

- Inheritance.
- Probability distributions.
- Statistical variation.
- Graph relationships.

## Milestone 9: Resource ecology

Deliverables:

- Food becomes growing plants.
- Fertility or light drives regrowth.
- Eaten biomass returns later through a simple cycle.
- Resource distribution can be uniform or patchy.

Learning:

- Cellular fields or spatial layers.
- Feedback loops.
- Parameter sensitivity.

## Milestone 10: Predation

Deliverables:

- A second consumer type.
- Pursuit and flee.
- Predator/prey energy transfer.
- Population phase-lag graphs.

Learning:

- Multiple agent types.
- More complex local search.
- Coupled population dynamics.

## Milestone 11: Performance

Deliverables:

- Profiling report.
- Spatial hash if justified.
- Before/after benchmarks.
- Population stress test.

Learning:

- Big-O reasoning.
- Hash maps and spatial partitioning.
- Measurement-driven optimization.

---

## 15. Risk register

| Risk | Early warning | Mitigation |
|---|---|---|
| Scope explosion | New systems added before the life cycle works | Maintain Now/Next/Later lists and milestone gates |
| Lifeless behavior | Dots move but users cannot explain anything | Inspector, debug vectors, events, meaningful needs |
| Instant extinction | Most seeds die within seconds | Tune through batches; grace period; sufficient initial resources |
| Runaway population | Browser freezes during exponential growth | Reproduction costs, resource limits, visible population cap |
| One optimal trait | Distribution sticks to a min/max bound | Add a real cost, competing pressure, or remove the trait |
| Frame-rate dependence | Different monitor speed changes outcomes | Fixed simulation tick and deterministic tests |
| Update-order bias | Same IDs always win contested resources | Staged resolution or seeded tie-breaking |
| Slow neighbor search | Tick time grows quadratically | Profile, then add uniform spatial grid |
| Unbounded history | Memory grows throughout long runs | Bounded events, sampled metrics, summarized ancestry |
| Save incompatibility | New fields break old worlds | Versioned saves and migrations |
| Opaque evolution | User sees changed averages but not why | Lineage, distributions, event history, comparison runs |
| False scientific claims | Users interpret toy rules as ecology | Publish rule assumptions and label model honestly |
| UI overwhelms simulation | More time spent on panels than behavior | Keep initial controls minimal; add UI only for a user question |
| Premature architecture | Many empty abstractions and files | Extract modules only when responsibility appears |
| Premature optimization | Spatial/ECS code delays first life cycle | Begin with arrays and linear scans; measure first |
| Long-run failures | Works for five minutes, fails after hours | Automated long-run and memory tests |

---

## 16. Design principles to keep visible during development

1. **Make one complete loop before adding breadth.** Food, movement, energy, reproduction, and death form the first loop.
2. **Every rule should be explainable in one sentence.**
3. **Every mutable trait needs a benefit and a cost.**
4. **Every random result should be replayable from a seed.**
5. **The renderer observes the simulation; it does not control its laws.**
6. **A selected creature should explain itself.**
7. **Measure before optimizing.**
8. **Run many seeds before believing a pattern.**
9. **Prefer a deep interaction among three systems over ten shallow systems.**
10. **Call the model a toy until evidence justifies a stronger claim.**
11. **Do not hide limits.** Show population caps, dropped history, or approximated visuals.
12. **Keep the application enjoyable at normal speed before relying on fast-forward.**

---

## 17. Open design questions

These should be answered by prototypes rather than debate alone:

1. Should walls bounce creatures, steer them away, or wrap the world?
2. Should initial food be discrete dots or regenerating patches?
3. How much energy should movement cost relative to baseline metabolism?
4. Should reproduction happen automatically above a threshold or require a behavioral state?
5. How should two creatures contest one food item?
6. How many agents can the naive TypeScript implementation support at the chosen tick rate?
7. Which chart makes the first version more understandable without adding substantial UI work?
8. Is nearest-food seeking too perfect, and if so, what perception error is useful?
9. Which first inherited trait produces multiple viable strategies rather than one maximum?
10. How much event history can be stored before memory becomes a problem?

---

## 18. Future research backlog

Research these only when the corresponding milestone approaches:

- Seedable PRNG algorithm and cross-browser reproducibility.
- Uniform-grid spatial hash design and cell-size tuning.
- Trait mutation distributions and boundary handling.
- Ecologically meaningful speed/metabolism scaling.
- Population sampling and chart downsampling.
- Lineage pruning and persistent summaries.
- Simple plant growth and nutrient cycles.
- Predator functional responses and prey refuge behavior.
- Speciation definitions and genome-distance clustering.
- Web Worker architecture for headless simulation.
- Save migration strategy.
- Accessibility for color, motion, and reduced-animation preferences.
- Sharing worlds without a backend.

---

## 19. Decision log

### 2026-10-31: Open-ended sandbox over challenge game

Reason: The most interesting coding work is the simulation itself. A challenge layer would require progression, content, balancing, tutorials, and reward systems before the artificial world is compelling. Challenges remain possible later using the same engine.

### 2026-10-31: Browser and TypeScript

Reason: Immediate visual feedback, easy sharing, and relevant frontend practice. TypeScript supports explicit domain models and safer refactoring.

### 2026-10-31: Canvas 2D over DOM agents or 3D

Reason: Canvas is suited to many moving simple objects. DOM elements per organism add layout overhead; 3D adds asset, camera, and rendering complexity without improving the early simulation.

### 2026-10-31: Agent-based continuous world

Reason: Individual identity, behavior, and lineage are central. Continuous positions better support natural movement and spatial algorithms than a cell-only model.

### 2026-10-31: Handwritten behavior before evolved intelligence

Reason: Seek, wander, and flee are understandable, testable, and sufficient for meaningful local behavior. Neural controllers can become a separate advanced experiment.

### 2026-10-31: Explainability as a core feature

Reason: It improves the user experience, debugging, teaching value, and architecture simultaneously.

---

## 20. Annotated reference shelf

### Comparable products

- [Equilinox official overview](https://www.equilinox.com/about/) — ecosystem building, species needs, evolution, progression.
- [Equilinox press kit](https://equilinox.com/presskit/sheet.php?p=equilinox) — feature and development overview.
- [The Sapling](https://thesaplinggame.com/) — creature/plant design and evolution sandbox.
- [The Sapling optimization postmortem](https://thesaplinggame.com/devlogs/optimization.html) — pooling, cached models, delayed visual fidelity, memory tradeoffs.
- [The Sapling seven-day run](https://thesaplinggame.com/devlogs/stream) — long-run testing and backups.
- [The Sapling FAQ](https://thesaplinggame.com/faq) — performance limits, organism caps, memory issues, project scope.
- [Ecosystem](https://www.ecosystem-game.com/home/) — synthetic DNA, physical swimming, food web, abiotic environment.
- [Species developer FAQ](https://speciesdevblog.wordpress.com/faq-mk2-0/) — simulation-first natural selection philosophy.
- [Species store page](https://store.steampowered.com/app/774541/Species_Artificial_Life_Real/) — clade diagram, intervention tools, inspection.
- [Evolution by Keiwan](https://keiwan.itch.io/evolution) — body builder, neural network, genetic algorithm, explicit sandbox framing.
- [Evolution source repository](https://github.com/keiwando/evolution) — Unity project available for educational inspection under its stated license.
- [Origin](https://origin.petri-labs.org/) — modern sandbox/challenge/lab split and reported Rust/Wasm architecture.

### Educational and scientific models

- [NetLogo Wolf Sheep Predation](https://ccl.northwestern.edu/netlogo/models/WolfSheepPredation) — canonical energy and predator-prey agent model.
- [NetLogo BehaviorSpace](https://docs.netlogo.org/behaviorspace.html) — parameter sweeps, repeated runs, metrics, and statistics.
- [NetLogo programming guide](https://docs.netlogo.org/programming) — scheduling, randomness, and update semantics.
- [Mesa documentation](https://mesa.readthedocs.io/stable/index.html) — modern agent-based model structure, space, agents, data collection, and visualization.
- [Mesa wolf-sheep source](https://github.com/mesa/mesa/tree/main/mesa/examples/advanced/wolf_sheep) — multi-file reference implementation.
- [Avida-ED](https://avida-ed.github.io/Avida-ED3/AvidaED.html) — individual/population inspection and repeatable digital-evolution experiments.
- [Avida-ED mutation exercise](https://avida-ed.github.io/curriculum/lab-manual/exercise-1/) — baseline, treatment, observation, and evidence workflow.
- [Lenia paper](https://arxiv.org/abs/1812.05433) — continuous cellular automata and emergent artificial life.

### Algorithms and implementation

- [Craig Reynolds' Boids](https://www.red3d.com/cwr/boids/) — separation, alignment, cohesion, local perception, and complexity.
- [Steering Behaviors for Autonomous Characters](https://www.red3d.com/cwr/steer/gdc99/) — seek, flee, wander, pursuit, obstacle avoidance, and weighted steering.
- [The Nature of Code](https://nature-of-code-2nd-edition.netlify.app/) — learning sequence for randomness, vectors, agents, evolution, and neuroevolution.
- [Game Programming Patterns: Spatial Partition](https://gameprogrammingpatterns.com/spatial-partition.html) — fixed-grid neighbor lookup and its tradeoffs.
- [Fix Your Timestep](https://github.com/mas-bandwidth/gafferongames/blob/main/content/post/fix_your_timestep.md) — fixed-step simulation and rendering interpolation.
- [MDN Canvas optimization](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) — browser rendering practices.
- [Property-based testing of agent simulations](https://link.springer.com/article/10.1007/s10458-020-09473-8) — model invariants and generated tests.

---

## 21. Immediate next deliverable

Before creating application code, write a short `VERSION_0_1_SPEC.md` derived from this guide. It should contain only:

- The exact world dimensions and boundary behavior.
- Creature fields used in version 0.1.
- Food fields used in version 0.1.
- Initial constants.
- Tick phases.
- Eating, energy, reproduction, and death rules.
- User controls.
- Definition of done.
- Explicit non-goals.

That specification should be small enough to read in five minutes. This research guide explains the landscape and direction; the version specification will tell us what to implement next.
