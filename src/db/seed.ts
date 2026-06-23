import "dotenv/config"
import { db } from "@/db";
import { reports } from "@/db/schema";
import { faker } from "@faker-js/faker";

const districts = ["Gasabo", "Kicukiro", "Nyarugenge"] as const;

const wasteTypes = [
    "Plastic",
    "E-Waste",
    "Organic",
    "Chemical",
    "Construction",
    "Mixed",
    "Other",
] as const;

const statuses = ["Reported", "In Progress", "Cleaned Up", "Archived"] as const;

function randomBetween(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateCoordinates(district: string) {
    const base = {
        Gasabo: { lat: -1.88, lng: 30.12 },
        Kicukiro: { lat: -1.97, lng: 30.14 },
        Nyarugenge: { lat: -1.95, lng: 30.06 },
    };

    return {
        latitude:
            base[district as keyof typeof base].lat + randomBetween(-0.03, 0.03),
        longitude:
            base[district as keyof typeof base].lng + randomBetween(-0.03, 0.03),
    };
}

function generateTitle(wasteType: string) {
    return `${wasteType} waste reported`;
}

export async function seedReports() {
    console.log("======================================");
    console.log("🌱 STARTING REPORT SEEDING PROCESS");
    console.log("======================================");

    const total = 50;

    const results = [];

    for (let i = 0; i < total; i++) {
        console.log(`\n[STEP ${i + 1}/${total}] Generating report...`);

        const district = pick(districts);
        const wasteType = pick(wasteTypes);
        const status = pick(statuses);
        const coords = generateCoordinates(district);

        const report = {
            title: generateTitle(wasteType),
            description: faker.lorem.sentences(2),
            wasteType,
            severityLevel: Math.floor(Math.random() * 5) + 1,
            latitude: coords.latitude.toFixed(6),
            longitude: coords.longitude.toFixed(6),
            nearestLandmark: faker.location.street(),
            districtName: district,
            reportedBy: Math.random() > 0.3 ? faker.person.fullName() : "Anonymous",
            status,
        };

        try {
            const inserted = await db.insert(reports).values(report).returning();

            results.push(inserted);

            console.log(
                `✅ Inserted: ${report.title} | ${district} | ${status}`
            );
        } catch (err) {
            console.error(`❌ Failed at step ${i + 1}:`, err);
        }
    }

    console.log("\n======================================");
    console.log("🎉 SEEDING COMPLETE");
    console.log(`📦 Total inserted: ${results.length}/${total}`);
    console.log("======================================");
}

// run directly
seedReports()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Fatal error during seeding:", err);
        process.exit(1);
    });