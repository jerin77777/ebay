import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# 1. Load environment variables from the client's .env file
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../client/.env"))
if not os.path.exists(env_path):
    print(f"Error: .env file not found at {env_path}")
    sys.exit(1)

load_dotenv(dotenv_path=env_path)

supabase_url = os.getenv("VITE_SUPABASE_URL")
# Use service role key if available, otherwise fallback to anon key
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    print("Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env file.")
    sys.exit(1)

print(f"Connecting to Supabase at: {supabase_url}")
supabase: Client = create_client(supabase_url, supabase_key)

# 2. Define Category Data
CATEGORIES = [
    "Special Discount",
    "Electronics (Refurbished)",
    "Vintage Fashion",
    "Books & Media",
    "Home & Furniture",
    "Sports & Outdoors",
    "Video Games & Consoles"
]

# 3. Define Products Data (Matching client/src/data/products.ts)
PRODUCTS = [
    {
        "id": 1,
        "name": "Classic Distressed Brown Leather Bomber Jacket",
        "price": 3499,
        "original_price": 8999,
        "rating": 4.8,
        "review_count": 34,
        "category": "Vintage Fashion",
        "image": "/vintage_jacket.png",
        "in_stock": True,
        "sales_tag": "Vintage (Excellent)",
        "condition_text": "Excellent vintage condition. Genuine heavy cowhide leather. No tears, zippers work perfectly. Light natural patina.",
        "description": "A timeless 90s distressed brown leather bomber jacket featuring a rugged zip front, classic ribbed cuffs, and hem. Extremely durable, comfortable, and stylish.",
        "features": [
            "100% Genuine Cowhide Leather",
            "Thick quilted interior lining for warmth",
            "Heavy-duty YKK brass zippers",
            "Two deep exterior pockets & one interior chest pocket",
            "Ribbed collar, cuffs, and waist hem"
        ],
        "specifications": {
            "Brand": "Schott NYC (Vintage)",
            "Size": "L (Fits Chest 42-44\")",
            "Material": "100% Genuine Leather",
            "Era": "Late 1990s",
            "Weight": "1.8 kg",
            "Condition": "9/10 (Excellent Vintage)"
        },
        "reviews": [
            { "id": 1, "username": "Arjun M.", "rating": 5, "date": "2026-05-12", "comment": "Amazing fit! The leather feels extremely premium and heavy. Worth every rupee." },
            { "id": 2, "username": "Siddharth K.", "rating": 4.5, "date": "2026-05-28", "comment": "Beautiful patina. Exactly as described. Zipper is a bit stiff but works fine." }
        ]
    },
    {
        "id": 2,
        "name": "Refurbished Apple MacBook Pro 13-inch (M1, 2020)",
        "price": 49999,
        "original_price": 122900,
        "rating": 4.6,
        "review_count": 56,
        "category": "Electronics (Refurbished)",
        "image": "/refurbished_laptop.png",
        "in_stock": True,
        "sales_tag": "Refurbished (Like New)",
        "condition_text": "Like New condition. 100% functional. Battery health is at 92% (145 charge cycles). Zero visible scratches on screen.",
        "description": "Get the power of the Apple M1 chip at a fraction of the cost. Features 8GB RAM, 256GB SSD, and a bright Retina display. Perfect for coding, design, and daily work.",
        "features": [
            "Apple M1 chip with 8-core CPU and 8-core GPU",
            "8GB unified memory, 256GB ultra-fast SSD",
            "13.3-inch Retina display with True Tone technology",
            "Up to 15 hours of battery life",
            "Includes original Apple charger and generic white box"
        ],
        "specifications": {
            "Brand": "Apple",
            "Model": "MacBook Pro 13\" (MYD82HN/A)",
            "Processor": "Apple M1 Chip",
            "RAM": "8 GB Unified",
            "Storage": "256 GB SSD",
            "Battery Health": "92% (Good)",
            "Condition": "9.5/10 (Refurbished Like New)"
        },
        "reviews": [
            { "id": 1, "username": "Neha S.", "rating": 5, "date": "2026-06-01", "comment": "Honestly looks brand new! Not a single scratch. Screen is gorgeous and keyboard is tactile." },
            { "id": 2, "username": "Rohan D.", "rating": 4, "date": "2026-05-15", "comment": "Works flawlessly. Docked 1 star because it came in a plain white cardboard box instead of Apple packaging, but the charger is original." }
        ]
    },
    {
        "id": 3,
        "name": "Vintage 16-Bit Super Nintendo Entertainment System (SNES)",
        "price": 5499,
        "original_price": 12000,
        "rating": 4.9,
        "review_count": 21,
        "category": "Video Games & Consoles",
        "image": "/retro_console.png",
        "in_stock": True,
        "sales_tag": "Collectible (Good)",
        "condition_text": "Good condition. Console has minor yellowing common with aged ABS plastic. Tested and works perfectly. Comes with all cables and 1 original controller.",
        "description": "Relive the golden era of 16-bit gaming with this original Super Nintendo console. Includes Super Mario World cartridge to get you started immediately.",
        "features": [
            "Original SNES North American Model",
            "Includes 1 original wired controller",
            "Comes with AV cables and AC power adapter",
            "Bonus: Super Mario World game cartridge included",
            "Fully cleaned internally and contacts polished"
        ],
        "specifications": {
            "Brand": "Nintendo",
            "Release Year": "1991",
            "Output": "AV Composite / RF",
            "Format": "NTSC",
            "Included Games": "Super Mario World",
            "Condition": "8/10 (Tested & Working)"
        },
        "reviews": [
            { "id": 1, "username": "Gamer90s", "rating": 5, "date": "2026-04-10", "comment": "Total nostalgia trip! Plugged it in and it fired up immediately. Controller buttons are responsive." },
            { "id": 2, "username": "Preeti R.", "rating": 4.8, "date": "2026-05-02", "comment": "Slight yellowing as expected for a console this age, but the mechanics are perfect." }
        ]
    },
    {
        "id": 4,
        "name": "Canon AE-1 Program 35mm SLR Film Camera",
        "price": 11999,
        "original_price": 24000,
        "rating": 4.7,
        "review_count": 42,
        "category": "Special Discount",
        "image": "/vintage_camera.png",
        "in_stock": True,
        "sales_tag": "Special Deal (Excellent)",
        "condition_text": "Excellent working condition. Shutter speeds are accurate, light meter is fully functional, view finder is clear. Light seals replaced recently.",
        "description": "The legendary Canon AE-1 Program SLR camera paired with a classic Canon FD 50mm f/1.8 prime lens. One of the most popular and reliable film cameras ever made.",
        "features": [
            "Classic manual/program SLR film camera",
            "FD 50mm f/1.8 sharp prime lens included",
            "Functioning built-in light meter (requires 4LR44 battery)",
            "Includes vintage neck strap and front lens cap",
            "Clean battery compartment with zero corrosion"
        ],
        "specifications": {
            "Brand": "Canon",
            "Lens Mount": "Canon FD",
            "Film Type": "35mm Film",
            "Shutter Speed": "1/1000s to 1s & Bulb",
            "Battery Type": "4LR44 6V (Not included)",
            "Condition": "9/10 (Fully Serviced)"
        },
        "reviews": [
            { "id": 1, "username": "Vikram G.", "rating": 5, "date": "2026-05-20", "comment": "Absolutely gorgeous camera! Took it out for a roll of Kodak Gold 200, results are stunning." },
            { "id": 2, "username": "Anjali P.", "rating": 4.5, "date": "2026-06-05", "comment": "Finder is clean, lens has no mold or haze. Highly recommend this seller for vintage gear." }
        ]
    },
    {
        "id": 5,
        "name": "Yamaha FG800 Acoustic Wooden Guitar",
        "price": 7999,
        "original_price": 15490,
        "rating": 4.5,
        "review_count": 18,
        "category": "Sports & Outdoors",
        "image": "/acoustic_guitar.png",
        "in_stock": True,
        "sales_tag": "Pre-owned (Good)",
        "condition_text": "Good condition. Minimal fret wear. Small ding on the lower bout (cosmetic only, does not affect sound). Setup with low action for easy playability.",
        "description": "A fantastic entry-to-intermediate level acoustic guitar with a solid Sitka spruce top. Known for its rich tone, robust projection, and outstanding playability.",
        "features": [
            "Solid Sitka Spruce top for excellent resonance",
            "Nato/Okume back & sides, Rosewood fretboard",
            "Traditional western body shape with gloss finish",
            "Freshly re-strung with D'Addario EJ16 light strings",
            "Comes with a padded gig bag"
        ],
        "specifications": {
            "Brand": "Yamaha",
            "Model": "FG800",
            "Top Wood": "Solid Sitka Spruce",
            "Fretboard": "Rosewood",
            "Strings": "6 (Steel)",
            "Condition": "8.5/10 (Excellent Action)"
        },
        "reviews": [
            { "id": 1, "username": "Kabir S.", "rating": 4, "date": "2026-05-09", "comment": "Sounds beautiful and rings out long. The action was adjusted perfectly for a beginner." },
            { "id": 2, "username": "Dev J.", "rating": 5, "date": "2026-05-30", "comment": "Incredible value. Solid top guitar at this price is a steal, even with a minor scratch." }
        ]
    },
    {
        "id": 6,
        "name": "Refurbished iPad Air (4th Generation, 64GB) Wi-Fi",
        "price": 26999,
        "original_price": 54900,
        "rating": 4.5,
        "review_count": 15,
        "category": "Electronics (Refurbished)",
        "image": "/refurbished_laptop.png",
        "in_stock": True,
        "sales_tag": "Refurbished (Excellent)",
        "condition_text": "Excellent condition. Back panel has a tiny pinhole dent near the logo. Screen has a tempered glass protector pre-applied. Includes charger.",
        "description": "10.9-inch Liquid Retina display with True Tone. Powered by the A14 Bionic chip, supporting Apple Pencil 2 and Magic Keyboard. Ideal for students and creators.",
        "features": [
            "10.9-inch Liquid Retina display",
            "A14 Bionic chip with Neural Engine",
            "Touch ID integrated into the top button",
            "USB-C port for fast charging and accessories",
            "Supports iPadOS 17+"
        ],
        "specifications": {
            "Brand": "Apple",
            "Model": "iPad Air (4th Gen)",
            "Storage": "64 GB",
            "Color": "Space Grey",
            "Battery Health": "89%",
            "Condition": "8.8/10 (Minor wear)"
        },
        "reviews": [
            { "id": 1, "username": "Ritika B.", "rating": 5, "date": "2026-05-18", "comment": "Perfect for taking notes in college. Saved so much money buying refurbished!" }
        ]
    },
    {
        "id": 7,
        "name": "Pre-Owned Levi's 501 Original Fit Jeans (Size 32)",
        "price": 1299,
        "original_price": 4599,
        "rating": 4.4,
        "review_count": 28,
        "category": "Vintage Fashion",
        "image": "/vintage_jacket.png",
        "in_stock": True,
        "sales_tag": "Pre-owned (Good)",
        "condition_text": "Good condition. Nicely broken-in denim with natural fading at knees and pockets. No rips or stains.",
        "description": "The blueprint for every pair of jeans in existence. Features the iconic straight fit and signature button fly. Genuine heavy-weight non-stretch cotton denim.",
        "features": [
            "Original 501 Straight Fit",
            "100% Cotton Heavy Denim",
            "Signature button fly design",
            "Authentic Levi's leather patch on back waist",
            "Vintage indigo wash finish"
        ],
        "specifications": {
            "Brand": "Levi's",
            "Model": "501 Original",
            "Size": "Waist 32 / Length 30",
            "Color": "Indigo Faded Blue",
            "Material": "100% Cotton",
            "Condition": "8/10 (Natural Fading)"
        },
        "reviews": [
            { "id": 1, "username": "Pranav T.", "rating": 4, "date": "2026-06-02", "comment": "Love the authentic fade. You can't get this texture from new jeans." }
        ]
    },
    {
        "id": 8,
        "name": "Vintage Sony PlayStation 2 Console (Slim Model)",
        "price": 3999,
        "original_price": 9999,
        "rating": 4.8,
        "review_count": 37,
        "category": "Video Games & Consoles",
        "image": "/retro_console.png",
        "in_stock": True,
        "sales_tag": "Collectible (Good)",
        "condition_text": "Good condition. Laser lens cleaned and calibrated. Plays both CD and DVD games perfectly. Includes 1 DualShock 2 controller and memory card.",
        "description": "Own the best-selling video game console of all time. This PS2 Slim features a space-saving design and built-in Ethernet port. Includes an 8MB memory card.",
        "features": [
            "PS2 Slim Console (SCPH-70000 series)",
            "1 original DualShock 2 wired controller",
            "Includes power supply and AV cables",
            "8MB Memory Card with FreeMCBoot pre-installed",
            "Quiet operation and tested DVD laser"
        ],
        "specifications": {
            "Brand": "Sony",
            "Release Year": "2004",
            "Media Type": "DVD-ROM / CD-ROM",
            "Included Accessories": "Controller, Memory Card, Cables",
            "Voltage": "220V Input (Indian plug)",
            "Condition": "8.5/10 (Tested)"
        },
        "reviews": [
            { "id": 1, "username": "GamerX", "rating": 5, "date": "2026-04-20", "comment": "Brings back so many memories. Loaded up GTA San Andreas and it booted instantly." }
        ]
    },
    {
        "id": 9,
        "name": "Mid-Century Modern Wooden Desk Organizer",
        "price": 999,
        "original_price": 2499,
        "rating": 4.3,
        "review_count": 11,
        "category": "Home & Furniture",
        "image": "/vintage_camera.png",
        "in_stock": True,
        "sales_tag": "Second-hand (Excellent)",
        "condition_text": "Excellent condition. Crafted from solid teak wood. Polish is intact. Felt pads on the bottom to protect your desk surface.",
        "description": "A gorgeous retro organizer featuring 3 letters slots, a drawer for stationeries, and a dedicated pen-stand slot. Adds a warm vintage character to any modern workstation.",
        "features": [
            "Handcrafted from solid Teak Wood",
            "Smooth slide-out drawer with brass knob",
            "Three vertical envelope/document slots",
            "Compact footprint: 12\" x 6\" x 8\"",
            "Durable satin varnish finish"
        ],
        "specifications": {
            "Brand": "Handmade/Unbranded",
            "Material": "Solid Teak Wood & Brass",
            "Era": "Circa 1980s style",
            "Dimensions": "12 x 6 x 8 inches",
            "Weight": "1.2 kg",
            "Condition": "9/10 (Clean Polish)"
        },
        "reviews": [
            { "id": 1, "username": "Tina R.", "rating": 4, "date": "2026-05-10", "comment": "Really nice weight and texture. Holds my iPad, notebooks, and letters perfectly." }
        ]
    },
    {
        "id": 10,
        "name": "Pre-Owned Kindle Paperwhite (10th Gen, 8GB) with Backlight",
        "price": 5499,
        "original_price": 12999,
        "rating": 4.7,
        "review_count": 19,
        "category": "Books & Media",
        "image": "/refurbished_laptop.png",
        "in_stock": True,
        "sales_tag": "Pre-owned (Very Good)",
        "condition_text": "Very Good condition. Barely noticeable scratches on the back casing. Screen is 100% scratch-free. Battery life lasts up to 4 weeks.",
        "description": "The thin, light, and waterproof Kindle Paperwhite features a 300 ppi glare-free display. Read like real paper even in bright sunlight, with built-in adjustable light.",
        "features": [
            "6-inch 300 ppi glare-free e-ink screen",
            "IPX8 waterproof rating for beach reading",
            "Built-in adjustable reading light for night use",
            "8GB storage holding thousands of books",
            "Supports Audible via Bluetooth headphones"
        ],
        "specifications": {
            "Brand": "Amazon",
            "Generation": "10th Generation (2018)",
            "Storage": "8 GB",
            "Connectivity": "Wi-Fi",
            "Waterproofing": "IPX8 (Up to 2 meters for 60 mins)",
            "Condition": "8.8/10 (Clean casing)"
        },
        "reviews": [
            { "id": 1, "username": "Vikram P.", "rating": 5, "date": "2026-05-24", "comment": "Battery lasts forever! E-ink screen is so easy on the eyes. High quality." }
        ]
    },
    {
        "id": 11,
        "name": "Vintage Olympus Trip 35 Compact Film Camera",
        "price": 6499,
        "original_price": 14000,
        "rating": 4.6,
        "review_count": 14,
        "category": "Vintage Fashion",
        "image": "/vintage_camera.png",
        "in_stock": False,
        "sales_tag": "Sold Out",
        "condition_text": "Good condition. Red flag pop-up exposure indicator works. Lens is clean. Selenium solar cell is responsive. SOLD OUT.",
        "description": "The legendary point-and-shoot camera from the 1970s. Uses solar power via the selenium light sensor ring around the lens, requiring no batteries at all!",
        "features": [
            "Fully automatic exposure control",
            "Sharp Zuiko 40mm f/2.8 lens",
            "No battery required (Solar powered light meter)",
            "Compact metal body, fits in coat pocket",
            "Simple zone focusing system"
        ],
        "specifications": {
            "Brand": "Olympus",
            "Release Era": "1970s",
            "Lens": "Zuiko 40mm f/2.8 (4 elements)",
            "Focusing": "Zone focus (4 settings)",
            "Battery": "None required (Selenium light meter)",
            "Condition": "8.5/10 (Tested)"
        },
        "reviews": [
            { "id": 1, "username": "Shreya T.", "rating": 5, "date": "2026-03-15", "comment": "Works wonderfully. The red flag mechanism works properly, preventing under-exposures." }
        ]
    },
    {
        "id": 12,
        "name": "Refurbished Bose QuietComfort 35 II Wireless Headphones",
        "price": 10499,
        "original_price": 29900,
        "rating": 4.5,
        "review_count": 31,
        "category": "Electronics (Refurbished)",
        "image": "/refurbished_laptop.png",
        "in_stock": True,
        "sales_tag": "Special Deal (Good)",
        "condition_text": "Good condition. Brand new replacement ear pads and headband cushion installed. Minor rubbing marks on outer cups. Excellent battery.",
        "description": "Industry-leading active noise cancellation. Balanced audio performance at any volume. Up to 20 hours of wireless listening per charge. Alexa and Google Assistant built-in.",
        "features": [
            "Three levels of world-class noise cancellation",
            "Hassle-free Bluetooth and NFC pairing",
            "Volume-optimized EQ for balanced sound",
            "Dual-microphone system for clear voice pickup",
            "Audio cable included for wired listening"
        ],
        "specifications": {
            "Brand": "Bose",
            "Model": "QuietComfort 35 II",
            "Type": "Over-Ear Wireless",
            "Battery Life": "Up to 20 hours",
            "Weight": "235 grams",
            "Condition": "8.2/10 (New Ear Pads)"
        },
        "reviews": [
            { "id": 1, "username": "Rahul V.", "rating": 4.5, "date": "2026-05-11", "comment": "Noise cancellation is wizardry. The new pads look and feel brand new." }
        ]
    }
]

