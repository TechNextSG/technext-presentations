# -*- coding: utf-8 -*-
"""Marketing Showcase content. Facts come from the site inventory (every URL checked 200 on 2026-09-28)
and the project notes; nothing here is a result or a metric. Screenshots: assets/img/sites/<slug>-*.jpg.
Blue Moon Secret's Chamber and Tri-Comp Solutions were removed on request (2 Oct 2026); keep them out.
PITCH is laid out five to a row (marketing-showcase.html, .cw--5)."""

LIVE = [
    dict(slug="casa-escondida-anilao", name="Casa Escondida Anilao", kicker="dive resort · anilao, philippines",
         url="https://www.casaescondida-anilao.com/", dom="casaescondida-anilao.com",
         what="The resort's live website: rooms, diving, dining, location and gallery, a hero video, and a Book Now page that turns enquiries into quotation requests.",
         chips=[("globe", "Website"), ("calendar", "Book Now page"), ("mail", "Quotation requests"), ("bot", "Chatbot"), ("play", "Hero video")],
         meta=[("Type", "Live client site"), ("Industry", "Hospitality · dive resort"), ("Where", "Anilao, Batangas, Philippines")]),
    dict(slug="bhd-asia", name="BHD Asia", kicker="executive coaching & hr consulting · singapore",
         url="https://bhdasia.com/", dom="bhdasia.com",
         what="Website for a Singapore HR-consulting and executive-coaching firm: services, team bios, event pages with countdowns, and lead-capture forms.",
         chips=[("globe", "Website"), ("users", "Team pages"), ("calendar", "Event countdowns"), ("mail", "Lead capture")],
         meta=[("Type", "Live client site"), ("Industry", "Coaching & HR consulting"), ("Where", "Singapore")]),
    dict(slug="hummingbeing", name="HummingBeing", kicker="tre & somatic coaching · worldwide",
         url="https://hummingbeing.com/", dom="hummingbeing.com",
         what="Website for a TRE and somatic-coaching practice: events and certification pages, workshop registration, facilitator bios and online-session guides.",
         chips=[("globe", "Website"), ("calendar", "Events"), ("graduation", "Certification pages"), ("usercheck", "Registration")],
         meta=[("Type", "Live client site"), ("Industry", "Wellness · TRE & coaching"), ("Where", "Worldwide")]),
    dict(slug="nivellipso", name="nivellipso", kicker="clear aligners & brackets · switzerland",
         url="https://www.nivellipso.com/", dom="nivellipso.com",
         what="German and English B2B site for a Swiss clear-aligner and bracket maker: product lines and price lists, an academy, the VISIBAL app page and a chatbot.",
         chips=[("globe", "Website · DE / EN"), ("receipt", "Price lists"), ("graduation", "Academy"), ("bot", "Chatbot")],
         meta=[("Type", "Live client site"), ("Industry", "Dental · orthodontics"), ("Where", "Switzerland")]),
    dict(slug="jrtech-website", name="JR-Tech Solution", kicker="commercial kitchens · penang, malaysia",
         url="https://technextsg.github.io/jrtech-website/", dom="technextsg.github.io/jrtech-website",
         what="Company website for a Malaysian commercial-kitchen design, equipment and maintenance provider, with the product catalogue brought over from the old site.",
         chips=[("globe", "Website"), ("grid", "Product catalogue"), ("wrench", "Services")],
         meta=[("Type", "Client site"), ("Industry", "Commercial kitchens"), ("Where", "Penang, Malaysia")]),
    dict(slug="tre-singapore", name="TRE in Singapore", kicker="tre community · singapore",
         url="https://tre-in-singapore.com/", dom="tre-in-singapore.com",
         what="Community website for TRE practitioners in Singapore: events shared with HummingBeing, a facilitator directory with profile pages, a blog and a contact form.",
         chips=[("globe", "Website"), ("users", "Facilitator directory"), ("calendar", "Events"), ("file", "Blog")],
         meta=[("Type", "Client site"), ("Industry", "Wellness · TRE community"), ("Where", "Singapore")]),
    dict(slug="technext-asia", name="technext.asia", kicker="our own website",
         url="https://technext.asia/", dom="technext.asia",
         what="TechNext's own site: Odoo app pages with live demos, industry solutions, offices, careers and a blog, with meetings booked through Odoo Appointments.",
         chips=[("globe", "Website"), ("play", "Live demos"), ("file", "Blog"), ("calendar", "Meeting booking")],
         meta=[("Type", "TechNext's own site"), ("Industry", "Odoo · AI · marketing"), ("Where", "Singapore · Philippines · Vietnam")]),
]

