# THE LOBBY - Direct-Connect Ride Platform 🚖

THE LOBBY is a specialized ride-hailing web application designed for direct driver-to-rider connection. Unlike traditional apps, THE LOBBY focuses on transparency and direct communication, allowing riders to search for verified drivers by route/destination and connect via phone call instantly.

## 🚀 Key Features

### 👤 For Riders
- **Smart Search:** Find drivers based on specific destinations or routes with debounced search optimization.
- **Direct Connect:** "Click-to-Call" functionality to speak directly with drivers without a middleman.
- **Trust & Safety:** View driver profiles, vehicle photos, and verification badges before calling.
- **Ride History:** Personal dashboard tracks recently contacted drivers for quick re-booking.

### 🚘 For Drivers
- **Availability Control:** Real-time "Go Online/Offline" toggle to manage visibility in search results.
- **Profile Management:** Update vehicle details, routes, and contact info instantly.
- **Image Uploads:** Cloud-integrated upload for Profile and Vehicle photos (via Cloudinary).
- **Verification System:** 'Pending' status restricts access until Admin approval.

### 🛡️ For Admins
- **Dashboard:** Real-time metrics on Total Users, Active Drivers, and Call Leads.
- **User Management:** Full directory of Riders and Drivers with search and delete functionality.
- **Verification Portal:** Review and manually approve new driver applications.
- **Platform Controls:** Manage system settings and view platform logs.

## AI-Assisted Optimization

Codex and GPT-5.6 were used as development assistants to review, optimize, and harden THE LOBBY during the pilot-readiness phase. The AI workflow helped turn the app from a basic direct-connect ride platform into a more complete mobile-first PWA for riders, drivers, and admins.

### How Codex Was Used
- **Repository scanning:** Codex inspected the Next.js codebase, identified weak flows, and helped prioritize changes for rider onboarding, driver onboarding, admin controls, and search reliability.
- **Mobile-first UI improvements:** Codex helped refine the rider homepage, driver dashboard, search flow, dropdown filters, profile cards, and admin dashboard so the app is easier to use on smaller screens.
- **Admin operations:** Codex added and refined admin tools for driver verification, user management, complaints, payment reminders, pilot-readiness checks, exports, and driver data completeness.
- **Driver and rider flows:** Codex helped improve driver profile setup, vehicle details, number plate visibility, taxi stand selection, vehicle type filtering, recently contacted drivers, favourites, and rider-to-driver WhatsApp copy.
- **Pilot launch checks:** Codex was used to reason through whether the app could support a pilot with 60-80 founding drivers and a growing rider base, focusing on search volume, profile views, upload pressure, and admin sync/export actions.
- **Validation:** Codex ran lint/build checks after major changes to catch broken imports, route errors, and production build failures before pushing updates.

### How GPT-5.6 Was Used
- **Product strategy:** GPT-5.6 helped shape pilot-readiness priorities, including driver completeness rules, WhatsApp fallback flows, emergency admin controls, and simple analytics.
- **UX review:** GPT-5.6 was used to think through the first-time experience for riders in Kohima and the daily workflow for local taxi drivers.
- **Feature planning:** GPT-5.6 helped compare THE LOBBY against ride-hailing competitors and suggest local-first features such as taxi stand filtering, direct call/WhatsApp connection, verified driver visibility, and admin-led pilot operations.
- **Copy and policy support:** GPT-5.6 assisted with clearer app messages, failure states, WhatsApp templates, terms, privacy policy wording, and admin-facing documentation.

All AI-assisted changes were reviewed, edited, and validated before being committed. Codex and GPT-5.6 supported implementation and decision-making, but the app's final product direction, launch choices, and operational rules remain human-controlled.

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Image Storage:** Cloudinary
- **Authentication:** JWT (JSON Web Tokens)

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone [https://github.com/yourusername/lobby.git](https://github.com/yourusername/lobby.git)
   cd lobby

COPYRIGHT NOTICE

Copyright (c) 2026 [Nilesh Sen / Khalong Kichu]. All Rights Reserved.

This source code is the proprietary property of [Nilesh Sen / Khalong Kichu]. 

1. You may strictly view this code for educational or portfolio evaluation purposes only.
2. You are strictly prohibited from copying, modifying, distributing, selling, or using this code (in whole or in part) for any commercial or non-commercial purpose.
3. Unauthozired use will be prosecuted to the full extent of the law.