# 4. Seed Categories
print("Seeding categories...")
categories_data = [{"name": cat} for cat in CATEGORIES]
try:
    cat_response = supabase.table("categories").upsert(categories_data, on_conflict="name").execute()
    print(f"Successfully seeded {len(cat_response.data)} categories.")
except Exception as e:
    print(f"Error seeding categories: {e}")
    print("Ensure you have created the tables in Supabase using the schema.sql instructions.")
    sys.exit(1)

# 5. Seed Products
print("Seeding products...")
try:
    prod_response = supabase.table("products").upsert(PRODUCTS, on_conflict="id").execute()
    print(f"Successfully seeded {len(prod_response.data)} products.")
except Exception as e:
    print(f"Error seeding products: {e}")
    sys.exit(1)

# 6. Seed Users
print("Seeding users...")
USERS = [
    {
        "email": "admin@valuebay.co.in",
        "password": "admin",
        "role": "admin"
    },
    {
        "email": "testuser@example.com",
        "password": "password123",
        "role": "customer"
    }
]
try:
    user_response = supabase.table("users").upsert(USERS, on_conflict="email").execute()
    print(f"Successfully seeded {len(user_response.data)} users.")
except Exception as e:
    print(f"Error seeding users: {e}")
    sys.exit(1)

print("\nDatabase seeding completed successfully!")

