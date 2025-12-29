// Database seed script for initial deposit points
// Run with: npx ts-node prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const depositPoints = [
    // Dakar - Administrative
    {
        name: 'Préfecture de Dakar',
        type: 'ADMIN',
        address: 'Avenue Léopold Sédar Senghor, Dakar Plateau',
        latitude: 14.6655,
        longitude: -17.4360,
        region: 'DAKAR',
        phone: '+221 33 849 27 00',
        hours: '8h-16h Lun-Ven'
    },
    {
        name: 'Mairie de Dakar',
        type: 'ADMIN',
        address: 'Place de l\'Indépendance, Dakar',
        latitude: 14.6657,
        longitude: -17.4381,
        region: 'DAKAR',
        phone: '+221 33 821 09 81',
        hours: '8h-16h Lun-Ven'
    },
    {
        name: 'Sous-Préfecture Grand Dakar',
        type: 'ADMIN',
        address: 'Grand Dakar, Dakar',
        latitude: 14.7080,
        longitude: -17.4470,
        region: 'DAKAR',
        hours: '8h-16h Lun-Ven'
    },
    {
        name: 'Centre d\'État Civil Parcelles Assainies',
        type: 'ADMIN',
        address: 'Parcelles Assainies, Dakar',
        latitude: 14.7640,
        longitude: -17.4180,
        region: 'DAKAR',
        hours: '8h-14h Lun-Ven'
    },
    {
        name: 'Centre d\'État Civil Pikine',
        type: 'ADMIN',
        address: 'Pikine, Dakar',
        latitude: 14.7570,
        longitude: -17.3960,
        region: 'DAKAR',
        hours: '8h-14h Lun-Ven'
    },
    // Thiès
    {
        name: 'Préfecture de Thiès',
        type: 'ADMIN',
        address: 'Avenue Léopold Senghor, Thiès',
        latitude: 14.7886,
        longitude: -16.9260,
        region: 'THIES',
        phone: '+221 33 951 10 13',
        hours: '8h-16h Lun-Ven'
    },
    {
        name: 'Mairie de Thiès',
        type: 'ADMIN',
        address: 'Centre-ville, Thiès',
        latitude: 14.7910,
        longitude: -16.9310,
        region: 'THIES',
        hours: '8h-16h Lun-Ven'
    },
    // Saint-Louis
    {
        name: 'Préfecture de Saint-Louis',
        type: 'ADMIN',
        address: 'Île de Saint-Louis',
        latitude: 16.0326,
        longitude: -16.5080,
        region: 'SAINT_LOUIS',
        phone: '+221 33 961 10 56',
        hours: '8h-16h Lun-Ven'
    },
    {
        name: 'Mairie de Saint-Louis',
        type: 'ADMIN',
        address: 'Place Faidherbe, Saint-Louis',
        latitude: 16.0200,
        longitude: -16.5000,
        region: 'SAINT_LOUIS',
        hours: '8h-16h Lun-Ven'
    },
    // Kaolack
    {
        name: 'Préfecture de Kaolack',
        type: 'ADMIN',
        address: 'Centre-ville, Kaolack',
        latitude: 14.1383,
        longitude: -16.0758,
        region: 'KAOLACK',
        hours: '8h-16h Lun-Ven'
    },
    // Ziguinchor
    {
        name: 'Préfecture de Ziguinchor',
        type: 'ADMIN',
        address: 'Centre-ville, Ziguinchor',
        latitude: 12.5833,
        longitude: -16.2719,
        region: 'ZIGUINCHOR',
        hours: '8h-16h Lun-Ven'
    },
    // Diourbel
    {
        name: 'Préfecture de Diourbel',
        type: 'ADMIN',
        address: 'Centre-ville, Diourbel',
        latitude: 14.6500,
        longitude: -16.2333,
        region: 'DIOURBEL',
        hours: '8h-16h Lun-Ven'
    },
    // Fatick
    {
        name: 'Préfecture de Fatick',
        type: 'ADMIN',
        address: 'Centre-ville, Fatick',
        latitude: 14.3333,
        longitude: -16.4000,
        region: 'FATICK',
        hours: '8h-16h Lun-Ven'
    },
    // Kolda
    {
        name: 'Préfecture de Kolda',
        type: 'ADMIN',
        address: 'Centre-ville, Kolda',
        latitude: 12.8833,
        longitude: -14.9500,
        region: 'KOLDA',
        hours: '8h-16h Lun-Ven'
    },
    // Louga
    {
        name: 'Préfecture de Louga',
        type: 'ADMIN',
        address: 'Centre-ville, Louga',
        latitude: 15.6167,
        longitude: -16.2167,
        region: 'LOUGA',
        hours: '8h-16h Lun-Ven'
    }
];

async function main() {
    console.log('🌱 Seeding database...');

    for (const point of depositPoints) {
        await prisma.depositPoint.upsert({
            where: { id: point.name.toLowerCase().replace(/\s/g, '-').slice(0, 36) },
            update: point,
            create: {
                ...point,
                id: undefined // Let Prisma generate UUID
            }
        });
    }

    console.log(`✅ Seeded ${depositPoints.length} deposit points`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
