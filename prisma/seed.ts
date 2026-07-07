import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type DepositPointSeed = {
    id: string;
    name: string;
    type: 'ADMIN' | 'POLICE' | 'CITY_HALL' | 'PARTNER';
    address: string;
    latitude: number;
    longitude: number;
    region: string;
    department: string;
    operator?: string;
    phone?: string;
    hours: string;
};

const depositPoints: DepositPointSeed[] = [
    {
        id: 'sn-dakar-plateau-prefecture',
        name: 'Préfecture de Dakar Plateau',
        type: 'ADMIN',
        address: 'Avenue Léopold Sédar Senghor, Dakar Plateau',
        latitude: 14.6681,
        longitude: -17.4358,
        region: 'DAKAR',
        department: 'Dakar',
        hours: '08:00-16:00 Lun-Ven',
    },
    {
        id: 'sn-dakar-plateau-mairie',
        name: 'Mairie de Dakar',
        type: 'CITY_HALL',
        address: 'Place de l’Indépendance, Dakar Plateau',
        latitude: 14.6672,
        longitude: -17.4339,
        region: 'DAKAR',
        department: 'Dakar',
        hours: '08:00-16:00 Lun-Ven',
    },
    {
        id: 'sn-dakar-medina-mairie',
        name: 'Mairie de Médina',
        type: 'CITY_HALL',
        address: 'Avenue Blaise Diagne, Médina, Dakar',
        latitude: 14.6829,
        longitude: -17.4518,
        region: 'DAKAR',
        department: 'Dakar',
        hours: '08:00-15:30 Lun-Ven',
    },
    {
        id: 'sn-dakar-yoff-mairie',
        name: 'Mairie de Yoff',
        type: 'CITY_HALL',
        address: 'Route de l’Aéroport, Yoff, Dakar',
        latitude: 14.7607,
        longitude: -17.4730,
        region: 'DAKAR',
        department: 'Dakar',
        hours: '08:00-15:30 Lun-Ven',
    },
    {
        id: 'sn-dakar-parcelles-centre-etat-civil',
        name: 'Centre d’état civil des Parcelles Assainies',
        type: 'ADMIN',
        address: 'Unité 17, Parcelles Assainies, Dakar',
        latitude: 14.7609,
        longitude: -17.4303,
        region: 'DAKAR',
        department: 'Dakar',
        hours: '08:00-15:30 Lun-Ven',
    },
    {
        id: 'sn-pikine-commissariat-central',
        name: 'Commissariat central de Pikine',
        type: 'POLICE',
        address: 'Rue PK-12, Pikine',
        latitude: 14.7537,
        longitude: -17.3908,
        region: 'DAKAR',
        department: 'Pikine',
        hours: '08:00-18:00 Lun-Sam',
    },
    {
        id: 'sn-pikine-mairie',
        name: 'Mairie de Pikine',
        type: 'CITY_HALL',
        address: 'Pikine Rue 10, Pikine',
        latitude: 14.7552,
        longitude: -17.3975,
        region: 'DAKAR',
        department: 'Pikine',
        hours: '08:00-16:00 Lun-Ven',
    },
    {
        id: 'sn-guediawaye-commissariat-central',
        name: 'Commissariat central de Guédiawaye',
        type: 'POLICE',
        address: 'Wakhinane Nimzatt, Guédiawaye',
        latitude: 14.7806,
        longitude: -17.3732,
        region: 'DAKAR',
        department: 'Guédiawaye',
        hours: '08:00-18:00 Lun-Sam',
    },
    {
        id: 'sn-guediawaye-mairie',
        name: 'Ville de Guédiawaye',
        type: 'CITY_HALL',
        address: 'Centre-ville, Guédiawaye',
        latitude: 14.7754,
        longitude: -17.3974,
        region: 'DAKAR',
        department: 'Guédiawaye',
        hours: '08:00-16:00 Lun-Ven',
    },
    {
        id: 'sn-rufisque-prefecture',
        name: 'Préfecture de Rufisque',
        type: 'ADMIN',
        address: 'Centre-ville, Rufisque',
        latitude: 14.7167,
        longitude: -17.2736,
        region: 'DAKAR',
        department: 'Rufisque',
        hours: '08:00-16:00 Lun-Ven',
    },
    {
        id: 'sn-rufisque-commissariat',
        name: 'Commissariat central de Rufisque',
        type: 'POLICE',
        address: 'Avenue Maurice Guèye, Rufisque',
        latitude: 14.7157,
        longitude: -17.2706,
        region: 'DAKAR',
        department: 'Rufisque',
        hours: '08:00-18:00 Lun-Sam',
    },
    {
        id: 'sn-thies-prefecture',
        name: 'Préfecture de Thiès',
        type: 'ADMIN',
        address: 'Avenue Léopold Sédar Senghor, Thiès',
        latitude: 14.7886,
        longitude: -16.9260,
        region: 'THIES',
        department: 'Thiès',
        hours: '08:00-16:00 Lun-Ven',
    },
    {
        id: 'sn-thies-mairie',
        name: 'Mairie de Thiès',
        type: 'CITY_HALL',
        address: 'Centre-ville, Thiès',
        latitude: 14.7910,
        longitude: -16.9310,
        region: 'THIES',
        department: 'Thiès',
        hours: '08:00-16:00 Lun-Ven',
    },
    {
        id: 'sn-thies-commissariat-central',
        name: 'Commissariat central de Thiès',
        type: 'POLICE',
        address: 'Quartier Dixième, Thiès',
        latitude: 14.7842,
        longitude: -16.9349,
        region: 'THIES',
        department: 'Thiès',
        hours: '08:00-18:00 Lun-Sam',
    },
    {
        id: 'sn-mbour-commissariat',
        name: 'Commissariat urbain de Mbour',
        type: 'POLICE',
        address: 'Centre-ville, Mbour',
        latitude: 14.4202,
        longitude: -16.9646,
        region: 'THIES',
        department: 'Mbour',
        hours: '08:00-18:00 Lun-Sam',
    },
    {
        id: 'sn-saint-louis-prefecture',
        name: 'Préfecture de Saint-Louis',
        type: 'ADMIN',
        address: 'Île de Saint-Louis',
        latitude: 16.0326,
        longitude: -16.5080,
        region: 'SAINT_LOUIS',
        department: 'Saint-Louis',
        hours: '08:00-16:00 Lun-Ven',
    },
    {
        id: 'sn-saint-louis-mairie',
        name: 'Mairie de Saint-Louis',
        type: 'CITY_HALL',
        address: 'Place Faidherbe, Saint-Louis',
        latitude: 16.0200,
        longitude: -16.5000,
        region: 'SAINT_LOUIS',
        department: 'Saint-Louis',
        hours: '08:00-16:00 Lun-Ven',
    },
    {
        id: 'sn-kaolack-prefecture',
        name: 'Préfecture de Kaolack',
        type: 'ADMIN',
        address: 'Centre-ville, Kaolack',
        latitude: 14.1383,
        longitude: -16.0758,
        region: 'KAOLACK',
        department: 'Kaolack',
        hours: '08:00-16:00 Lun-Ven',
    },
    {
        id: 'sn-ziguinchor-prefecture',
        name: 'Préfecture de Ziguinchor',
        type: 'ADMIN',
        address: 'Centre-ville, Ziguinchor',
        latitude: 12.5833,
        longitude: -16.2719,
        region: 'ZIGUINCHOR',
        department: 'Ziguinchor',
        hours: '08:00-16:00 Lun-Ven',
    },
    {
        id: 'sn-diourbel-prefecture',
        name: 'Préfecture de Diourbel',
        type: 'ADMIN',
        address: 'Centre-ville, Diourbel',
        latitude: 14.6500,
        longitude: -16.2333,
        region: 'DIOURBEL',
        department: 'Diourbel',
        hours: '08:00-16:00 Lun-Ven',
    },
    {
        id: 'sn-louga-prefecture',
        name: 'Préfecture de Louga',
        type: 'ADMIN',
        address: 'Centre-ville, Louga',
        latitude: 15.6167,
        longitude: -16.2167,
        region: 'LOUGA',
        department: 'Louga',
        hours: '08:00-16:00 Lun-Ven',
    },
    {
        id: 'sn-fatick-prefecture',
        name: 'Préfecture de Fatick',
        type: 'ADMIN',
        address: 'Centre-ville, Fatick',
        latitude: 14.3333,
        longitude: -16.4000,
        region: 'FATICK',
        department: 'Fatick',
        hours: '08:00-16:00 Lun-Ven',
    },
];

async function main() {
    console.log('Seeding SenDocu deposit points...');

    for (const point of depositPoints) {
        await prisma.depositPoint.upsert({
            where: { id: point.id },
            update: {
                name: point.name,
                type: point.type,
                address: point.address,
                latitude: point.latitude,
                longitude: point.longitude,
                region: point.region,
                department: point.department,
                operator: point.operator ?? null,
                phone: point.phone ?? null,
                hours: point.hours,
                isActive: true,
            },
            create: {
                ...point,
                operator: point.operator ?? null,
                phone: point.phone ?? null,
                isActive: true,
            },
        });
    }

    console.log(`Seeded ${depositPoints.length} SenDocu deposit points`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
