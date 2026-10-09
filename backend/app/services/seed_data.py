import datetime
import json
from sqlalchemy.orm import Session
from app.models.models import User, LostItem, WitnessReport, FoundItem, Route, AIMatch, Evidence, Notification
from app.auth.security import get_password_hash
from app.ai.matching_engine import AIMatchingEngine

def seed_database(db: Session):
    # Check if database is already populated
    if db.query(User).filter(User.email == "passenger@lostlink.demo").first():
        print("Database already seeded with demo data.")
        return

    print("Seeding LostLink database with rich realistic data...")

    # 1. Create Users
    hashed_pwd = get_password_hash("LostLink123")
    
    passenger = User(
        name="Arjun Sharma",
        email="passenger@lostlink.demo",
        password_hash=hashed_pwd,
        role="PASSENGER",
        phone="+91 98765 43210"
    )
    witness = User(
        name="Priya Ramanathan",
        email="witness@lostlink.demo",
        password_hash=hashed_pwd,
        role="WITNESS",
        phone="+91 98765 12345"
    )
    staff = User(
        name="Officer Rajesh Kumar",
        email="staff@lostlink.demo",
        password_hash=hashed_pwd,
        role="STAFF",
        phone="+91 98765 67890"
    )

    db.add_all([passenger, witness, staff])
    db.commit()
    db.refresh(passenger)
    db.refresh(witness)
    db.refresh(staff)

    # 2. Create Routes
    routes = [
        Route(
            route_name="Coimbatore - Chennai Superfast Express",
            transport_type="Train",
            vehicle_number="Train 12675 (Kovai Express)",
            stops_json=json.dumps([
                {"name": "Coimbatore Jn", "lat": 11.0016, "lng": 76.9629, "time": "15:05"},
                {"name": "Tiruppur", "lat": 11.1085, "lng": 77.3411, "time": "15:48"},
                {"name": "Erode Jn", "lat": 11.3410, "lng": 77.7172, "time": "16:40"},
                {"name": "Salem Jn", "lat": 11.6643, "lng": 78.1460, "time": "17:35"},
                {"name": "Jolarpettai", "lat": 12.5590, "lng": 78.5772, "time": "19:15"},
                {"name": "Katpadi Jn", "lat": 12.9698, "lng": 79.1367, "time": "20:20"},
                {"name": "Chennai Central", "lat": 13.0827, "lng": 80.2707, "time": "22:50"}
            ])
        ),
        Route(
            route_name="Bengaluru Namma Metro Purple Line",
            transport_type="Metro",
            vehicle_number="Metro R-44",
            stops_json=json.dumps([
                {"name": "Whitefield", "lat": 12.9698, "lng": 77.7499, "time": "08:30"},
                {"name": "Indiranagar", "lat": 12.9784, "lng": 77.6408, "time": "09:00"},
                {"name": "MG Road", "lat": 12.9756, "lng": 77.6066, "time": "09:12"},
                {"name": "Majestic (KSR)", "lat": 12.9781, "lng": 77.5695, "time": "09:25"}
            ])
        ),
        Route(
            route_name="Mumbai Western Line AC Local",
            transport_type="Train",
            vehicle_number="AC EMU 9021",
            stops_json=json.dumps([
                {"name": "Churchgate", "lat": 18.9322, "lng": 72.8264, "time": "17:15"},
                {"name": "Dadar", "lat": 19.0178, "lng": 72.8478, "time": "17:32"},
                {"name": "Bandra", "lat": 19.0596, "lng": 72.8437, "time": "17:45"},
                {"name": "Andheri", "lat": 19.1197, "lng": 72.8464, "time": "18:02"},
                {"name": "Borivali", "lat": 19.2288, "lng": 72.8541, "time": "18:25"}
            ])
        )
    ]
    db.add_all(routes)
    db.commit()

    now = datetime.datetime.utcnow()
    t_minus = lambda hours: now - datetime.timedelta(hours=hours)

    # 3. Create Lost Items (10 Items)
    lost_items = [
        # Flagship Item: Coimbatore to Erode Black Backpack
        LostItem(
            user_id=passenger.id,
            title="Black Wildcraft Travel Backpack",
            description="Black waterproof Wildcraft backpack containing a 14-inch laptop sleeve, college notebook, scientific calculator and a silver water bottle in the side mesh.",
            category="Bags",
            brand="Wildcraft",
            color="Black",
            unique_features="Reflective gray zipper pulls and a small red carabiner clipped to the right shoulder strap.",
            image_path="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
            date_time=t_minus(4.0),
            latitude=11.0016,
            longitude=76.9629,
            location_name="Coimbatore Junction",
            transport_type="Train",
            vehicle_number="Train 12675 (Kovai Express)",
            coach_number="Coach S3 (Seat 42)",
            status="VERIFICATION_REQUIRED"
        ),
        LostItem(
            user_id=passenger.id,
            title="Dell XPS 13 Laptop (Silver)",
            description="Silver Dell XPS 13 inch laptop with black keyboard. Has a carbon fiber palm rest and a small GitHub Octocat sticker on the back cover.",
            category="Electronics",
            brand="Dell",
            color="Silver",
            unique_features="GitHub sticker on top lid, tiny scratch near USB-C port.",
            image_path="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80",
            date_time=t_minus(8.0),
            latitude=12.9781,
            longitude=77.5695,
            location_name="Majestic Metro Station",
            transport_type="Metro",
            vehicle_number="Metro R-44",
            coach_number="Coach 2",
            status="MATCH_FOUND"
        ),
        LostItem(
            user_id=passenger.id,
            title="Brown Leather Bifold Wallet",
            description="Genuine brown leather Tommy Hilfiger wallet containing college ID card, driving license and metro smart card.",
            category="Wallets",
            brand="Tommy Hilfiger",
            color="Brown",
            unique_features="Embossed TH metal logo on the bottom right corner.",
            image_path="https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80",
            date_time=t_minus(14.0),
            latitude=19.0178,
            longitude=72.8478,
            location_name="Dadar Western Railway Platform 3",
            transport_type="Train",
            vehicle_number="AC EMU 9021",
            coach_number="Coach 1 (First Class)",
            status="ANALYZING"
        ),
        LostItem(
            user_id=passenger.id,
            title="Sony WH-1000XM4 Noise Cancelling Headphones",
            description="Midnight blue over-ear headphones in their original hard zipper case with audio cable and airplane adapter.",
            category="Electronics",
            brand="Sony",
            color="Midnight Blue",
            unique_features="Custom white silicone protective ring around the left ear cup.",
            image_path="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
            date_time=t_minus(20.0),
            latitude=13.0827,
            longitude=80.2707,
            location_name="Chennai Central Railway Station",
            transport_type="Train",
            vehicle_number="Train 12675 (Kovai Express)",
            coach_number="Coach B1 (AC 3-Tier)",
            status="MATCH_FOUND"
        ),
        LostItem(
            user_id=passenger.id,
            title="Samsonite 24-inch Navy Blue Suitcase",
            description="Hard-shell 4-wheel navy blue trolley bag with TSA combination lock and yellow luggage tag.",
            category="Bags",
            brand="Samsonite",
            color="Navy Blue",
            unique_features="Yellow airport tag with initial 'A.S.' written in black marker.",
            image_path="https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&auto=format&fit=crop&q=80",
            date_time=t_minus(28.0),
            latitude=12.9698,
            longitude=79.1367,
            location_name="Katpadi Junction",
            transport_type="Train",
            vehicle_number="Train 12675",
            coach_number="Coach A1",
            status="RECOVERED"
        ),
        LostItem(
            user_id=passenger.id,
            title="Ray-Ban Wayfarer Sunglasses (Matte Black)",
            description="Classic matte black Ray-Ban sunglasses in black leather case with cleaning cloth.",
            category="Accessories",
            brand="Ray-Ban",
            color="Black",
            unique_features="Polarized G-15 dark green lenses with subtle P etching.",
            image_path="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
            date_time=t_minus(32.0),
            latitude=12.9756,
            longitude=77.6066,
            location_name="MG Road Metro Station Concourse",
            transport_type="Metro",
            vehicle_number="Metro R-44",
            coach_number="Coach 3",
            status="NEW"
        ),
        LostItem(
            user_id=passenger.id,
            title="Apple iPhone 15 Pro (Natural Titanium)",
            description="Natural titanium iPhone 15 Pro with a clear MagSafe case and a mountain wallpaper lock screen.",
            category="Electronics",
            brand="Apple",
            color="Natural Titanium",
            unique_features="Small hairline crack on screen protector top right corner.",
            image_path="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80",
            date_time=t_minus(36.0),
            latitude=19.1197,
            longitude=72.8464,
            location_name="Andheri Railway Station",
            transport_type="Train",
            vehicle_number="AC EMU 9021",
            coach_number="Coach 4",
            status="VERIFIED"
        ),
        LostItem(
            user_id=passenger.id,
            title="University Degree & Marksheets Document Folder",
            description="Navy blue faux-leather certificate folder holding Engineering degree, transcripts and Aadhaar photocopy.",
            category="Documents",
            brand="Generic",
            color="Navy Blue",
            unique_features="Golden embossed university seal on front cover.",
            image_path="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80",
            date_time=t_minus(42.0),
            latitude=11.6643,
            longitude=78.1460,
            location_name="Salem Junction Ticket Counter",
            transport_type="Train",
            vehicle_number="Train 12675",
            coach_number="General",
            status="ANALYZING"
        ),
        LostItem(
            user_id=passenger.id,
            title="Nike Heritage Gym Duffle Bag",
            description="Red and white Nike sports duffle bag with running shoes, gym gloves and resistance bands.",
            category="Bags",
            brand="Nike",
            color="Red",
            unique_features="Large white Nike swoosh across the front side panel.",
            image_path="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
            date_time=t_minus(50.0),
            latitude=12.9784,
            longitude=77.6408,
            location_name="Indiranagar Metro Station",
            transport_type="Metro",
            vehicle_number="Metro R-44",
            coach_number="Coach 1",
            status="NEW"
        ),
        LostItem(
            user_id=passenger.id,
            title="Casio G-Shock Rugged Sports Watch",
            description="Matte black Casio G-Shock GA-2100 digital-analog watch with resin band.",
            category="Accessories",
            brand="Casio",
            color="Black",
            unique_features="Octagonal bezel, luminescent hour markers.",
            image_path="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
            date_time=t_minus(58.0),
            latitude=19.0596,
            longitude=72.8437,
            location_name="Bandra Local Station Overbridge",
            transport_type="Train",
            vehicle_number="AC EMU 9021",
            coach_number="Coach 3",
            status="CLOSED"
        )
    ]
    db.add_all(lost_items)
    db.commit()

    for item in lost_items:
        db.refresh(item)

    # 4. Create Witness Reports (10 Reports)
    flagship_lost = lost_items[0]

    witness_reports = [
        # Flagship Witness: Spotted on Train S3
        WitnessReport(
            user_id=witness.id,
            description="Spotted an unattended black Wildcraft backpack on the overhead luggage rack near berth 42 as the train was departing Tiruppur. Looked securely placed.",
            date_time=t_minus(3.75),
            latitude=11.1085,
            longitude=77.3411,
            location_name="Tiruppur Railway Station (Train Corridor)",
            transport_type="Train",
            vehicle_number="Train 12675 (Kovai Express)",
            coach_number="Coach S3 (Near Berth 42)",
            notes="Passenger who sat there appeared to have gotten down or moved towards pantry car.",
            linked_lost_item_id=flagship_lost.id,
            confidence_hint=93.0,
            image_path="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80"
        ),
        WitnessReport(
            user_id=witness.id,
            description="Saw a silver Dell laptop left on the seat corner near the train door at Indiranagar metro station.",
            date_time=t_minus(7.7),
            latitude=12.9784,
            longitude=77.6408,
            location_name="Indiranagar Metro Station",
            transport_type="Metro",
            vehicle_number="Metro R-44",
            coach_number="Coach 2",
            notes="A co-passenger alerted the security guard on the platform.",
            linked_lost_item_id=lost_items[1].id,
            confidence_hint=89.0,
            image_path="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80"
        ),
        WitnessReport(
            user_id=witness.id,
            description="Saw someone drop a brown leather wallet while rushing to board the train at Dadar platform.",
            date_time=t_minus(13.8),
            latitude=19.0178,
            longitude=72.8478,
            location_name="Dadar Station Platform 3",
            transport_type="Train",
            vehicle_number="AC EMU 9021",
            coach_number="Coach 1",
            notes="Picked up and handed to Railway Police Force (RPF) booth.",
            linked_lost_item_id=lost_items[2].id,
            confidence_hint=85.0,
            image_path="https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80"
        ),
        WitnessReport(
            user_id=witness.id,
            description="Noticed a blue Sony headphone case on the folding tray in coach B1 after passengers disembarked.",
            date_time=t_minus(19.6),
            latitude=13.0827,
            longitude=80.2707,
            location_name="Chennai Central Carriage Shed",
            transport_type="Train",
            vehicle_number="Train 12675 (Kovai Express)",
            coach_number="Coach B1",
            notes="Cleaning crew member marked it for lost and found custody.",
            linked_lost_item_id=lost_items[3].id,
            confidence_hint=91.0,
            image_path="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
        ),
        WitnessReport(
            user_id=witness.id,
            description="Observed a navy blue Samsonite trolley standing near the Katpadi station waiting hall bench.",
            date_time=t_minus(27.5),
            latitude=12.9698,
            longitude=79.1367,
            location_name="Katpadi Junction Waiting Room",
            transport_type="Train",
            vehicle_number="Train 12675",
            coach_number="A1",
            notes="Station porters wheeled it to the luggage inspection counter.",
            linked_lost_item_id=lost_items[4].id,
            confidence_hint=94.0,
            image_path="https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&auto=format&fit=crop&q=80"
        ),
        WitnessReport(
            user_id=witness.id,
            description="Black sunglasses left on the ticketing kiosk ledge at MG Road.",
            date_time=t_minus(31.5),
            latitude=12.9756,
            longitude=77.6066,
            location_name="MG Road Metro Ticketing Counter",
            transport_type="Metro",
            vehicle_number="Metro R-44",
            coach_number="Station Floor",
            notes="Station customer service executive collected it.",
            linked_lost_item_id=lost_items[5].id,
            confidence_hint=78.0,
            image_path="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80"
        ),
        WitnessReport(
            user_id=witness.id,
            description="Titanium iPhone found near the ticket barrier scanner at Andheri.",
            date_time=t_minus(35.5),
            latitude=19.1197,
            longitude=72.8464,
            location_name="Andheri Railway Station Gate 4",
            transport_type="Train",
            vehicle_number="AC EMU 9021",
            coach_number="Concourse",
            notes="Given directly to the Station Superintendent.",
            linked_lost_item_id=lost_items[6].id,
            confidence_hint=95.0,
            image_path="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80"
        ),
        WitnessReport(
            user_id=witness.id,
            description="Blue document folder found on bench at Salem platform 1.",
            date_time=t_minus(41.5),
            latitude=11.6643,
            longitude=78.1460,
            location_name="Salem Junction Platform 1",
            transport_type="Train",
            vehicle_number="Train 12675",
            coach_number="Platform 1",
            notes="Safe custody in RPF room.",
            linked_lost_item_id=lost_items[7].id,
            confidence_hint=86.0,
            image_path="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80"
        ),
        WitnessReport(
            user_id=witness.id,
            description="Red Nike bag noticed in metro overhead rack.",
            date_time=t_minus(49.5),
            latitude=12.9784,
            longitude=77.6408,
            location_name="Indiranagar Metro Carriage",
            transport_type="Metro",
            vehicle_number="Metro R-44",
            coach_number="Coach 1",
            notes="Reported to helpline.",
            linked_lost_item_id=lost_items[8].id,
            confidence_hint=80.0,
            image_path="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80"
        ),
        WitnessReport(
            user_id=witness.id,
            description="Black G-Shock watch found near foot overbridge railing.",
            date_time=t_minus(57.5),
            latitude=19.0596,
            longitude=72.8437,
            location_name="Bandra Local Station Overbridge",
            transport_type="Train",
            vehicle_number="AC EMU 9021",
            coach_number="FOB West",
            notes="Logged in register.",
            linked_lost_item_id=lost_items[9].id,
            confidence_hint=90.0,
            image_path="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
        )
    ]
    db.add_all(witness_reports)
    db.commit()

    # 5. Create Found Items (10 Items)
    found_items = [
        # Flagship Found Item: Erode Junction
        FoundItem(
            staff_id=staff.id,
            title="Black Wildcraft Backpack (Laptop Compartment)",
            description="Black waterproof Wildcraft backpack recovered by on-duty TTE from coach S3 of Train 12675. Contains stationery, 14-inch sleeve, and silver water bottle.",
            category="Bags",
            brand="Wildcraft",
            color="Black",
            image_path="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
            found_time=t_minus(3.0),
            latitude=11.3410,
            longitude=77.7172,
            location_name="Erode Junction Railway Station",
            transport_type="Train",
            vehicle_number="Train 12675 (Kovai Express)",
            coach_number="Coach S3 (Berth 42)",
            depot_station="Erode Junction RPF Lost & Found Custody Desk",
            status="IN_CUSTODY"
        ),
        FoundItem(
            staff_id=staff.id,
            title="Dell XPS 13 Silver Laptop",
            description="Silver ultra-thin Dell XPS laptop retrieved from Metro Coach 2 at Majestic terminal. Verified working screen, Octocat sticker present.",
            category="Electronics",
            brand="Dell",
            color="Silver",
            image_path="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80",
            found_time=t_minus(7.2),
            latitude=12.9781,
            longitude=77.5695,
            location_name="Majestic Metro Station Lost Property Office",
            transport_type="Metro",
            vehicle_number="Metro R-44",
            coach_number="Coach 2",
            depot_station="BMRCL Central Depot, Majestic",
            status="MATCHED"
        ),
        FoundItem(
            staff_id=staff.id,
            title="Men's Brown Leather Bifold Wallet",
            description="Brown Tommy Hilfiger leather wallet with cards and cash deposited by Dadar platform security team.",
            category="Wallets",
            brand="Tommy Hilfiger",
            color="Brown",
            image_path="https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80",
            found_time=t_minus(13.2),
            latitude=19.0178,
            longitude=72.8478,
            location_name="Dadar Station RPF Post",
            transport_type="Train",
            vehicle_number="AC EMU 9021",
            coach_number="Coach 1",
            depot_station="Western Railway Lost Property Cell, Dadar",
            status="IN_CUSTODY"
        ),
        FoundItem(
            staff_id=staff.id,
            title="Sony WH-1000XM4 Headset in Case",
            description="Midnight blue noise cancelling headphones with custom white rubber ring around ear cup. Case intact.",
            category="Electronics",
            brand="Sony",
            color="Midnight Blue",
            image_path="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
            found_time=t_minus(19.0),
            latitude=13.0827,
            longitude=80.2707,
            location_name="Chennai Central Station Master Office",
            transport_type="Train",
            vehicle_number="Train 12675 (Kovai Express)",
            coach_number="Coach B1",
            depot_station="Chennai Central Lost & Found Vault Room #12",
            status="MATCHED"
        ),
        FoundItem(
            staff_id=staff.id,
            title="Samsonite 24-inch Navy Trolley Luggage",
            description="Navy blue hard case trolley bag with yellow nametag 'A.S.'. Stored in Katpadi luggage room.",
            category="Bags",
            brand="Samsonite",
            color="Navy Blue",
            image_path="https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&auto=format&fit=crop&q=80",
            found_time=t_minus(26.5),
            latitude=12.9698,
            longitude=79.1367,
            location_name="Katpadi Junction Cloakroom",
            transport_type="Train",
            vehicle_number="Train 12675",
            coach_number="Coach A1",
            depot_station="Katpadi Junction Baggage Room",
            status="HANDED_OVER"
        ),
        FoundItem(
            staff_id=staff.id,
            title="Ray-Ban Matte Black Sunglasses",
            description="Polarized sunglasses in original black case handed over by station cleaner.",
            category="Accessories",
            brand="Ray-Ban",
            color="Black",
            image_path="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
            found_time=t_minus(31.0),
            latitude=12.9756,
            longitude=77.6066,
            location_name="MG Road Metro Security Post",
            transport_type="Metro",
            vehicle_number="Metro R-44",
            coach_number="Concourse",
            depot_station="MG Road Station Office",
            status="IN_CUSTODY"
        ),
        FoundItem(
            staff_id=staff.id,
            title="Apple iPhone 15 Pro Titanium",
            description="Natural titanium iPhone found at Andheri turnstile. Screen lock shows mountain wallpaper. Battery at 65%.",
            category="Electronics",
            brand="Apple",
            color="Natural Titanium",
            image_path="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80",
            found_time=t_minus(35.0),
            latitude=19.1197,
            longitude=72.8464,
            location_name="Andheri RPF Station Office",
            transport_type="Train",
            vehicle_number="AC EMU 9021",
            coach_number="Gate 4",
            depot_station="Andheri Western Railway Cell",
            status="MATCHED"
        ),
        FoundItem(
            staff_id=staff.id,
            title="Navy Blue Academic Certificate Folder",
            description="Faux leather certificate binder with university transcripts and documents.",
            category="Documents",
            brand="Generic",
            color="Navy Blue",
            image_path="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80",
            found_time=t_minus(41.0),
            latitude=11.6643,
            longitude=78.1460,
            location_name="Salem Junction Station Master Office",
            transport_type="Train",
            vehicle_number="Train 12675",
            coach_number="Platform 1",
            depot_station="Salem Division Lost Property Center",
            status="IN_CUSTODY"
        ),
        FoundItem(
            staff_id=staff.id,
            title="Nike Red Duffle Sports Bag",
            description="Red and white duffle bag with sportswear and shoes recovered from purple line rake.",
            category="Bags",
            brand="Nike",
            color="Red",
            image_path="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
            found_time=t_minus(49.0),
            latitude=12.9784,
            longitude=77.6408,
            location_name="Indiranagar Station Custody",
            transport_type="Metro",
            vehicle_number="Metro R-44",
            coach_number="Coach 1",
            depot_station="Indiranagar Operations Room",
            status="IN_CUSTODY"
        ),
        FoundItem(
            staff_id=staff.id,
            title="Casio G-Shock 2100 Series Watch",
            description="Black digital analog sports watch discovered on foot overbridge.",
            category="Accessories",
            brand="Casio",
            color="Black",
            image_path="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
            found_time=t_minus(57.0),
            latitude=19.0596,
            longitude=72.8437,
            location_name="Bandra Station Master Desk",
            transport_type="Train",
            vehicle_number="AC EMU 9021",
            coach_number="FOB",
            depot_station="Bandra Local Lost Property Cell",
            status="CLAIMED"
        )
    ]
    db.add_all(found_items)
    db.commit()

    for item in found_items:
        db.refresh(item)

    # 6. Create Evidence Chain for the Flagship Item (Coimbatore to Erode Journey)
    evidence_chain = [
        Evidence(
            lost_item_id=flagship_lost.id,
            evidence_type="LOST_REPORT",
            source_id=f"LST-{flagship_lost.id}",
            timestamp=t_minus(4.0),
            location="Coimbatore Junction (Platform 2)",
            latitude=11.0016,
            longitude=76.9629,
            description="Passenger Arjun Sharma boarded Train 12675 Kovai Express with black Wildcraft backpack at Coimbatore Junction. Placed in Coach S3 overhead rack.",
            confidence=100.0,
            image_url=flagship_lost.image_path,
            sequence_order=1
        ),
        Evidence(
            lost_item_id=flagship_lost.id,
            evidence_type="WITNESS_OBSERVATION",
            source_id="WIT-101",
            timestamp=t_minus(3.75),
            location="Tiruppur Corridor (Train 12675 S3)",
            latitude=11.1085,
            longitude=77.3411,
            description="Witness Priya Ramanathan observed unattended black Wildcraft backpack on Coach S3 overhead rack near berth 42 during transit towards Erode.",
            confidence=92.0,
            image_url=witness_reports[0].image_path,
            sequence_order=2
        ),
        Evidence(
            lost_item_id=flagship_lost.id,
            evidence_type="STAFF_OBSERVATION",
            source_id="STF-204",
            timestamp=t_minus(3.3),
            location="Tiruppur Intermediate Halt",
            latitude=11.1085,
            longitude=77.3411,
            description="Travelling Ticket Examiner (TTE) inspected Coach S3 at Tiruppur halt, logged the bag, and coordinated custody handoff upon arrival at Erode.",
            confidence=95.0,
            image_url=flagship_lost.image_path,
            sequence_order=3
        ),
        Evidence(
            lost_item_id=flagship_lost.id,
            evidence_type="FOUND_REPORT",
            source_id=f"FND-{found_items[0].id}",
            timestamp=t_minus(3.0),
            location="Erode Junction RPF Lost & Found Desk",
            latitude=11.3410,
            longitude=77.7172,
            description="Bag secured into official RPF custody at Erode Junction. Physical inspection matches Wildcraft backpack with 14-inch sleeve and water bottle.",
            confidence=96.0,
            image_url=found_items[0].image_path,
            sequence_order=4
        )
    ]
    db.add_all(evidence_chain)
    db.commit()

    # 7. Generate AI Matches with actual multi-factor calculation
    ai_matches = []
    # Match for Flagship Backpack
    flagship_match_data = AIMatchingEngine.compute_full_match(
        lost_item=flagship_lost,
        found_item=found_items[0],
        witness_reports=[witness_reports[0]]
    )
    # Ensure flagship match has high realistic scores
    m1 = AIMatch(
        lost_item_id=flagship_lost.id,
        found_item_id=found_items[0].id,
        image_score=93.5,
        text_score=88.0,
        time_score=96.0,
        location_score=94.0,
        route_score=100.0,
        witness_score=92.0,
        total_score=93.8,
        confidence_level="HIGH",
        explanation="High visual similarity detected (93.5%). The found item was recovered at Erode Junction along the Train 12675 Kovai Express corridor, matching the reported Coach S3. The timestamp falls in the 60-minute travel window, corroborated by a witness sighting at 6:25 PM and TTE staff observation at 6:50 PM.",
        match_breakdown_json=json.dumps(flagship_match_data["breakdown"])
    )
    ai_matches.append(m1)

    # Compute matches for remaining items
    for i in range(1, min(len(lost_items), len(found_items))):
        l_item = lost_items[i]
        f_item = found_items[i]
        w_list = [w for w in witness_reports if w.linked_lost_item_id == l_item.id]
        
        calc = AIMatchingEngine.compute_full_match(
            lost_item=l_item,
            found_item=f_item,
            witness_reports=w_list
        )
        m = AIMatch(
            lost_item_id=l_item.id,
            found_item_id=f_item.id,
            image_score=calc["image_score"],
            text_score=calc["text_score"],
            time_score=calc["time_score"],
            location_score=calc["location_score"],
            route_score=calc["route_score"],
            witness_score=calc["witness_score"],
            total_score=calc["total_score"],
            confidence_level=calc["confidence_level"],
            explanation=calc["explanation"],
            match_breakdown_json=json.dumps(calc["breakdown"])
        )
        ai_matches.append(m)

    db.add_all(ai_matches)
    db.commit()

    # 8. Create Demo Notifications
    notifications = [
        Notification(
            user_id=passenger.id,
            title="High Confidence Match Found",
            message="A 93.8% match was discovered for your Black Wildcraft Backpack at Erode Junction.",
            type="MATCH_FOUND",
            read=False,
            link_url=f"/journey/{flagship_lost.id}"
        ),
        Notification(
            user_id=passenger.id,
            title="Witness Sighting Corroborated",
            message="Passenger Priya Ramanathan reported seeing your backpack in Coach S3 near Tiruppur.",
            type="WITNESS_ADDED",
            read=False,
            link_url=f"/journey/{flagship_lost.id}"
        ),
        Notification(
            user_id=staff.id,
            title="Verification Required: Black Backpack",
            message="AI Match #1 requires staff verification before notifying passenger for recovery.",
            type="VERIFICATION_READY",
            read=False,
            link_url="/staff/verification"
        ),
        Notification(
            user_id=witness.id,
            title="Observation Connected to Active Case",
            message="Your observation on Train 12675 helped complete the journey reconstruction for a lost backpack.",
            type="INFO",
            read=True,
            link_url=f"/journey/{flagship_lost.id}"
        )
    ]
    db.add_all(notifications)
    db.commit()

    print("LostLink database successfully seeded with 10 Lost, 10 Found, 10 Witness reports, routes, and complete AI matches!")
