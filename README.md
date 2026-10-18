# Birthday Memory Board

This is a preexisting file for a client project based on a bday party, please go through the zip and understanding the layout and add the following features



The client has requested several refinements and feature additions to elevate the website into a polished, immersive, production-ready experience while preserving the existing artistic direction, animation quality, and storytelling flow.

The first issue to address is the Replay button at the end of the experience, which is currently non-functional. This button must be fully repaired so that selecting it completely resets the application to its original state. Every animation, transition, loading sequence, soundtrack, camera interaction, particle effect, and temporary runtime variable should be reset exactly as though the visitor has opened the website for the first time. The replay should feel seamless and identical to the original experience without requiring the page to be manually refreshed.

At the conclusion of the birthday experience, introduce a second call-to-action labelled “Wish Well Bulletin Board.” This button should navigate visitors to a dedicated page showcasing heartfelt birthday wishes submitted by the client’s closest friends and family.

The bulletin board should closely resemble a real physical notice board rather than a conventional webpage. Use a realistic corkboard or textured fabric backing with subtle lighting, soft shadows, and depth. At the top, display a large handwritten-style title reading “Wish Well Bulletin Board.” Birthday wishes should appear as individual handwritten notes naturally scattered across the board. Each note must be visually unique, incorporating different paper colours, textures, slight folds, varying sizes, rotations, handwritten fonts, and realistic drop shadows. Every note should be attached using uniquely coloured push pins with natural placement, giving the illusion that each message has been physically pinned onto the board. The layout should appear organic and handcrafted rather than arranged in a rigid grid.

The bulletin board must not rely on hardcoded content. Instead, implement a backend database that stores every submission dynamically. Each stored entry should contain the sender’s name, an optional profile image, the uploaded handwritten birthday note image, an optional text transcription, upload timestamp, publication status, and any additional metadata required for proper management. The bulletin board should retrieve and display only approved entries from this database.

Create a secure administrator dashboard connected to this backend. Administrator authentication must follow modern security best practices, including securely hashed passwords using Argon2 or bcrypt, protected authenticated sessions, role-based authorization, CSRF protection, rate limiting for authentication attempts, server-side validation of uploads, secure file handling, and proper protection of all administrative routes. Administrators should be able to approve, reject, edit, hide, delete, and manage every submission from a clean management interface.

Additionally, develop a separate submission portal intended exclusively for the client’s friends and family. This portal should allow users to upload handwritten birthday notes, optionally include their name and profile picture, preview their submission before sending, and securely submit their wishes. Every uploaded file must be validated, safely stored in the database, and remain hidden from the public bulletin board until manually approved by an authorized administrator.

The client has also requested a complete redesign of the loading screen animation.

A sprite sheet containing multiple frames of a black cat has been provided. Discard the existing loading cat animation entirely and replace it using the supplied sprite sheet.

Before implementing the animation, carefully analyze the sprite sheet to determine the most natural sequence of frames. Do not simply iterate through every frame in order. If duplicate, transition, or unnecessary frames exist, intelligently exclude them to create the smoothest possible movement cycle. Choose whichever sequence—walking, trotting, or running—best matches the playful personality and visual style of the website.

Implement the animation using a properly cropped sprite sheet. Every frame should preserve transparency, maintain identical scaling, and remain perfectly aligned to eliminate jitter or inconsistent positioning. The animation should play smoothly at an appropriate frame rate of approximately 12–18 FPS, or whichever timing produces the most fluid motion. The loop must be seamless with no noticeable jump when restarting.

Synchronize the cat’s movement with the loading bar so that it appears to naturally travel alongside the loading progress instead of sliding independently across the screen. Ensure the body movement, head, tail, and legs transition fluidly from frame to frame, creating the illusion of genuine motion rather than a sequence of disconnected images. Remove all signs of the current glitchiness, unnatural movement, inconsistent scaling, or abrupt positional changes.

Optimize the sprite animation to remain lightweight and performant without negatively affecting the website’s loading speed.

Throughout these additions, maintain the existing visual identity, smooth animations, immersive storytelling, responsiveness across desktop and mobile devices, accessibility standards, and overall premium user experience. Every new feature should feel like a natural extension of the original birthday website rather than a separate application, resulting in a cohesive, polished, and memorable final product.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://surya-a156.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7043b751-9167-41a9-8459-ed122a165c0b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
