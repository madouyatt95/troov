export type SenegalCommune = {
    id: string;
    name: string;
    aliases?: string[];
};

export type SenegalDepartment = {
    id: string;
    name: string;
    communes: SenegalCommune[];
};

export type SenegalRegion = {
    id: string;
    name: string;
    departments: SenegalDepartment[];
};

const c = (id: string, name: string, aliases?: string[]): SenegalCommune => ({ id, name, aliases });

export const SENEGAL_LOCATIONS: SenegalRegion[] = [
    {
        id: 'DAKAR',
        name: 'Dakar',
        departments: [
            {
                id: 'DAKAR',
                name: 'Dakar',
                communes: [
                    c('DAKAR_PLATEAU', 'Dakar Plateau', ['Plateau']),
                    c('MEDINA', 'Médina'),
                    c('GUEULE_TAPEE_FASS_COLOBANE', 'Gueule Tapée-Fass-Colobane'),
                    c('GRAND_DAKAR', 'Grand Dakar'),
                    c('BISCUITERIE', 'Biscuiterie'),
                    c('HLM', 'HLM'),
                    c('HANN_BEL_AIR', 'Hann Bel-Air'),
                    c('MERMOZ_SACRE_COEUR', 'Mermoz-Sacré-Cœur'),
                    c('OUAKAM', 'Ouakam'),
                    c('YOFF', 'Yoff'),
                    c('NGOR', 'Ngor'),
                    c('PARCELLES_ASSAINIES', 'Parcelles Assainies'),
                    c('CAMBERENE', 'Cambérène'),
                ],
            },
            {
                id: 'PIKINE',
                name: 'Pikine',
                communes: [
                    c('PIKINE_EST', 'Pikine Est'),
                    c('PIKINE_OUEST', 'Pikine Ouest'),
                    c('PIKINE_NORD', 'Pikine Nord'),
                    c('DALIFORT', 'Dalifort'),
                    c('DJIDAH_THIAROYE_KAO', 'Djida Thiaroye Kao'),
                    c('GUINAW_RAIL_NORD', 'Guinaw Rail Nord'),
                    c('GUINAW_RAIL_SUD', 'Guinaw Rail Sud'),
                    c('THIAROYE_GARE', 'Thiaroye Gare'),
                    c('MBAO', 'Mbao'),
                ],
            },
            {
                id: 'GUEDIAWAYE',
                name: 'Guédiawaye',
                communes: [
                    c('GOLF_SUD', 'Golf Sud'),
                    c('SAM_NOTAIRE', 'Sam Notaire'),
                    c('NDIAREME_LIMAMOULAYE', 'Ndiarème Limamoulaye'),
                    c('WAKHINANE_NIMZATT', 'Wakhinane Nimzatt'),
                    c('MEDINA_GOUNASS', 'Médina Gounass'),
                ],
            },
            {
                id: 'RUFISQUE',
                name: 'Rufisque',
                communes: [
                    c('RUFISQUE_EST', 'Rufisque Est'),
                    c('RUFISQUE_OUEST', 'Rufisque Ouest'),
                    c('RUFISQUE_NORD', 'Rufisque Nord'),
                    c('BARGNY', 'Bargny'),
                    c('DIAMNIADIO', 'Diamniadio'),
                    c('SEBIKOTANE', 'Sébikotane'),
                    c('SANGALKAM', 'Sangalkam'),
                ],
            },
        ],
    },
    {
        id: 'THIES',
        name: 'Thiès',
        departments: [
            {
                id: 'THIES',
                name: 'Thiès',
                communes: [
                    c('THIES_NORD', 'Thiès Nord'),
                    c('THIES_EST', 'Thiès Est'),
                    c('THIES_OUEST', 'Thiès Ouest'),
                    c('KHOMBOLE', 'Khombole'),
                    c('POUT', 'Pout'),
                    c('KAYAR', 'Kayar'),
                ],
            },
            {
                id: 'MBOUR',
                name: 'Mbour',
                communes: [
                    c('MBOUR', 'Mbour'),
                    c('SALY_PORTUDAL', 'Saly Portudal'),
                    c('JOAL_FADIOUTH', 'Joal-Fadiouth'),
                    c('NGAPAROU', 'Ngaparou'),
                    c('SOMONE', 'Somone'),
                    c('POPOGUINE', 'Popenguine'),
                ],
            },
            {
                id: 'TIVAOUANE',
                name: 'Tivaouane',
                communes: [
                    c('TIVAOUANE', 'Tivaouane'),
                    c('MEKHE', 'Mékhé'),
                    c('MEOUANE', 'Méouane'),
                    c('MBORO', 'Mboro'),
                    c('PIRE_GOUREYE', 'Pire Gourèye'),
                ],
            },
        ],
    },
    {
        id: 'SAINT_LOUIS',
        name: 'Saint-Louis',
        departments: [
            {
                id: 'SAINT_LOUIS',
                name: 'Saint-Louis',
                communes: [c('SAINT_LOUIS', 'Saint-Louis'), c('GANDON', 'Gandon'), c('NDIEBENE_GANDIOLE', 'Ndiébène Gandiol')],
            },
            {
                id: 'DAGANA',
                name: 'Dagana',
                communes: [c('DAGANA', 'Dagana'), c('RICHARD_TOLL', 'Richard-Toll'), c('ROSS_BETHIO', 'Ross Béthio'), c('GAE', 'Gaé')],
            },
            {
                id: 'PODOR',
                name: 'Podor',
                communes: [c('PODOR', 'Podor'), c('NDIOUM', 'Ndioum'), c('GOLLERE', 'Golléré'), c('GUEDE_CHANTIER', 'Guédé Chantier')],
            },
        ],
    },
    {
        id: 'DIOURBEL',
        name: 'Diourbel',
        departments: [
            { id: 'DIOURBEL', name: 'Diourbel', communes: [c('DIOURBEL', 'Diourbel'), c('NDINDY', 'Ndindy'), c('TOURE_MBONDE', 'Touré Mbonde')] },
            { id: 'MBACKE', name: 'Mbacké', communes: [c('MBACKE', 'Mbacké'), c('TOUBA', 'Touba'), c('KAEL', 'Kael')] },
            { id: 'BAMBEY', name: 'Bambey', communes: [c('BAMBEY', 'Bambey'), c('LAMBAYE', 'Lambaye'), c('NGOYE', 'Ngoye')] },
        ],
    },
    {
        id: 'KAOLACK',
        name: 'Kaolack',
        departments: [
            { id: 'KAOLACK', name: 'Kaolack', communes: [c('KAOLACK', 'Kaolack'), c('KAHONE', 'Kahone'), c('NDIAFFATE', 'Ndiaffate')] },
            { id: 'NIORO_DU_RIP', name: 'Nioro du Rip', communes: [c('NIORO_DU_RIP', 'Nioro du Rip'), c('MEDINA_SABAKH', 'Médina Sabakh')] },
            { id: 'GUINGUINEO', name: 'Guinguinéo', communes: [c('GUINGUINEO', 'Guinguinéo'), c('FASS', 'Fass')] },
        ],
    },
    {
        id: 'FATICK',
        name: 'Fatick',
        departments: [
            { id: 'FATICK', name: 'Fatick', communes: [c('FATICK', 'Fatick'), c('DIAKHAO', 'Diakhao'), c('FIMELA', 'Fimela')] },
            { id: 'FOUNDIOUGNE', name: 'Foundiougne', communes: [c('FOUNDIOUGNE', 'Foundiougne'), c('SOKONE', 'Sokone'), c('PASSY', 'Passy')] },
            { id: 'GOSSAS', name: 'Gossas', communes: [c('GOSSAS', 'Gossas'), c('COLOBANE', 'Colobane')] },
        ],
    },
    {
        id: 'KOLDA',
        name: 'Kolda',
        departments: [
            { id: 'KOLDA', name: 'Kolda', communes: [c('KOLDA', 'Kolda'), c('DIALAMBERE', 'Dialambéré'), c('SARE_BIDJI', 'Saré Bidji')] },
            { id: 'VELINGARA', name: 'Vélingara', communes: [c('VELINGARA', 'Vélingara'), c('DIAOBE_KABENDOU', 'Diaobé-Kabendou')] },
            { id: 'MEDINA_YORO_FOULAH', name: 'Médina Yoro Foulah', communes: [c('MEDINA_YORO_FOULAH', 'Médina Yoro Foulah'), c('PATA', 'Pata')] },
        ],
    },
    {
        id: 'LOUGA',
        name: 'Louga',
        departments: [
            { id: 'LOUGA', name: 'Louga', communes: [c('LOUGA', 'Louga'), c('KEUR_MOMAR_SARR', 'Keur Momar Sarr'), c('SAKAL', 'Sakal')] },
            { id: 'LINGUERE', name: 'Linguère', communes: [c('LINGUERE', 'Linguère'), c('DAHRA', 'Dahra')] },
            { id: 'KEBEMER', name: 'Kébémer', communes: [c('KEBEMER', 'Kébémer'), c('GUEOUL', 'Guéoul')] },
        ],
    },
    {
        id: 'ZIGUINCHOR',
        name: 'Ziguinchor',
        departments: [
            { id: 'ZIGUINCHOR', name: 'Ziguinchor', communes: [c('ZIGUINCHOR', 'Ziguinchor'), c('NIAGUIS', 'Niaguis'), c('BOUTOUPA_CAMARACOUNDA', 'Boutoupa-Camaracounda')] },
            { id: 'BIGNONA', name: 'Bignona', communes: [c('BIGNONA', 'Bignona'), c('THIONCK_ESSYL', 'Thionck Essyl'), c('DIOULOULOU', 'Diouloulou')] },
            { id: 'OUSSOUYE', name: 'Oussouye', communes: [c('OUSSOUYE', 'Oussouye'), c('DIEMBERING', 'Diembéring'), c('MLOMP', 'Mlomp')] },
        ],
    },
    {
        id: 'TAMBACOUNDA',
        name: 'Tambacounda',
        departments: [
            { id: 'TAMBACOUNDA', name: 'Tambacounda', communes: [c('TAMBACOUNDA', 'Tambacounda'), c('MISSIRAH', 'Missirah')] },
            { id: 'BAKEL', name: 'Bakel', communes: [c('BAKEL', 'Bakel'), c('DIAWARA', 'Diawara')] },
            { id: 'GOUDIRY', name: 'Goudiry', communes: [c('GOUDIRY', 'Goudiry'), c('KOUSSANAR', 'Koussanar')] },
            { id: 'KOUMPENTOUM', name: 'Koumpentoum', communes: [c('KOUMPENTOUM', 'Koumpentoum'), c('MAKA_COULIBANTANG', 'Maka Coulibantang')] },
        ],
    },
    {
        id: 'MATAM',
        name: 'Matam',
        departments: [
            { id: 'MATAM', name: 'Matam', communes: [c('MATAM', 'Matam'), c('OUROSSOGUI', 'Ourossogui')] },
            { id: 'KANEL', name: 'Kanel', communes: [c('KANEL', 'Kanel'), c('SEMME', 'Semmé')] },
            { id: 'RANEROU_FERLO', name: 'Ranérou-Ferlo', communes: [c('RANEROU', 'Ranérou'), c('VELINGARA_FERLO', 'Vélingara Ferlo')] },
        ],
    },
    {
        id: 'KAFFRINE',
        name: 'Kaffrine',
        departments: [
            { id: 'KAFFRINE', name: 'Kaffrine', communes: [c('KAFFRINE', 'Kaffrine'), c('NGANDA', 'Nganda')] },
            { id: 'BIRKELANE', name: 'Birkilane', communes: [c('BIRKELANE', 'Birkilane'), c('KEUR_MBOUCKI', 'Keur Mboucki')] },
            { id: 'KOUNGHEUL', name: 'Koungheul', communes: [c('KOUNGHEUL', 'Koungheul'), c('IDA_MOURIDE', 'Ida Mouride')] },
            { id: 'MALEM_HODAR', name: 'Malem Hodar', communes: [c('MALEM_HODAR', 'Malem Hodar'), c('SAGNA', 'Sagna')] },
        ],
    },
    {
        id: 'KEDOUGOU',
        name: 'Kédougou',
        departments: [
            { id: 'KEDOUGOU', name: 'Kédougou', communes: [c('KEDOUGOU', 'Kédougou'), c('DIMBOLI', 'Dimboli')] },
            { id: 'SALEMATA', name: 'Salémata', communes: [c('SALEMATA', 'Salémata'), c('DAKATELI', 'Dakatéli')] },
            { id: 'SARAYA', name: 'Saraya', communes: [c('SARAYA', 'Saraya'), c('SABODALA', 'Sabodala')] },
        ],
    },
    {
        id: 'SEDHIOU',
        name: 'Sédhiou',
        departments: [
            { id: 'SEDHIOU', name: 'Sédhiou', communes: [c('SEDHIOU', 'Sédhiou'), c('DIENDE', 'Diendé')] },
            { id: 'BOUNKILING', name: 'Bounkiling', communes: [c('BOUNKILING', 'Bounkiling'), c('MADINA_WANDIFA', 'Madina Wandifa')] },
            { id: 'GOUDOMP', name: 'Goudomp', communes: [c('GOUDOMP', 'Goudomp'), c('DIOUBOUDOU', 'Diouboudou')] },
        ],
    },
];

