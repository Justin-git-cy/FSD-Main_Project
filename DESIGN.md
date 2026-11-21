# ViewPoint Bangalore · Design brief

## Brief

- **Subject:** ViewPoint, a community guide to trails, historic places, and outdoor discoveries around Bangalore.
- **Audience:** People looking for a nearby day out who need practical notes on difficulty, access, and changing conditions.
- **Job:** Help visitors choose a place to explore, then invite them to contribute useful local knowledge.
- **Primary action:** Explore the map. Sharing a place is the secondary action.
- **Assumption:** Existing seeded places and ratings are demo content. Keep them clearly editable and replace them with verified community information before a public launch.
- **Stack:** Existing React 19 and React Router application with GSAP ScrollTrigger for the pinned, scroll scrubbed story and hero transition. This preserves current routes, local data, and the shared weather simulator.

## Concept card

- **Idea:** ViewPoint is a contour field guide where every route is a trace through Bangalore’s changing edges.
- **Metaphor:** A folded survey map with field notes pinned to real places.
- **Signature:** A full viewport hero recedes into a paper colored field note on scroll. The 3D map layers separate in depth during the turn, then the route continues through three landscape chapters. GSAP ScrollTrigger progress controls the hero tilt, map layers, active field note, and chapter counter.
- **Emotion:** Curious, grounded, and prepared.
- **Motion verb:** Trace, turn in depth, then settle.
- **Screenshot:** A quiet contour map with a highlighted route beside the line “Find the paths Bangalore forgot.”
- **Genericness test:** The route geometry, coordinates, season notes, and local names tie the visual system to ViewPoint’s actual subject. Replaced a generic adventure badge with map marks and field notes.

### Concepts considered

| Concept | Layout / motion / visual | Signature and frame | Anchor | Originality / fit / feasibility / portability |
|---|---|---|---|---|
| Contour field guide | Survey map, tracing line, lichen green and paper | Weather aware route map beside the hero statement | Bangalore outskirts and location data | 4 / 5 / 5 / 2 |
| Monsoon dispatch | Seasonal bulletin, alerts that post like field reports, rain marked in clay | Change the conditions and see the safety note update | Seasonal scoring and weather simulator | 3 / 5 / 5 / 3 |
| The long way home | A winding editorial path between short notes, drift and reveal | Follow the route through the page to the next discovery | Out of town day trips | 3 / 4 / 4 / 4 |

Chosen: **Contour field guide**, because one map language can carry discovery, local detail, safety, and the final call to action.

## Art direction

- **Ground:** `#131A16`, charcoal forest.
- **Paper:** `#eeeade`.
- **Ink:** `#202720`, dark moss ink.
- **Muted:** `#73796F`, weathered field note.
- **Line:** `rgba(32, 39, 32, .18)`, contour pencil.
- **Accent:** `#C2D67B`, survey marker.
- **Warning accent:** `#DA805D`, trail advisory.
- **Type:** Zodiak for expressive display lines and General Sans for navigation, reading, and controls. Both WOFF2 families are stored in `public/fonts` and served locally. No italic or ultra bold type.
- **Grid:** 12 columns on desktop with wide outer margins; 4 columns on phones. The home page alternates asymmetrical map, statement, image index, field illustration, and process layouts.
- **Shape:** Square corners for the field panels; circular marks are reserved for waypoints and the field code stamp.
- **Motion:** Single-clock GSAP + Lenis engine (`src/engine/`). Navigation triggers a fast Contour Survey Sweep curtain with focus/title management and a `2px` scroll progress thread along the header. The hero map tilts smoothly with an ambient pointer/tick idle driver (pausing off screen), then folds into depth during scroll scrub. Statement words illuminate scrubbed to scroll; the three-act trail story traces the SVG route across 3D depth plates; conditions ridge layers parallax and respond visually to weather/season; the Field Archive ledger reveals floating photo previews on fine pointers; and the Field Code stamp rotates on scroll. Under `prefers-reduced-motion: reduce)`, Lenis, idle motion, pinning, and scroll scrubbing turn off while keeping all copy visible.

## Full-stack page architecture

- `/` (`Home.jsx`): Scroll-choreographed Contour Field Guide with asymmetric 5-card discoveries, cursor-following Field Archive ledger, reactive climate matches, and live community telemetry.
- `/location/:id` (`LocationDetail.jsx`): Full location dossier with multi-photo switcher, seasonal suitability meters, live weather advisories, embedded sector Leaflet map, nearby distances, and interactive MongoDB community reviews.
- `/explore` (`Explore.jsx`): Full-viewport interactive Leaflet Field Atlas with custom contour pins, weather notes, category/status filters, and mobile list/map switcher.
- `/trending` (`Trending.jsx`): Ranked community podium and searchable verified registry.
- `/recommendations` (`Recommendations.jsx`): Server-scored (`POST /api/locations/recommendations`) seasonal match feed with SVG score rings and 4-factor breakdowns.
- `/add-location` (`AddLocation.jsx`): Interactive click-to-pin coordinate form with live card preview posting to MongoDB.
- `/profile` (`Profile.jsx`), `/login` (`Login.jsx`), `/settings` (`Settings.jsx`), `/preferences` (`Preferences.jsx`), `*` (`NotFound.jsx`): Complete explorer ledger, MongoDB user auth/profile updates, live Leaflet radius visualizer, and live-preview trail interest calibrator.

## Content and limitations

The database currently seeds locations and sample ratings. The UI labels them as community notes, but those records are not independently verified as current real world information. Review location access, accuracy, safety guidance, and imagery before publishing. Weather values are simulated, not live forecasts.