CONCEPTS = [
    dict(slug="immaculate-connections-redesign", name="Immaculate Connections", kicker="travel agency · cebu, philippines",
         url="https://technextmarketing.github.io/immaculateconnectionsph/", dom="technextmarketing.github.io/immaculateconnectionsph",
         what="Redesign concept for a Cebu travel agency: tours and packages, ticketing, hotel and vehicle bookings, and an enquiry and quotation form.",
         chips=[("layout", "Redesign concept"), ("plane", "Tours & packages"), ("calendar", "Bookings"), ("mail", "Quotation form")],
         meta=[("Type", "Concept · redesign"), ("Industry", "Travel agency"), ("Where", "Cebu, Philippines")]),
    dict(slug="auntie-gaik-lean", name="Auntie Gaik Lean's Old School Eatery", kicker="peranakan restaurant · penang, malaysia",
         url="https://technextsg.github.io/auntie-gaik-lean/", dom="technextsg.github.io/auntie-gaik-lean",
         what="Seven-page restaurant website concept for a Michelin-starred Peranakan restaurant in Penang: story, menu, press, reservations and visit.",
         chips=[("layout", "Website concept"), ("utensils", "Menu"), ("quote", "Press"), ("calendar", "Reservations")],
         meta=[("Type", "Concept · website"), ("Industry", "F&B · restaurant"), ("Where", "Penang, Malaysia")]),
    dict(slug="tre-bali-conference", name="TRE Worldwide Conference", kicker="international conference · bali, 2027",
         url="https://technextmarketing.github.io/tre-bali-conference/", dom="technextmarketing.github.io/tre-bali-conference",
         what="Event website prototype for the TRE Worldwide Conference in Bali, November 2027: a live countdown, ticket waves, speakers, venue and registration.",
         chips=[("calendar", "Event site"), ("clock", "Live countdown"), ("receipt", "Ticket waves"), ("usercheck", "Registration")],
         meta=[("Type", "Concept · event site"), ("Industry", "Events"), ("Where", "Bali, Indonesia")]),
]

MORE = [
    ("movewithease-v2", "Move with Ease", "Wellbeing therapy · Kent, UK", "https://technextmarketing.github.io/movewithease-v2/"),
    ("tre-romania", "TRE România", "Non-profit association · Romania", "https://technextmarketing.github.io/tre-romania-website/"),
    ("saymara-website", "Saymara B. Ryon", "Holistic coaching · Romania", "https://technextmarketing.github.io/saymara-website/"),
    ("antech-v2", "Antech-Enviro", "Semiconductor services · Philippines", "https://technextsg.github.io/antech-v2/"),
    ("deluxcious", "Deluxcious", "Restaurant & bar · Penang", "https://technextsg.github.io/deluxcious-website/"),
    ("hdh-ag-visibal", "HDH AG", "Medtech group · Switzerland", "https://technextsg.github.io/hirsch-dynamics-visibal/"),
    ("technext-website-v3-concept", "TechNext v3", "Our own redesign concept", "https://technextmarketing.github.io/technext-website-v3/"),
    ("lalala-resort", "Lalala Resort", "Resort website demo", "https://technextsg.github.io/lalalaresort/"),
    ("visibal-app", "VISIBAL app", "Patient & clinic app prototype", "https://technextsg.github.io/visibal-app/"),
]

PITCH = [
    ("showcase-casa-escondida", "Casa Escondida", "Marketing showcase", "show", "https://technextsg.github.io/casa-escondida-marketing-showcase/"),
    ("showcase-auntie-gaik", "Auntie Gaik Lean", "Marketing showcase", "show", "https://technextmarketing.github.io/auntie-gaik-marketing-showcase/"),
    ("showcase-jrtech", "JR-Tech Solution", "Marketing showcase", "show", "https://technextmarketing.github.io/jrtech-marketing-showcase/"),
    ("showcase-saymara-tre-romania", "Saymara × TRE România", "Marketing showcase", "show", "https://technextmarketing.github.io/saymara-marketing-showcase/"),
    ("showcase-tre-bali", "TRE Conference, Bali", "Event marketing showcase", "show", "https://technextmarketing.github.io/tre-bali-marketing-showcase/"),
    ("showcase-convotherm", "Convotherm maxx", "Marketing showcase", "show", "https://technextmarketing.github.io/convotherm-marketing-showcase/"),
    ("proposal-casa-escondida", "Casa Escondida on Odoo", "Odoo proposal", "prop", "https://technextmarketing.github.io/casa-escondida-sales-proposal/"),
    ("proposal-auntie-gaik", "Auntie Gaik Lean on Odoo", "Odoo proposal", "prop", "https://technextmarketing.github.io/auntie-gaik-sales-proposal/"),
    ("proposal-jrtech", "JR-Tech on Odoo", "Odoo proposal", "prop", "https://technextmarketing.github.io/jrtech-sales-proposal/JR-Tech/"),
    ("proposal-convotherm", "Convotherm service ops", "Odoo proposal", "prop", "https://technextmarketing.github.io/convotherm-sales-proposal/hvac-services.html"),
]