export function getRegions() {
    return SENEGAL_LOCATIONS.map(({ id, name }) => ({ id, name }));
}

export function getDepartments(regionId?: string) {
    const region = regionId ? SENEGAL_LOCATIONS.find((item) => item.id === regionId) : null;
    const departments = region
        ? region.departments
        : SENEGAL_LOCATIONS.flatMap((item) => item.departments.map((department) => ({ ...department, regionId: item.id, regionName: item.name })));

    return departments.map((department) => ({
        id: department.id,
        name: department.name,
        regionId: 'regionId' in department ? department.regionId : regionId,
        regionName: 'regionName' in department ? department.regionName : region?.name,
    }));
}

export function getCommunes(departmentId?: string, regionId?: string) {
    const regions = regionId ? SENEGAL_LOCATIONS.filter((region) => region.id === regionId) : SENEGAL_LOCATIONS;
    const departments = regions.flatMap((region) =>
        region.departments.map((department) => ({
            ...department,
            regionId: region.id,
            regionName: region.name,
        }))
    );

    const selectedDepartments = departmentId ? departments.filter((department) => department.id === departmentId) : departments;

    return selectedDepartments.flatMap((department) =>
        department.communes.map((commune) => ({
            ...commune,
            departmentId: department.id,
            departmentName: department.name,
            regionId: department.regionId,
            regionName: department.regionName,
        }))
    );
}
